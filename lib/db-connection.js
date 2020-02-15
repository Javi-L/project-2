const mongoose = require("mongoose");
require("dotenv").config();

const dbUrl = process.env.DB_URL;

const connectionDB = async (fn, disconnectEnd = true) => {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`Connection ready on ${dbUrl}`);
    await fn();
  } catch (err) {
    console.error(err);
  } finally {
    if (disconnectEnd) {
      await mongoose.disconnect();
      console.log("Database disconnected");
    }
  }
};

module.exports = connectionDB;
