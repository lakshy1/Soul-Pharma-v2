const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    email: { type: String, trim: true, lowercase: true, unique: true, required: true },
    phone: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    employeeId: { type: String, trim: true, unique: true },
    joiningDate: { type: Date, default: Date.now },
    currentSalary: { type: Number, default: 0 },
    territoryName: { type: String, trim: true, default: "Unassigned" },
    designation: { type: String, trim: true, default: "Employee" },
    department: { type: String, trim: true },
    managerName: { type: String, trim: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
