const mongoose = require("mongoose");

module.exports = {
  // Connect to the MongoDB database
  connectToDatabase: async () => {
    try {
      await mongoose.connect(process.env.MONGODB_CONNECTION, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, // 30 seconds
      });
      console.log("Connected to MongoDB");
    } catch (error) {
      console.error("Error connecting to MongoDB:", error);
    }
  },
};
