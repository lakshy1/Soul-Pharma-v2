const mongoose = require("mongoose");

const focusAreaSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    subtitle: { type: String, trim: true, required: true },
    imageUrl: { type: String, trim: true, required: true },
    medicines: { type: [String], default: [] },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("FocusArea", focusAreaSchema);
