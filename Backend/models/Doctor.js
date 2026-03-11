const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    serialNumber: { type: Number, required: true },
    name: { type: String, trim: true, required: true },
    speciality: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    clinicName: { type: String, trim: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  },
  { timestamps: true }
);

doctorSchema.index({ createdBy: 1, serialNumber: 1 }, { unique: true });
doctorSchema.index({ createdBy: 1, name: 1 });

module.exports = mongoose.model("Doctor", doctorSchema);
