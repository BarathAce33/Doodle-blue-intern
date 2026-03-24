import mongoose from 'mongoose';

// connect
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || '');
    console.log(`mongo ${conn.connection.host}`);
  } catch (err) {
    console.error('db failed');
    process.exit(1);
  }
};

export default connectDB;
