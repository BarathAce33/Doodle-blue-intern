const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ // User structure
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Admin', 'Customer'], default: 'Customer' },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    otp: String,
    otpExpire: Date
}, { timestamps: true }); // Auto-track creation time

module.exports = mongoose.model('User', userSchema);
