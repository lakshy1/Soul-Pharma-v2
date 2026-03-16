const express = require("express");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Employee = require("../models/Employee");
const News = require("../models/News");
const FocusArea = require("../models/FocusArea");
const FormResponse = require("../models/FormResponse");
const Doctor = require("../models/Doctor");
const Activity = require("../models/Activity");
const EmployeeLocation = require("../models/EmployeeLocation");
const Notification = require("../models/Notification");
const Expense = require("../models/Expense");
const EmployeeExpense = require("../models/EmployeeExpense");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const XLSX = require("xlsx");
const auth = require("../middleware/auth");
const { hashPassword, verifyPassword } = require("../utils/password");
const { nextSequence, setSequence } = require("../utils/counter");
const { getIo } = require("../utils/socket");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

const reindexDoctorSerials = async (employeeId) => {
  const doctors = await Doctor.find({ createdBy: employeeId }).sort({ createdAt: 1 });
  if (!doctors.length) {
    await setSequence(`doctor:${employeeId}`, 0);
    return;
  }

  const tempUpdates = doctors.map((doc, index) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: { serialNumber: -(index + 1) } },
    },
  }));
  await Doctor.bulkWrite(tempUpdates, { ordered: true });

  const finalUpdates = doctors.map((doc, index) => ({
    updateOne: {
      filter: { _id: doc._id },
      update: { $set: { serialNumber: index + 1 } },
    },
  }));
  await Doctor.bulkWrite(finalUpdates, { ordered: true });
  await setSequence(`doctor:${employeeId}`, doctors.length);
};

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

router.get("/expenses", auth(["admin"]), async (req, res) => {
  try {
    const month = (req.query.month || "").trim();
    if (!month) {
      return res.status(400).json({ message: "Month is required (YYYY-MM)." });
    }
    const expenses = await Expense.find({ month }).sort({ updatedAt: -1 });
    return res.json({ expenses });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch expenses" });
  }
});

router.get("/expenses/summary", auth(["admin"]), async (req, res) => {
  try {
    const months = Math.min(Number(req.query.months || 6), 24);
    const startMonth = Math.min(Math.max(Number(req.query.startMonth || 0), 0), 12);
    const now = new Date();
    let monthKeys = Array.from({ length: months }).map((_, idx) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (months - 1 - idx), 1);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    });
    if (startMonth >= 1 && startMonth <= 12) {
      const currentYear = now.getFullYear();
      const startDate = new Date(currentYear, startMonth - 1, 1);
      monthKeys = Array.from({ length: months }).map((_, idx) => {
        const date = new Date(startDate.getFullYear(), startDate.getMonth() + idx, 1);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      });
    }
    const summary = await Expense.aggregate([
      { $match: { month: { $in: monthKeys } } },
      { $group: { _id: "$month", total: { $sum: { $add: ["$fixedSalary", "$monthlyExpenses"] } } } },
    ]);
    const summaryMap = new Map(summary.map((item) => [item._id, item.total]));
    const rows = monthKeys.map((month) => ({
      month,
      total: summaryMap.get(month) || 0,
    }));
    return res.json({ rows });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch expense summary" });
  }
});

router.post("/expenses", auth(["admin"]), async (req, res) => {
  try {
    const { employeeId, month, fixedSalary, monthlyExpenses } = req.body;
    if (!employeeId || !month) {
      return res.status(400).json({ message: "Employee and month are required." });
    }
    const payload = {
      employee: employeeId,
      month,
      fixedSalary: Number(fixedSalary) || 0,
      monthlyExpenses: Number(monthlyExpenses) || 0,
      updatedBy: req.user?.id,
    };
    const expense = await Expense.findOneAndUpdate(
      { employee: employeeId, month },
      { $set: payload },
      { new: true, upsert: true }
    );
    return res.status(201).json({ expense });
  } catch (error) {
    return res.status(500).json({ message: "Unable to save expense" });
  }
});

router.post("/expenses/bulk", auth(["admin"]), async (req, res) => {
  try {
    const { month, items } = req.body;
    if (!month || !Array.isArray(items)) {
      return res.status(400).json({ message: "Month and items are required." });
    }
    const ops = items
      .filter((item) => item?.employeeId)
      .map((item) => ({
        updateOne: {
          filter: { employee: item.employeeId, month },
          update: {
            $set: {
              employee: item.employeeId,
              month,
              fixedSalary: Number(item.fixedSalary) || 0,
              monthlyExpenses: Number(item.monthlyExpenses) || 0,
              updatedBy: req.user?.id,
            },
          },
          upsert: true,
        },
      }));
    if (!ops.length) {
      return res.status(400).json({ message: "No valid items to update." });
    }
    await Expense.bulkWrite(ops, { ordered: false });
    return res.json({ updated: ops.length });
  } catch (error) {
    return res.status(500).json({ message: "Unable to save expenses" });
  }
});

