require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDb = require("./config/db");
const Admin = require("./models/Admin");
const { hashPassword, verifyPassword } = require("./utils/password");
const seedData = require("./utils/seedData");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const employeeRoutes = require("./routes/employee");
const newsRoutes = require("./routes/news");
const businessRoutes = require("./routes/business");
const formRoutes = require("./routes/forms");
const chatbotRoutes = require("./routes/chatbot");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL || "http://localhost:3000"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/chatbot", chatbotRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const ensureAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    return;
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    const ok = await verifyPassword(password, existing.passwordHash);
    if (!ok) {
      existing.passwordHash = await hashPassword(password);
      await existing.save();
      console.log("Admin password updated:", email);
    }
    return;
  }

  const passwordHash = await hashPassword(password);
  await Admin.create({ email, passwordHash });
  console.log("Admin account created:", email);
};

const start = async () => {
  try {
    await connectDb();
    await ensureAdmin();
    await seedData();
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`API running on port ${port}`));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();
