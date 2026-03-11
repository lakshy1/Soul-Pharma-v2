const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "System Admin" },
    email: { type: String, trim: true, lowercase: true, unique: true, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Admin", adminSchema);
