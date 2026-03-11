const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Employee = require("../models/Employee");
const News = require("../models/News");
const FocusArea = require("../models/FocusArea");
const FormResponse = require("../models/FormResponse");
const Doctor = require("../models/Doctor");
const Activity = require("../models/Activity");
const auth = require("../middleware/auth");
const { hashPassword, verifyPassword } = require("../utils/password");
const { nextSequence } = require("../utils/counter");

const router = express.Router();

const requireAdminRoute = (req, res, next) => {
  const gate = process.env.ADMIN_ROUTE_KEY;
  if (!gate) {
    return next();
  }
  const token = req.headers["x-admin-route"];
  if (token !== gate) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
};

const signToken = (admin) =>
  jwt.sign({ id: admin._id, role: "admin", name: admin.name }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

router.post("/login", requireAdminRoute, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await verifyPassword(password, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      token: signToken(admin),
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to login" });
  }
});

router.post("/employees", auth(["admin"]), async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      joiningDate,
      currentSalary,
      territoryName,
      designation,
      department,
      managerName,
    } = req.body;

    if (!name || !email || !password || !joiningDate || !currentSalary || !territoryName || !designation) {
      return res.status(400).json({ message: "Missing required employee fields" });
    }

    const existing = await Employee.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Employee email already exists" });
    }

    const passwordHash = await hashPassword(password);
    const employee = await Employee.create({
      name,
      email,
      passwordHash,
      employeeId,
      joiningDate,
      currentSalary,
      territoryName,
      designation,
      department,
      managerName,
    });

    return res.status(201).json({
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
    return res.status(500).json({ message: "Unable to create employee" });
  }
});

router.get("/employees", auth(["admin"]), async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    return res.json({ employees });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch employees" });
  }
});

router.get("/employees/:id", auth(["admin"]), async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch employee" });
  }
});

router.patch("/employees/:id", auth(["admin"]), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.passwordHash = await hashPassword(updates.password);
      delete updates.password;
    }
    const employee = await Employee.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    return res.json({ employee });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update employee" });
  }
});

router.delete("/employees/:id", auth(["admin"]), async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    return res.json({ message: "Employee deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete employee" });
  }
});

router.get("/news", auth(["admin"]), async (req, res) => {
  try {
    const items = await News.find().sort({ publishedAt: -1, createdAt: -1 });
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch news" });
  }
});

router.post("/news", auth(["admin"]), async (req, res) => {
  try {
    const { title, summary, imageUrl, category, publishedAt, isFeatured } = req.body;
    if (!title || !summary || !publishedAt) {
      return res.status(400).json({ message: "Title, summary, and publishedAt are required" });
    }
    const item = await News.create({ title, summary, imageUrl, category, publishedAt, isFeatured });
    return res.status(201).json({ item });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create news" });
  }
});

router.patch("/news/:id", auth(["admin"]), async (req, res) => {
  try {
    const item = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) {
      return res.status(404).json({ message: "News not found" });
    }
    return res.json({ item });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update news" });
  }
});

router.delete("/news/:id", auth(["admin"]), async (req, res) => {
  try {
    const item = await News.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "News not found" });
    }
    return res.json({ message: "News deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete news" });
  }
});

router.get("/focus-areas", auth(["admin"]), async (req, res) => {
  try {
    const items = await FocusArea.find().sort({ order: 1, createdAt: 1 });
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch focus areas" });
  }
});

router.get("/forms", auth(["admin"]), async (req, res) => {
  try {
    const responses = await FormResponse.find().sort({ createdAt: -1 });
    return res.json({ responses });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch form responses" });
  }
});

router.get("/doctors", auth(["admin"]), async (req, res) => {
  try {
    const employeeId = req.query.employeeId;
    const query = (req.query.query || "").trim();
    const filter = employeeId ? { createdBy: employeeId } : {};
    if (query) {
      filter.name = { $regex: query, $options: "i" };
    }
    const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
    return res.json({ doctors });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch doctors" });
  }
});

router.post("/doctors", auth(["admin"]), async (req, res) => {
  try {
    const { employeeId, name, speciality, phone, email, clinicName, address, city, state, pincode, notes } = req.body;
    if (!employeeId || !name || !phone) {
      return res.status(400).json({ message: "Employee, doctor name, and phone are required" });
    }
    const serialNumber = await nextSequence(`doctor:${employeeId}`);
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
      createdBy: employeeId,
    });
    return res.status(201).json({ doctor });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create doctor" });
  }
});

router.patch("/doctors/:id", auth(["admin"]), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    return res.json({ doctor });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update doctor" });
  }
});

router.delete("/doctors/:id", auth(["admin"]), async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    return res.json({ message: "Doctor deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete doctor" });
  }
});

router.get("/activities", auth(["admin"]), async (req, res) => {
  try {
    const employeeId = req.query.employeeId;
    const from = req.query.from ? new Date(req.query.from) : null;
    const to = req.query.to ? new Date(req.query.to) : null;
    const filter = employeeId ? { employee: employeeId } : {};
    if (from || to) {
      filter.visitedAt = {};
      if (from) filter.visitedAt.$gte = from;
      if (to) filter.visitedAt.$lte = to;
    }
    const activities = await Activity.find(filter).sort({ visitedAt: -1 }).limit(200);
    return res.json({ activities });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch activities" });
  }
});

router.patch("/activities/:id", auth(["admin"]), async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    return res.json({ activity });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update activity" });
  }
});

router.delete("/activities/:id", auth(["admin"]), async (req, res) => {
  try {
    const activity = await Activity.findByIdAndDelete(req.params.id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    return res.json({ message: "Activity deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete activity" });
  }
});

router.post("/focus-areas", auth(["admin"]), async (req, res) => {
  try {
    const { title, subtitle, imageUrl, medicines, order } = req.body;
    if (!title || !subtitle || !imageUrl) {
      return res.status(400).json({ message: "Title, subtitle, and imageUrl are required" });
    }
    const item = await FocusArea.create({ title, subtitle, imageUrl, medicines, order });
    return res.status(201).json({ item });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create focus area" });
  }
});

router.patch("/focus-areas/:id", auth(["admin"]), async (req, res) => {
  try {
    const item = await FocusArea.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) {
      return res.status(404).json({ message: "Focus area not found" });
    }
    return res.json({ item });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update focus area" });
  }
});

router.delete("/focus-areas/:id", auth(["admin"]), async (req, res) => {
  try {
    const item = await FocusArea.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Focus area not found" });
    }
    return res.json({ message: "Focus area deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete focus area" });
  }
});

module.exports = router;
