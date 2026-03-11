const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    summary: { type: String, trim: true, required: true },
    imageUrl: { type: String, trim: true },
    category: { type: String, trim: true, default: "Update" },
    publishedAt: { type: Date, required: true },
    isFeatured: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model("News", newsSchema);
