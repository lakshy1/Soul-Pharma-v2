const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    month: { type: String, required: true, index: true },
    fixedSalary: { type: Number, default: 0 },
    monthlyExpenses: { type: Number, default: 0 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

expenseSchema.index({ employee: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Expense", expenseSchema);
