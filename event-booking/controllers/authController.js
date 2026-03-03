const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const transporter = require('../config/email');
const { SUCCESS, ERRORS } = require('../config/constants');

exports.register = async (req, res) => { // User registration
    try {
        const { name, email, password, role, latitude, longitude } = req.body;

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Customer',
            location: { latitude: Number(latitude), longitude: Number(longitude) }
        });

        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
        res.status(201).send({ message: SUCCESS.REGISTERED, user, token });
    } catch (e) {
        res.status(400).send(e.message);
    }
};

exports.login = async (req, res) => { // User login
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(401).send({ error: ERRORS.LOGIN_FAILED });
        }
        const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
        res.send({ message: SUCCESS.LOGGED_IN, user, token });
    } catch (e) {
        res.status(400).send(e.message);
    }
};

exports.forgotPassword = async (req, res) => { // OTP request
    try {
        // Validate input
        if (!req.body.email) {
            return res.status(400).send({ error: 'Email is required' });
        }

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).send({ error: ERRORS.USER_NOT_FOUND });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        // Store hashed OTP
        await User.findByIdAndUpdate(user._id, {
            otp: hashedOtp,
            otpExpire: Date.now() + 10 * 60 * 1000 // 10 minutes expiry
        });

        // Send OTP via email

        try {
            await transporter.sendMail({
                to: user.email,
                subject: 'Password Reset OTP',
                text: `Your password reset OTP is: ${otp}. It is valid for 10 minutes.`
            });
            res.status(200).send({ message: SUCCESS.OTP_SENT });
        } catch (err) {
            res.status(500).send({
                error: 'Email could not be sent. Check terminal for the OTP (local testing mode).',
                message: 'Internal server error with email provider'
            });
        }
    } catch (e) {
        res.status(500).send(e.message);
    }
};

exports.verifyOTP = async (req, res) => { // Verify OTP
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).send({ error: 'Email and OTP are required' });
        }

        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({
            email,
            otp: hashedOtp,
            otpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send({ error: ERRORS.INVALID_OTP });
        }

        res.status(200).send({ message: SUCCESS.OTP_VERIFIED });
    } catch (e) {
        res.status(400).send(e.message);
    }
};

exports.resetPassword = async (req, res) => { // Reset password
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).send({ error: 'Email, OTP, and new password are required' });
        }

        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        const user = await User.findOne({
            email,
            otp: hashedOtp,
            otpExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).send({ error: ERRORS.INVALID_OTP });
        }

        // Clear OTP after use
        await User.findByIdAndUpdate(user._id, {
            password,
            otp: undefined,
            otpExpire: undefined
        });

        res.status(200).send({ message: SUCCESS.RESET_SUCCESS });
    } catch (e) {
        res.status(400).send(e.message);
    }
};

exports.changePassword = async (req, res) => { // Auth password change
    try {
        const user = await User.findById(req.user._id);
        if (user.password !== req.body.currentPassword) {
            return res.status(400).send({ error: ERRORS.LOGIN_FAILED });
        }
        user.password = req.body.newPassword;
        await user.save();
        res.send({ message: SUCCESS.PASSWORD_CHANGED });
    } catch (e) {
        res.status(400).send(e.message);
    }
};

exports.updateProfile = async (req, res) => { // Edit profile
    try {
        // Restricted updates
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'location'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            // Error message for invalid updates
            return res.status(400).send({ error: 'Invalid updates! Only name and location are allowed.' });
        }

        // Update with validation
        const user = await User.findByIdAndUpdate(req.user._id, req.body, {
            new: true,
            runValidators: true
        });

        // User not found check
        if (!user) {
            return res.status(404).send({ error: ERRORS.USER_NOT_FOUND });
        }

        res.send({ message: SUCCESS.PROFILE_UPDATED, user });
    } catch (e) {
        res.status(400).send(e.message);
    }
};
