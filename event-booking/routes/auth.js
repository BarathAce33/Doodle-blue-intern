const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

const { auth, authorize } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validation');

router.post('/register', validate(schemas.register), authController.register); // New users
router.post('/register-bulk', validate(schemas.registerBulk), authController.registerBulk); // Bulk new users
router.post('/login', validate(schemas.login), authController.login); // User access
router.post('/forgot-password', validate(schemas.forgotPassword), authController.forgotPassword); // Reset link
router.post('/verify-otp', validate(schemas.verifyOTP), authController.verifyOTP);
router.put('/reset-password', validate(schemas.resetPassword), authController.resetPassword);
router.put('/change-password', auth, validate(schemas.changePassword), authController.changePassword); // Requires JWT
router.put('/profile', auth, validate(schemas.updateProfile), authController.updateProfile); // Requires JWT
router.get('/profile', auth, authController.getProfile); // Requires JWT

// Admin routes
router.get('/users-events', auth, authorize('Admin'), authController.getAllUsers);
router.get('/users/:userId/bookings', auth, authorize('Admin'), authController.getUserBookings);

module.exports = router;
