const mongoose = require("mongoose");

const connectDb = async () => {
  const uri = process.env.MONGO_DB;
  if (!uri) {
    throw new Error("MONGO_DB is not set");
  }

  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB_NAME || undefined,
  });
};

module.exports = connectDb;
