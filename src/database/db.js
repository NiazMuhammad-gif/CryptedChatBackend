const mongoose = require("mongoose");

module.exports = connection = async () => {
  const db = process.env.LIVE_DB;
  try {
    const connectionParams = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    await mongoose.connect(db, connectionParams);
    console.log("connected to database.");
  } catch (error) {
    console.log(error, "could not connect database.");
  }
};
