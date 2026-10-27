const mongoose = require('mongoose');

let isConnected = false;
let isInMemoryFallback = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cab_booking_db';
  try {
    console.log(`Connecting to MongoDB at: ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    isConnected = true;
    console.log(`MongoDB Connected successfully: ${mongoose.connection.host}`);
  } catch (error) {
    console.warn(`[WARNING] Local/Atlas MongoDB not reachable (${error.message}).`);
    console.warn(`[INFO] Enabling built-in Memory Data Engine. The backend will work seamlessly for all features!`);
    isInMemoryFallback = true;
    isConnected = false;
  }
};

const getDBStatus = () => ({
  connected: isConnected,
  isInMemory: isInMemoryFallback,
});

module.exports = { connectDB, getDBStatus };
