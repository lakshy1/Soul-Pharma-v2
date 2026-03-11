const express = require("express");
const News = require("../models/News");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const items = await News.find().sort({ publishedAt: -1, createdAt: -1 });
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: "Unable to fetch news" });
  }
});

module.exports = router;
