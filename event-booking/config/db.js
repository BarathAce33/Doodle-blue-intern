const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI); // Connect to Atlas
        console.log('Connected to MongoDB Atlas');
    } catch (err) {
        console.error('Could not connect to MongoDB', err);
        process.exit(1);
    }
};

module.exports = connectDB;
