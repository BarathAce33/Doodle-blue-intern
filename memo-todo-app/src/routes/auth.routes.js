// Imports
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller.js');
const authenticateToken = require('../middlewares/auth.middleware.js');

// Public
router.post('/signup', (req, res, next) => authController.signup(req, res, next));
router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/verify-otp', (req, res, next) => authController.verifyOtp(req, res, next));
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

// Private
router.put('/update-password', authenticateToken, (req, res, next) => authController.updatePassword(req, res, next));
router.put('/update-details', authenticateToken, (req, res, next) => authController.updateDetails(req, res, next));

// Exports
module.exports = router;