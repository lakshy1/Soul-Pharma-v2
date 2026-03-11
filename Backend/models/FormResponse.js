const mongoose = require("mongoose");

const formResponseSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, required: true },
    phone: { type: String, trim: true },
    topic: { type: String, trim: true, default: "general" },
    message: { type: String, trim: true, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FormResponse", formResponseSchema);
