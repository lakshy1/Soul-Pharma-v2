require("dotenv").config();
const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDb = require("./config/db");
const Admin = require("./models/Admin");
const { hashPassword, verifyPassword } = require("./utils/password");
const seedData = require("./utils/seedData");
const { setIo } = require("./utils/socket");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");
const employeeRoutes = require("./routes/employee");
const newsRoutes = require("./routes/news");
const businessRoutes = require("./routes/business");
const formRoutes = require("./routes/forms");
const chatbotRoutes = require("./routes/chatbot");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://soulpharma.netlify.app",
  "https://soulpharma.netlify.app/",
  process.env.FRONTEND_URL || "http://localhost:3000"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Admin-Route", "x-admin-route"]
}));
app.use(express.json({ limit: "1mb" }));

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    return next(new Error("Unauthorized"));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = payload;
    return next();
  } catch (error) {
    return next(new Error("Unauthorized"));
  }
});

io.on("connection", (socket) => {
  const role = socket.user?.role;
  if (role === "admin") {
    socket.join("admins");
  }
  if (role === "employee") {
    socket.join(`employee:${socket.user.id}`);
    socket.join("employees");
  }
});

setIo(io);

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
    server.listen(port, () => console.log(`API running on port ${port}`));
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

start();
