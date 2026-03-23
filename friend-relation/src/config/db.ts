const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || '');
    console.log('connected');
  } catch (error) {
    console.error('db error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;

export {};
