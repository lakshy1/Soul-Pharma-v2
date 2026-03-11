const fs = require("fs");
const path = require("path");
const News = require("../models/News");
const FocusArea = require("../models/FocusArea");

const loadSeed = (filename) => {
  const filePath = path.join(__dirname, "..", "data", filename);
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
};

const seedNews = async () => {
  const count = await News.countDocuments();
  if (count > 0) {
    return;
  }
  const items = loadSeed("news.seed.json");
  await News.insertMany(items);
};

const seedFocusAreas = async () => {
  const count = await FocusArea.countDocuments();
  if (count > 0) {
    return;
  }
  const items = loadSeed("focus.seed.json");
  await FocusArea.insertMany(items);
};

const seedData = async () => {
  await seedNews();
  await seedFocusAreas();
};

module.exports = seedData;
