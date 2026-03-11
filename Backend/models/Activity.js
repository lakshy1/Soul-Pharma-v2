const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    doctorSnapshot: {
      name: { type: String, trim: true },
      speciality: { type: String, trim: true },
      phone: { type: String, trim: true },
      address: { type: String, trim: true },
    },
    visitedAt: { type: Date, required: true },
    followUpDate: { type: Date },
    notes: { type: String, trim: true },
    photoUrl: { type: String, trim: true },
    photoPublicId: { type: String, trim: true },
  },
  { timestamps: true }
);

activitySchema.index({ employee: 1, visitedAt: -1 });

module.exports = mongoose.model("Activity", activitySchema);
