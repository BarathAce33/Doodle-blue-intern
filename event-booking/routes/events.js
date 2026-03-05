const express = require('express');
const eventsController = require('../controllers/eventsController');
const { auth, authorize } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validation');
const router = express.Router();

// List all events with pagination
router.get('/', eventsController.getAllEvents); // View all

// Admin creates event
router.post('/', auth, authorize('Admin'), validate(schemas.createEvent), eventsController.createEvent); // Admin only

// View nearby events
router.get('/nearby', auth, validate(schemas.getNearbyEvents, 'query'), eventsController.getNearbyEvents); // Distance check

// Join event
router.post('/join/:eventId', auth, authorize('Customer'), eventsController.joinEvent);

// View my events
router.get('/my-events', auth, eventsController.getMyEvents);

// Cancel booking
router.post('/cancel/:bookingId', auth, authorize('Customer'), eventsController.cancelBooking);

// View participants (Admin only)
router.get('/:eventId/participants', auth, authorize('Admin'), eventsController.getEventParticipants);

module.exports = router;
