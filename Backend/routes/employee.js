const express = require("express");
const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");
const Doctor = require("../models/Doctor");
const Activity = require("../models/Activity");
const Otp = require("../models/Otp");
const EmployeeLocation = require("../models/EmployeeLocation");
const Notification = require("../models/Notification");
const auth = require("../middleware/auth");
const { hashPassword, verifyPassword, verifyOtp } = require("../utils/password");
const { nextSequence, setSequence } = require("../utils/counter");
const { configureCloudinary, uploadBuffer } = require("../utils/cloudinary");
const { getIo } = require("../utils/socket");
const multer = require("multer");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const consumeOtp = async (email, purpose, code) => {
  const otp = await Otp.findOne({ email, purpose });
  if (!otp || otp.expiresAt < new Date()) {
    return { ok: false, status: 400, message: "OTP expired or invalid" };
  }

  otp.attempts += 1;
  if (otp.attempts > 5) {
    await Otp.deleteOne({ _id: otp._id });
    return { ok: false, status: 429, message: "Too many attempts" };
  }
  await otp.save();

  const valid = await verifyOtp(code, otp.codeHash);
  if (!valid) {
    return { ok: false, status: 400, message: "OTP invalid" };
  }

  await Otp.deleteOne({ _id: otp._id });
  return { ok: true };
};

