const Counter = require("../models/Counter");

const nextSequence = async (key) => {
  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

const setSequence = async (key, seq = 0) => {
  const counter = await Counter.findOneAndUpdate(
    { key },
    { $set: { seq } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

module.exports = { nextSequence, setSequence };
