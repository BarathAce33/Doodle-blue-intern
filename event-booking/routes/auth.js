const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

const { auth } = require('../middleware/authMiddleware');

router.post('/register', authController.register); // New users
router.post('/login', authController.login); // User access
router.post('/forgot-password', authController.forgotPassword); // Reset link
router.post('/verify-otp', authController.verifyOTP);
router.put('/reset-password', authController.resetPassword);
router.put('/change-password', auth, authController.changePassword); // Requires JWT
router.put('/profile', auth, authController.updateProfile); // Requires JWT

module.exports = router;
