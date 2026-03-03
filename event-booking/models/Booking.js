const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({ // Booking records
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    status: { type: String, enum: ['going', 'canceled'], default: 'going' },
    bookedAt: { type: Date, default: Date.now }
}, { timestamps: true }); // Auto-track creation time

// Ensure a user can't book the same event twice with 'going' status
bookingSchema.index({ user: 1, event: 1 }, { unique: true }); // Prevent duplicate bookings

module.exports = mongoose.model('Booking', bookingSchema);
