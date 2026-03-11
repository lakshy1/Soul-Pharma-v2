const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true, lowercase: true, required: true, index: true },
    purpose: { type: String, trim: true, required: true },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Otp", otpSchema);
