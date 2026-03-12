const mongoose = require("mongoose");

const employeeLocationSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    accuracy: { type: Number },
    altitude: { type: Number },
    speed: { type: Number },
    heading: { type: Number },
    capturedAt: { type: Date },
    receivedAt: { type: Date, default: Date.now, index: true },
    device: {
      userAgent: { type: String },
      platform: { type: String },
      language: { type: String },
      timezone: { type: String },
      screen: {
        width: { type: Number },
        height: { type: Number },
      },
      deviceMemory: { type: Number },
      hardwareConcurrency: { type: Number },
    },
    battery: {
      level: { type: Number },
      charging: { type: Boolean },
    },
    network: {
      online: { type: Boolean },
      effectiveType: { type: String },
      rtt: { type: Number },
      downlink: { type: Number },
    },
    source: { type: String, default: "watchPosition" },
  },
  { timestamps: true }
);

employeeLocationSchema.index({ employee: 1, capturedAt: -1 });

module.exports = mongoose.model("EmployeeLocation", employeeLocationSchema);
