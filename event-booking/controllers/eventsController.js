const { Event, Booking, User } = require('../models');
const { ERRORS, DEFAULTS } = require('../config/constants');
const transporter = require('../config/email');
const { Op } = require('sequelize');

// Pagination
exports.getAllEvents = async (req, res) => { // List all events
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || DEFAULTS.PAGINATION_LIMIT;
        const offset = (page - 1) * limit;

        const { count, rows: events } = await Event.findAndCountAll({
            order: [['startTime', 'ASC']],
            limit,
            offset
        });

        res.send({
            events,
            currentPage: page,
            totalPages: Math.ceil(count / limit),
            totalEvents: count
        });
    } catch (e) {
        res.status(500).json({ statusCode: 500, message: e.message });
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

const { geocodeAddress } = require('../utils/geocode');

exports.getNearbyEvents = async (req, res) => { // Nearby events
    try {
        const user = await User.findByPk(req.user.id);
        const { latitude, longitude } = user;
        const { radius } = req.query;

        const searchRadiusKm = radius ? parseFloat(radius) : DEFAULTS.RADIUS_KM;

        const events = await Event.findAll();

        const nearbyEvents = events.filter(event => {
            const distance = calculateDistance(
                latitude, longitude,
                event.latitude, event.longitude
            );
            return distance <= searchRadiusKm;
        });

        res.send(nearbyEvents);
    } catch (e) {
        res.status(500).json({ statusCode: 500, message: e.message });
    }
};

exports.createEvent = async (req, res) => { // Create event
    try {
        const { title, description, startTime, endTime, area, city, state, country } = req.body;

        const locationString = `${area}, ${city}, ${state}, ${country}`;
        const { latitude, longitude } = await geocodeAddress(locationString);

        const event = await Event.create({
            title,
            description,
            startTime,
            endTime,
            latitude,
            longitude,
            area,
            city,
            state,
            country,
            createdById: req.user.id
        });
        res.status(201).send(event);
    } catch (e) {
        res.status(400).json({ statusCode: 400, message: e.message });
    }
};

// Business rules check
exports.joinEvent = async (req, res) => { // Join event
    try {
        const eventToJoin = await Event.findByPk(req.params.eventId);
        if (!eventToJoin) return res.status(404).json({ statusCode: 404, message: ERRORS.EVENT_NOT_FOUND });

        const existingBookings = await Booking.findAll({
            where: { userId: req.user.id, status: 'going' },
            include: [{ model: Event, as: 'event' }]
        });

        // No overlaps allowed
        const hasOverlap = existingBookings.some(booking => {
            const bookedEvent = booking.event;
            return (eventToJoin.startTime < bookedEvent.endTime && eventToJoin.endTime > bookedEvent.startTime);
        });

        if (hasOverlap) {
            return res.status(400).json({ statusCode: 400, message: ERRORS.OVERLAP });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            eventId: eventToJoin.id
        });

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
        res.status(400).json({ statusCode: 400, message: e.message });
    }
};

exports.getMyEvents = async (req, res) => { // User events
    try {
        const now = new Date();
        const bookings = await Booking.findAll({
            where: { userId: req.user.id },
            include: [{ model: Event, as: 'event' }],
            order: [[{ model: Event, as: 'event' }, 'startTime', 'DESC']]
        });

        const past = bookings.filter(b => b.event.endTime < now);
        const current = bookings.filter(b => b.event.startTime <= now && b.event.endTime >= now);
        const future = bookings.filter(b => b.event.startTime > now);

        res.send({ past, current, future });
    } catch (e) {
        res.status(500).json({ statusCode: 500, message: e.message });
    }
};

exports.cancelBooking = async (req, res) => { // Cancel booking
    try {
        const booking = await Booking.findOne({
            where: { id: req.params.bookingId, userId: req.user.id },
            include: [{ model: Event, as: 'event' }]
        });
        if (!booking) return res.status(404).json({ statusCode: 404, message: ERRORS.BOOKING_NOT_FOUND });

        const now = new Date();
        const startTime = new Date(booking.event.startTime);
        const hoursDiff = (startTime - now) / (1000 * 60 * 60);

        if (hoursDiff < 8) {
            return res.status(400).json({ statusCode: 400, message: ERRORS.CANCEL_LIMIT });
        }

        booking.status = 'canceled';
        await booking.save();
        res.send(booking);
    } catch (e) {
        res.status(400).json({ statusCode: 400, message: e.message });
    }
};

exports.getEventParticipants = async (req, res) => { // Admin view
    try {
        const participants = await Booking.findAll({
            where: { eventId: req.params.eventId },
            include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
        });
        res.send(participants);
    } catch (e) {
        res.status(500).json({ statusCode: 500, message: e.message });
    }
};
