const express = require("express");
const Employee = require("../models/Employee");
const Otp = require("../models/Otp");
const { hashPassword, hashOtp, verifyOtp } = require("../utils/password");
const { sendEmail } = require("../utils/mailer");
const { buildOtpEmail } = require("../utils/otpTemplate");

const router = express.Router();

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

router.post("/request-otp", async (req, res) => {
  try {
    const { email, purpose } = req.body;
    if (!email || !purpose) {
      return res.status(400).json({ message: "Email and purpose are required" });
    }

    if (!["reset", "signup", "login"].includes(purpose)) {
      return res.status(400).json({ message: "Invalid purpose" });
    }

    if (purpose === "reset") {
      const employee = await Employee.findOne({ email });
      if (!employee) {
        return res.status(404).json({ message: "Email not registered" });
      }
    }

    await Otp.deleteMany({ email, purpose });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await hashOtp(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.create({ email, purpose, codeHash, expiresAt });

    const { subject, html, text } = buildOtpEmail({
      code,
      purpose,
      expiresMinutes: 10,
      brandName: process.env.MAIL_FROM_NAME || "Soul Pharma",
      supportEmail: process.env.MAIL_FROM || process.env.MAIL_USER || "Soulpharmangp@gmail.com",
    });

    await sendEmail({ toEmail: email, subject, html, text });

    return res.json({ message: "OTP sent" });
  } catch (error) {
    console.error("OTP email failed:", error?.message || error);
    return res.status(500).json({
      message: "Unable to send OTP",
      detail: error?.message || "Email transport error",
    });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, purpose, code } = req.body;
    if (!email || !purpose || !code) {
      return res.status(400).json({ message: "Email, purpose, and code are required" });
    }

    const result = await consumeOtp(email, purpose, code);
    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }
    return res.json({ message: "OTP verified" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to verify OTP" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, code, and newPassword are required" });
    }

    const otpResult = await consumeOtp(email, "reset", code);
    if (!otpResult.ok) {
      return res.status(otpResult.status).json({ message: otpResult.message });
    }

    const passwordHash = await hashPassword(newPassword);
    await Employee.updateOne({ email }, { passwordHash });
    return res.json({ message: "Password updated" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to reset password" });
  }
});

module.exports = router;
