const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    serialNumber: { type: Number },
    name: { type: String, required: true, trim: true },
    composition: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ order: 1, serialNumber: 1 });

module.exports = mongoose.model("Product", productSchema);