const signToken = (employee) =>
  jwt.sign({ id: employee._id, role: "employee", name: employee.name }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

router.post("/login", async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const employee = await Employee.findOne({ email });
    if (!employee || employee.status !== "active") {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // OTP is optional now; verify only when provided.
    if (otp) {
      const otpResult = await consumeOtp(email, "login", otp);
      if (!otpResult.ok) {
        return res.status(otpResult.status).json({ message: otpResult.message });
      }
    }

    const ok = await verifyPassword(password, employee.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      token: signToken(employee),
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        joiningDate: employee.joiningDate,
        currentSalary: employee.currentSalary,
        territoryName: employee.territoryName,
        designation: employee.designation,
        department: employee.department,
        managerName: employee.managerName,
        status: employee.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to login" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password, otp, empCode } = req.body;
    if (!name || !email || !password || !otp || !empCode) {
      return res.status(400).json({ message: "Name, email, password, otp, and employee code are required" });
    }

    if (empCode !== process.env.EMP_CODE) {
      return res.status(403).json({ message: "Invalid employee code" });
    }

    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const otpResult = await consumeOtp(email, "signup", otp);
    if (!otpResult.ok) {
      return res.status(otpResult.status).json({ message: otpResult.message });
    }

    const passwordHash = await hashPassword(password);
    const employee = await Employee.create({
      name,
      email,
      phone,
      passwordHash,
    });

    return res.status(201).json({
      token: signToken(employee),
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        status: employee.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create employee" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { name, email, phone, password, otp, empCode } = req.body;
    if (!name || !email || !password || !otp || !empCode) {
      return res.status(400).json({ message: "Name, email, password, otp, and employee code are required" });
    }

    if (empCode !== process.env.EMP_CODE) {
      return res.status(403).json({ message: "Invalid employee code" });
    }

    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const otpResult = await consumeOtp(email, "signup", otp);
    if (!otpResult.ok) {
      return res.status(otpResult.status).json({ message: otpResult.message });
    }

    const passwordHash = await hashPassword(password);
    const employee = await Employee.create({
      name,
      email,
      phone,
      passwordHash,
    });

    return res.status(201).json({
      token: signToken(employee),
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        status: employee.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create employee" });
  }
});

router.get("/me", auth(["employee"]), async (req, res) => {
  try {
    const employee = await Employee.findById(req.user.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    return res.json({
      employee: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        employeeId: employee.employeeId,
        joiningDate: employee.joiningDate,
        currentSalary: employee.currentSalary,
        territoryName: employee.territoryName,
        designation: employee.designation,
        department: employee.department,
        managerName: employee.managerName,
        status: employee.status,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch employee" });
  }
});

router.get("/doctors", auth(["employee"]), async (req, res) => {
  try {
    const query = (req.query.query || "").trim();
    const filter = { createdBy: req.user.id };
    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }
    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    return res.json({ doctors });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch doctors" });
  }
});

router.post("/doctors", auth(["employee"]), async (req, res) => {
  try {
    const { name, speciality, phone, email, clinicName, address, city, state, pincode, notes } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: "Doctor name and phone are required" });
    }
    const counterKey = `doctor:${req.user.id}`;
    const currentCount = await Doctor.countDocuments({ createdBy: req.user.id });
    if (currentCount === 0) {
      await setSequence(counterKey, 0);
    }
    const serialNumber = await nextSequence(counterKey);
    const doctor = await Doctor.create({
      serialNumber,
      name,
      speciality,
      phone,
      email,
      clinicName,
      address,
      city,
      state,
      pincode,
      notes,
      createdBy: req.user.id,
    });
    return res.status(201).json({ doctor });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create doctor" });
  }
});

router.patch("/doctors/:id", auth(["employee"]), async (req, res) => {
  return res.status(403).json({ message: "Only admins can edit doctors" });
});

router.delete("/doctors/:id", auth(["employee"]), async (req, res) => {
  return res.status(403).json({ message: "Only admins can delete doctors" });
});

router.get("/activities", auth(["employee"]), async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const activities = await Activity.find({ employee: req.user.id })
      .sort({ visitedAt: -1 })
      .limit(limit);
    return res.json({ activities });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch activities" });
  }
});

router.post("/activities", auth(["employee"]), async (req, res) => {
  try {
    const { doctorId, doctorName, speciality, phone, address, visitedAt, followUpDate, notes, photoUrl, photoPublicId } =
      req.body;
    if (!doctorId && !doctorName) {
      return res.status(400).json({ message: "Doctor is required" });
    }

    const doctor = doctorId ? await Doctor.findOne({ _id: doctorId, createdBy: req.user.id }) : null;
    const snapshot = doctor
      ? {
          name: doctor.name,
          speciality: doctor.speciality,
          phone: doctor.phone,
          address: doctor.address,
        }
      : {
          name: doctorName,
          speciality,
          phone,
          address,
        };

    const activity = await Activity.create({
      employee: req.user.id,
      doctor: doctor ? doctor._id : undefined,
      doctorSnapshot: snapshot,
      visitedAt: visitedAt ? new Date(visitedAt) : new Date(),
      followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      notes,
      photoUrl,
      photoPublicId,
    });
    return res.status(201).json({ activity });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create activity" });
  }
});

router.delete("/activities/:id", auth(["employee"]), async (req, res) => {
  return res.status(403).json({ message: "Only admins can delete activities" });
});

router.get("/activities/calendar", auth(["employee"]), async (req, res) => {
  try {
    const month = String(req.query.month || "");
    const [yearStr, monthStr] = month.split("-");
    const year = Number(yearStr);
    const monthIndex = Number(monthStr) - 1;
    if (!year || monthIndex < 0 || monthIndex > 11) {
      return res.status(400).json({ message: "Invalid month format. Use YYYY-MM." });
    }
    const start = new Date(Date.UTC(year, monthIndex, 1));
    const end = new Date(Date.UTC(year, monthIndex + 1, 1));

    const activities = await Activity.find({
      employee: req.user.id,
      visitedAt: { $gte: start, $lt: end },
    }).sort({ visitedAt: 1 });

    const days = {};
    activities.forEach((item) => {
      const dateKey = item.visitedAt.toISOString().slice(0, 10);
      if (!days[dateKey]) {
        days[dateKey] = { date: dateKey, count: 0, items: [] };
      }
      days[dateKey].count += 1;
      days[dateKey].items.push({
        id: item._id,
        doctorName: item.doctorSnapshot?.name || "Doctor",
        time: item.visitedAt.toISOString(),
      });
    });

    return res.json({ days: Object.values(days) });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch calendar" });
  }
});

router.post("/uploads", auth(["employee"]), upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }
    configureCloudinary();
    const result = await uploadBuffer(req.file.buffer, {
      folder: "soul-pharma/activities",
      resource_type: "image",
    });
    return res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    return res.status(500).json({ message: "Unable to upload image", detail: error?.message });
  }
});

router.post("/locations", auth(["employee"]), async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      accuracy,
      altitude,
      speed,
      heading,
      capturedAt,
      device,
      battery,
      network,
      source,
    } = req.body;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({ message: "Latitude and longitude are required" });
    }

    const location = await EmployeeLocation.create({
      employee: req.user.id,
      latitude,
      longitude,
      accuracy,
      altitude,
      speed,
      heading,
      capturedAt: capturedAt ? new Date(capturedAt) : undefined,
      device,
      battery,
      network,
      source: source || "watchPosition",
    });

    const io = getIo();
    if (io) {
      io.to("admins").emit("location:update", {
        id: location._id,
        employeeId: req.user.id,
        employeeName: req.user.name,
        latitude,
        longitude,
        accuracy,
        capturedAt: location.capturedAt,
        receivedAt: location.receivedAt,
        battery,
      });
    }

    return res.status(201).json({ id: location._id });
  } catch (error) {
    return res.status(500).json({ message: "Unable to store location" });
  }
});

router.get("/notifications", auth(["employee"]), async (req, res) => {
  try {
    const notifications = await Notification.find({
      $or: [{ employee: req.user.id }, { employee: { $exists: false } }, { employee: null }],
    })
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch notifications" });
  }
});

module.exports = router;
