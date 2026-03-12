const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    title: { type: String, trim: true },
    message: { type: String, trim: true, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    priority: { type: String, enum: ["info", "warning", "urgent"], default: "info" },
    deliveredAt: { type: Date },
    readAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
