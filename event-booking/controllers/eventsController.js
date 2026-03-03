const Event = require('../models/Event');
const Booking = require('../models/Booking');
const { ERRORS, DEFAULTS } = require('../config/constants');
const transporter = require('../config/email');

// Pagination
exports.getAllEvents = async (req, res) => { // List all events
    try {
        // Parse query params
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || DEFAULTS.PAGINATION_LIMIT;
        const skip = (page - 1) * limit;

        const events = await Event.find()
            .sort({ startTime: 1 })
            .skip(skip)
            .limit(limit);

        const total = await Event.countDocuments();

        res.send({
            events,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalEvents: total
        });
    } catch (e) {
        res.status(500).send(e.message);
    }
};

// Haversine Formula (distance)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's average radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

exports.getNearbyEvents = async (req, res) => { // Nearby events
    try {
        const { latitude, longitude } = req.user.location;
        const events = await Event.find({});

        const nearbyEvents = events.filter(event => {
            const distance = calculateDistance(
                latitude, longitude,
                event.location.latitude, event.location.longitude
            );
            return distance <= DEFAULTS.RADIUS_KM;
        });

        res.send(nearbyEvents);
    } catch (e) {
        res.status(500).send(e.message);
    }
};

exports.createEvent = async (req, res) => { // Create event
    try {
        const { title, description, startTime, endTime, latitude, longitude, address } = req.body;
        const event = new Event({
            title,
            description,
            startTime,
            endTime,
            location: { latitude, longitude, address },
            createdBy: req.user._id
        });
        await event.save();
        res.status(201).send(event);
    } catch (e) {
        res.status(400).send(e.message);
    }
};

// Business rules check
exports.joinEvent = async (req, res) => { // Join event
    try {
        const eventToJoin = await Event.findById(req.params.eventId);
        if (!eventToJoin) return res.status(404).send({ error: ERRORS.EVENT_NOT_FOUND });

        const existingBookings = await Booking.find({ user: req.user._id, status: 'going' }).populate('event');

        // No overlaps allowed
        const hasOverlap = existingBookings.some(booking => {
            const bookedEvent = booking.event;
            // Checks if start and end times intersect with any other booking
            return (eventToJoin.startTime < bookedEvent.endTime && eventToJoin.endTime > bookedEvent.startTime);
        });

        if (hasOverlap) {
            return res.status(400).send({ error: ERRORS.OVERLAP });
        }

        const booking = new Booking({
            user: req.user._id,
            event: eventToJoin._id
        });
        await booking.save();

        // Send confirmation email
        try {
            await transporter.sendMail({
                to: req.user.email,
                subject: `Booking Confirmed: ${eventToJoin.title}`,
                text: `Hello ${req.user.name},\n\nYou have successfully booked a spot for "${eventToJoin.title}".\n\nDate: ${new Date(eventToJoin.startTime).toLocaleString()}\nLocation: ${eventToJoin.location.address}\n\nSee you there!`
            });
        } catch (mailError) {
            console.error('Confirmation email failed to send:', mailError.message);
            // We don't fail the whole request just because the email failed
        }

        res.status(201).send(booking);
    } catch (e) {
        res.status(400).send(e.message);
    }
};

exports.getMyEvents = async (req, res) => { // User events
    try {
        const now = new Date();
        const bookings = await Booking.find({ user: req.user._id }).populate('event').sort({ 'event.startTime': -1 });

        const past = bookings.filter(b => b.event.endTime < now);
        const current = bookings.filter(b => b.event.startTime <= now && b.event.endTime >= now);
        const future = bookings.filter(b => b.event.startTime > now);

        res.send({ past, current, future });
    } catch (e) {
        res.status(500).send(e.message);
    }
};

exports.cancelBooking = async (req, res) => { // Cancel booking
    try {
        const booking = await Booking.findOne({ _id: req.params.bookingId, user: req.user._id }).populate('event');
        if (!booking) return res.status(404).send({ error: ERRORS.BOOKING_NOT_FOUND });

        const now = new Date();
        const startTime = new Date(booking.event.startTime);
        const hoursDiff = (startTime - now) / (1000 * 60 * 60);

        if (hoursDiff < 8) {
            return res.status(400).send({ error: ERRORS.CANCEL_LIMIT });
        }

        booking.status = 'canceled';
        await booking.save();
        res.send(booking);
    } catch (e) {
        res.status(400).send(e.message);
    }
};

exports.getEventParticipants = async (req, res) => { // Admin view
    try {
        const participants = await Booking.find({ event: req.params.eventId }).populate('user', 'name email');
        res.send(participants);
    } catch (e) {
        res.status(500).send(e.message);
    }
};