router.get("/expenses/history/:employeeId", auth(["admin"]), async (req, res) => {
  try {
    const { employeeId } = req.params;
    const limit = Math.min(Number(req.query.limit || 12), 24);
    const history = await Expense.find({ employee: employeeId })
      .sort({ month: -1 })
      .limit(limit);
    return res.json({ history });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch expense history" });
  }
});

router.get("/expenses/report/pdf", auth(["admin"]), async (req, res) => {
  try {
    const month = (req.query.month || "").trim();
    if (!month) {
      return res.status(400).json({ message: "Month is required (YYYY-MM)." });
    }
    const employees = await Employee.find().sort({ name: 1 });
    const expenses = await Expense.find({ month });
    const expenseMap = new Map(expenses.map((item) => [String(item.employee), item]));

    const formatCurrency = (value) =>
      new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
        Number(value) || 0
      );
    const monthLabel = (() => {
      const date = new Date(`${month}-01T00:00:00`);
      if (Number.isNaN(date.getTime())) return month;
      return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    })();

    const totals = employees.reduce(
      (acc, emp) => {
        const record = expenseMap.get(String(emp._id));
        const fixedSalary = record ? Number(record.fixedSalary) || 0 : Number(emp.currentSalary) || 0;
        const monthlyExpenses = record ? Number(record.monthlyExpenses) || 0 : 0;
        acc.salary += fixedSalary;
        acc.expenses += monthlyExpenses;
        return acc;
      },
      { salary: 0, expenses: 0 }
    );
    const grandTotal = totals.salary + totals.expenses;
    const maxValue = Math.max(totals.salary, totals.expenses, grandTotal, 1);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="expenses-report-${month}.pdf"`);
    const doc = new PDFDocument({ size: "A4", margin: 40 });
    doc.pipe(res);

    const brandColor = "#d62839";
    const logoPath = path.resolve(__dirname, "..", "..", "Frontend", "Images", "SoulPharma.png");
    const pageWidth = doc.page.width;
    const headerTop = doc.y;
    const logoSize = 54;
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, (pageWidth - logoSize) / 2, headerTop, { width: logoSize, height: logoSize });
    }
    doc
      .fontSize(18)
      .fillColor(brandColor)
      .text("Soul Pharma", 40, headerTop + logoSize + 6, { align: "center", width: pageWidth - 80 });
    doc
      .fontSize(11)
      .fillColor("#475569")
      .text("Monthly Expense Report", 40, headerTop + logoSize + 26, { align: "center", width: pageWidth - 80 });
    doc
      .moveTo(120, headerTop + logoSize + 48)
      .lineTo(pageWidth - 120, headerTop + logoSize + 48)
      .strokeColor("#e2e8f0")
      .stroke();
    doc.y = headerTop + logoSize + 62;
    doc.fontSize(11).fillColor("#475569").text(`Month: ${monthLabel}`, { align: "center" });
    doc.moveDown(0.8);

    const summaryY = doc.y;
    const summaryGap = 12;
    const summaryWidth = (pageWidth - 80 - summaryGap * 2) / 3;
    const summaryHeight = 48;
    const summaryItems = [
      { label: "Salary Total", value: formatCurrency(totals.salary) },
      { label: "Expenses Total", value: formatCurrency(totals.expenses) },
      { label: "Grand Total", value: formatCurrency(grandTotal) },
    ];
    summaryItems.forEach((item, idx) => {
      const x = 40 + idx * (summaryWidth + summaryGap);
      doc.rect(x, summaryY, summaryWidth, summaryHeight).fill("#f8fafc");
      doc
        .fontSize(9)
        .fillColor("#64748b")
        .text(item.label, x + 10, summaryY + 8, { width: summaryWidth - 20 });
      doc
        .fontSize(12)
        .fillColor("#0f172a")
        .text(item.value, x + 10, summaryY + 24, { width: summaryWidth - 20 });
    });
    doc.y = summaryY + summaryHeight + 14;

    const chartX = 40;
    const chartY = doc.y;
    const chartWidth = 260;
    const chartHeight = 10;
    const drawBar = (label, value, color, offsetY) => {
      doc.fontSize(9).fillColor("#64748b").text(label, chartX, offsetY - 2);
      doc
        .rect(chartX + 70, offsetY - chartHeight, chartWidth, chartHeight)
        .stroke("#e2e8f0");
      doc
        .rect(chartX + 70, offsetY - chartHeight, (value / maxValue) * chartWidth, chartHeight)
        .fill(color);
    };
    drawBar("Salary", totals.salary, "#f97316", chartY);
    drawBar("Expenses", totals.expenses, "#38bdf8", chartY + 16);
    drawBar("Total", grandTotal, "#22c55e", chartY + 32);
    doc.moveDown(2.6);

    let cursorY = doc.y;
    const columns = [
      { label: "#", width: 24 },
      { label: "Employee", width: 150 },
      { label: "Area", width: 110 },
      { label: "Fixed Salary", width: 90 },
      { label: "Monthly Expenses", width: 100 },
      { label: "Total", width: 80 },
    ];
    const tableX = 40;
    const rowHeight = 18;

    const drawTableHeader = () => {
      doc.rect(tableX, cursorY, columns.reduce((sum, c) => sum + c.width, 0), rowHeight).fill(brandColor);
      doc.fontSize(9).fillColor("#ffffff");
      let x = tableX + 4;
      columns.forEach((col) => {
        doc.text(col.label, x, cursorY + 4, { width: col.width - 6 });
        x += col.width;
      });
      cursorY += rowHeight;
    };

    drawTableHeader();
    doc.fontSize(9).fillColor("#0f172a");

    employees.forEach((emp, index) => {
      const record = expenseMap.get(String(emp._id));
      const fixedSalary = record ? Number(record.fixedSalary) || 0 : Number(emp.currentSalary) || 0;
      const monthlyExpenses = record ? Number(record.monthlyExpenses) || 0 : 0;
      const total = fixedSalary + monthlyExpenses;

      if (cursorY + rowHeight > doc.page.height - 40) {
        doc.addPage();
        cursorY = 40;
        drawTableHeader();
      }

      let x = tableX + 4;
      doc.text(String(index + 1), x, cursorY + 4, { width: columns[0].width - 6 });
      x += columns[0].width;
      doc.text(emp.name || "Employee", x, cursorY + 4, { width: columns[1].width - 6 });
      x += columns[1].width;
      doc.text(emp.territoryName || "-", x, cursorY + 4, { width: columns[2].width - 6 });
      x += columns[2].width;
      doc.text(formatCurrency(fixedSalary), x, cursorY + 4, { width: columns[3].width - 6 });
      x += columns[3].width;
      doc.text(formatCurrency(monthlyExpenses), x, cursorY + 4, { width: columns[4].width - 6 });
      x += columns[4].width;
      doc.text(formatCurrency(total), x, cursorY + 4, { width: columns[5].width - 6 });
      cursorY += rowHeight;
    });

    const footerY = doc.page.height - 70;
    doc
      .moveTo(40, footerY)
      .lineTo(240, footerY)
      .strokeColor("#cbd5f5")
      .stroke();
    doc
      .moveTo(320, footerY)
      .lineTo(520, footerY)
      .strokeColor("#cbd5f5")
      .stroke();
    doc.fontSize(9).fillColor("#64748b").text("Prepared By", 40, footerY + 6);
    doc.fontSize(9).fillColor("#64748b").text("Authorized Signature", 320, footerY + 6);
    doc
      .fontSize(8)
      .fillColor("#94a3b8")
      .text("Soul Pharma • Confidential", 40, footerY + 28, { align: "center", width: pageWidth - 80 });

    doc.end();
  } catch (error) {
    return res.status(500).json({ message: "Unable to generate expense report" });
  }
});

router.get("/employee-expenses", auth(["admin"]), async (req, res) => {
  try {
    const employeeId = String(req.query.employeeId || "").trim();
    const month = String(req.query.month || "").trim();
    if (!month) {
      return res.status(400).json({ message: "Month is required (YYYY-MM)." });
    }
    const filter = { month };
    if (employeeId) {
      filter.employee = employeeId;
    }
    const expenses = await EmployeeExpense.find(filter)
      .populate("employee", "name employeeId territoryName designation")
      .sort({ expenseDate: -1, createdAt: -1 });
    return res.json({ expenses });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch employee expenses" });
  }
});

router.patch("/employee-expenses/:id", auth(["admin"]), async (req, res) => {
  try {
    const { amount, distance, expenseDate, remarks, workingArea, status } = req.body;
    const updates = {};
    if (amount !== undefined) updates.amount = Number(amount) || 0;
    if (distance !== undefined) updates.distance = Number(distance) || 0;
    if (remarks !== undefined) updates.remarks = remarks || "";
    if (workingArea !== undefined) updates.workingArea = workingArea || "";
    if (status) updates.status = status;
    if (expenseDate) {
      const parsed = new Date(expenseDate);
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }
      updates.expenseDate = parsed;
      updates.month = parsed.toISOString().slice(0, 7);
    }
    const expense = await EmployeeExpense.findByIdAndUpdate(req.params.id, updates, { new: true });
    if (!expense) {
      return res.status(404).json({ message: "Expense record not found" });
    }
    return res.json({ expense });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update expense record" });
  }
});

router.delete("/employee-expenses/:id", auth(["admin"]), async (req, res) => {
  try {
    const expense = await EmployeeExpense.findByIdAndDelete(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense record not found" });
    }
    return res.json({ message: "Expense record deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete expense record" });
  }
});

router.post("/employee-expenses/approve", auth(["admin"]), async (req, res) => {
  try {
    const { employeeId, month } = req.body;
    if (!employeeId || !month) {
      return res.status(400).json({ message: "Employee and month are required." });
    }
    const pendingExpenses = await EmployeeExpense.find({
      employee: employeeId,
      month,
      status: "pending",
    });
    if (!pendingExpenses.length) {
      return res.json({ approved: 0, total: 0 });
    }
    const total = pendingExpenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const approvedAt = new Date();
    await EmployeeExpense.updateMany(
      { _id: { $in: pendingExpenses.map((item) => item._id) } },
      { $set: { status: "approved", approvedAt, approvedBy: req.user.id } }
    );
    const employee = await Employee.findById(employeeId);
    const payrollMonth = String(month);
    const expense = await Expense.findOneAndUpdate(
      { employee: employeeId, month: payrollMonth },
      {
        $inc: { monthlyExpenses: total },
        $set: { updatedBy: req.user.id, employee: employeeId, month: payrollMonth },
        $setOnInsert: { fixedSalary: Number(employee?.currentSalary) || 0 },
      },
      { new: true, upsert: true }
    );
    return res.json({ approved: pendingExpenses.length, total, expense, payrollMonth });
  } catch (error) {
    return res.status(500).json({ message: "Unable to approve expenses" });
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
    const counterKey = `doctor:${employeeId}`;
    const currentCount = await Doctor.countDocuments({ createdBy: employeeId });
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
      createdBy: employeeId,
    });
    return res.status(201).json({ doctor });
  } catch (error) {
    return res.status(500).json({ message: "Unable to create doctor" });
  }
});

router.get("/doctors/template", auth(["admin"]), async (_req, res) => {
  try {
    const headers = [
      {
        name: "",
        speciality: "",
        phone: "",
        email: "",
        clinicName: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        notes: "",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Doctors");
    const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", "attachment; filename=\"doctors-template.xlsx\"");
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: "Unable to generate template" });
  }
});

router.post("/doctors/import", auth(["admin"]), upload.single("file"), async (req, res) => {
  try {
    const employeeId = req.body.employeeId;
    if (!employeeId) {
      return res.status(400).json({ message: "Employee is required." });
    }
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: "File is required." });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      return res.status(400).json({ message: "No worksheet found in file." });
    }
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
    if (!rows.length) {
      return res.status(400).json({ message: "File is empty." });
    }

    const counterKey = `doctor:${employeeId}`;
    const currentCount = await Doctor.countDocuments({ createdBy: employeeId });
    if (currentCount === 0) {
      await setSequence(counterKey, 0);
    }

    const created = [];
    let skipped = 0;
    for (const row of rows) {
      const name = String(row.name || row.Name || "").trim();
      const phone = String(row.phone || row.Phone || "").trim();
      if (!name || !phone) {
        skipped += 1;
        continue;
      }
      const serialNumber = await nextSequence(counterKey);
      created.push({
        serialNumber,
        name,
        speciality: String(row.speciality || row.Speciality || "").trim(),
        phone,
        email: String(row.email || row.Email || "").trim(),
        clinicName: String(row.clinicName || row.ClinicName || row.Clinic || "").trim(),
        address: String(row.address || row.Address || "").trim(),
        city: String(row.city || row.City || "").trim(),
        state: String(row.state || row.State || "").trim(),
        pincode: String(row.pincode || row.Pincode || "").trim(),
        notes: String(row.notes || row.Notes || "").trim(),
        createdBy: employeeId,
      });
    }

    if (!created.length) {
      return res.status(400).json({ message: "No valid rows found." });
    }

    await Doctor.insertMany(created, { ordered: false });
    return res.status(201).json({ created: created.length, skipped });
  } catch (error) {
    return res.status(500).json({ message: "Unable to import doctors" });
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
    await reindexDoctorSerials(doctor.createdBy);
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

router.get("/locations/live", auth(["admin"]), async (_req, res) => {
  try {
    const pipeline = [
      { $sort: { receivedAt: -1 } },
      {
        $group: {
          _id: "$employee",
          last: { $first: "$$ROOT" },
        },
      },
      {
        $lookup: {
          from: "employees",
          localField: "_id",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: "$employee" },
      {
        $project: {
          _id: 0,
          employee: {
            id: "$employee._id",
            name: "$employee.name",
            email: "$employee.email",
            employeeId: "$employee.employeeId",
            territoryName: "$employee.territoryName",
            designation: "$employee.designation",
            status: "$employee.status",
          },
          location: {
            id: "$last._id",
            latitude: "$last.latitude",
            longitude: "$last.longitude",
            accuracy: "$last.accuracy",
            capturedAt: "$last.capturedAt",
            receivedAt: "$last.receivedAt",
            battery: "$last.battery",
            device: "$last.device",
          },
        },
      },
      { $sort: { "location.receivedAt": -1 } },
    ];
    const locations = await EmployeeLocation.aggregate(pipeline);
    return res.json({ locations });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch live locations" });
  }
});

router.get("/locations/history", auth(["admin"]), async (req, res) => {
  try {
    const { employeeId, from, to } = req.query;
    const limit = Math.min(Number(req.query.limit || 300), 1000);
    const filter = {};
    if (employeeId) filter.employee = employeeId;
    if (from || to) {
      filter.receivedAt = {};
      if (from) filter.receivedAt.$gte = new Date(from);
      if (to) filter.receivedAt.$lte = new Date(to);
    }
    const locations = await EmployeeLocation.find(filter)
      .populate("employee", "name email employeeId territoryName designation")
      .sort({ receivedAt: -1 })
      .limit(limit);
    return res.json({ locations });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch location history" });
  }
});

router.delete("/locations/history", auth(["admin"]), async (req, res) => {
  try {
    const { employeeId, from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ message: "From and to dates are required" });
    }
    const filter = {};
    if (employeeId) filter.employee = employeeId;
    filter.receivedAt = { $gte: new Date(from), $lte: new Date(to) };
    const result = await EmployeeLocation.deleteMany(filter);
    return res.json({ deletedCount: result.deletedCount });
  } catch (error) {
    return res.status(500).json({ message: "Unable to delete location history" });
  }
});

router.post("/notifications", auth(["admin"]), async (req, res) => {
  try {
    const { employeeId, title, message, priority } = req.body;
    if (!message) {
      return res.status(400).json({ message: "Notification message is required" });
    }
    const notification = await Notification.create({
      employee: employeeId || undefined,
      title,
      message,
      priority: priority || "info",
      createdBy: req.user.id,
      deliveredAt: new Date(),
    });

    const io = getIo();
    if (io) {
      const payload = {
        id: notification._id,
        employeeId: employeeId || null,
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        createdAt: notification.createdAt,
      };
      if (employeeId) {
        io.to(`employee:${employeeId}`).emit("notification:new", payload);
      } else {
        io.to("employees").emit("notification:new", payload);
      }
    }

    return res.status(201).json({ notification });
  } catch (error) {
    return res.status(500).json({ message: "Unable to send notification" });
  }
});

router.get("/notifications", auth(["admin"]), async (req, res) => {
  try {
    const { employeeId } = req.query;
    const filter = employeeId ? { employee: employeeId } : {};
    const notifications = await Notification.find(filter)
      .populate("employee", "name email employeeId")
      .sort({ createdAt: -1 })
      .limit(200);
    return res.json({ notifications });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch notifications" });
  }
});

module.exports = router;
