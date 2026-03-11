const express = require("express");
const FocusArea = require("../models/FocusArea");

const router = express.Router();

router.get("/focus-areas", async (req, res) => {
  try {
    const items = await FocusArea.find().sort({ order: 1, createdAt: 1 });
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch focus areas" });
  }
});

module.exports = router;
