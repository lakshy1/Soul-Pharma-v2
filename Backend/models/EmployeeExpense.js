const mongoose = require("mongoose");

const employeeExpenseSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    amount: { type: Number, required: true },
    distance: { type: Number, default: 0 },
    expenseDate: { type: Date, required: true, index: true },
    month: { type: String, required: true, index: true },
    workingArea: { type: String, default: "" },
    remarks: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    approvedAt: { type: Date },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

employeeExpenseSchema.index({ employee: 1, month: 1, expenseDate: 1 });

module.exports = mongoose.model("EmployeeExpense", employeeExpenseSchema);
