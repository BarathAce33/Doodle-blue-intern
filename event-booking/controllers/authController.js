const { User } = require('../models');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const transporter = require('../config/email');
const { geocodeAddress } = require('../utils/geocode');
const { SUCCESS, ERRORS } = require('../config/constants');

exports.register = async (req, res) => { // User registration
    try {
        const { name, email, password, role, area, city, state, country } = req.body;

        const locationString = `${area}, ${city}, ${state}, ${country}`;
        const { latitude, longitude } = await geocodeAddress(locationString);

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Customer',
            latitude,
            longitude,
            area,
            city,
            state,
            country
        });

        const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET);
        res.status(201).send({ message: SUCCESS.REGISTERED, user, token });
    } catch (e) {
        res.status(400).json({ statusCode: 400, message: e.message });
    }
};

exports.registerBulk = async (req, res) => { // Bulk user registration
    try {
        const usersData = [];
        for (const user of req.body) {
            const locationString = `${user.area}, ${user.city}, ${user.state}, ${user.country}`;
            const { latitude, longitude } = await geocodeAddress(locationString);

            // Manual hash for insertMany
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            usersData.push({
                name: user.name,
                email: user.email,
                password: hashedPassword,
                role: user.role || 'Customer',
                latitude,
                longitude,
                area: user.area,
                city: user.city,
                state: user.state,
                country: user.country
            });
        }

        // Insert Multiple Users at once (Sequelize equivalent)
        const users = await User.bulkCreate(usersData, { ignoreDuplicates: true });

        res.status(201).json({
            statusCode: 201,
            message: `${users.length} users registered successfully!`,
            count: users.length
        });
    } catch (e) {
        // Handle partial successes or bulk errors
        res.status(400).json({ statusCode: 400, message: e.message });
    }
};

exports.login = async (req, res) => { // User login
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ statusCode: 401, message: ERRORS.LOGIN_FAILED });
        }

        const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET);
        res.send({ message: SUCCESS.LOGGED_IN, user, token });
    } catch (e) {
        res.status(400).json({ statusCode: 400, message: e.message });
    }
};

exports.forgotPassword = async (req, res) => { // OTP request
    try {
        // Validate input
        if (!req.body.email) {
            return res.status(400).json({ statusCode: 400, message: 'Email is required' });
        }

        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) return res.status(404).json({ statusCode: 404, message: ERRORS.USER_NOT_FOUND });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        // Store hashed OTP
        await user.update({
            otp: hashedOtp,
            otpExpire: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
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
            res.status(500).json({ statusCode: 500, message: 'Internal server error with email provider' + " - " + 'Email could not be sent. Check terminal for the OTP (local testing mode).' });
        }
    } catch (e) {
        res.status(500).json({ statusCode: 500, message: e.message });
    }
};

exports.verifyOTP = async (req, res) => { // Verify OTP
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ statusCode: 400, message: 'Email and OTP are required' });
        }

        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        const { Op } = require('sequelize');
        const user = await User.findOne({
            where: {
                email,
                otp: hashedOtp,
                otpExpire: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ statusCode: 400, message: ERRORS.INVALID_OTP });
        }

        res.status(200).send({ message: SUCCESS.OTP_VERIFIED });
    } catch (e) {
        res.status(400).json({ statusCode: 400, message: e.message });
    }
};

exports.resetPassword = async (req, res) => { // Reset password
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({ statusCode: 400, message: 'Email, OTP, and new password are required' });
        }

        const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

        const { Op } = require('sequelize');
        const user = await User.findOne({
            where: {
                email,
                otp: hashedOtp,
                otpExpire: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ statusCode: 400, message: ERRORS.INVALID_OTP });
        }

        // Clear OTP after use (using save() to trigger pre-save hashing)
        user.password = password;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save();

        res.status(200).send({ message: SUCCESS.RESET_SUCCESS });
    } catch (e) {
        res.status(400).json({ statusCode: 400, message: e.message });
    }
};

exports.changePassword = async (req, res) => { // Auth password change
    try {
        const user = await User.findByPk(req.user.id);
        if (user.password !== req.body.currentPassword) {
            return res.status(400).json({ statusCode: 400, message: ERRORS.LOGIN_FAILED });
        }
        user.password = req.body.newPassword;
        await user.save();
        res.send({ message: SUCCESS.PASSWORD_CHANGED });
    } catch (e) {
        res.status(400).json({ statusCode: 400, message: e.message });
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
            return res.status(400).json({ statusCode: 400, message: 'Invalid updates! Only name and location are allowed.' });
        }

        if (req.body.location) {
            const loc = req.body.location;
            const locationString = `${loc.area}, ${loc.city}, ${loc.state}, ${loc.country}`;
            const { latitude, longitude } = await geocodeAddress(locationString);

            user.latitude = latitude;
            user.longitude = longitude;
            user.area = loc.area;
            user.city = loc.city;
            user.state = loc.state;
            user.country = loc.country;
        }

        if (req.body.name) user.name = req.body.name;

        await user.save();

        // User not found check
        if (!user) {
            return res.status(404).json({ statusCode: 404, message: ERRORS.USER_NOT_FOUND });
        }

        res.send({ message: SUCCESS.PROFILE_UPDATED, user });
    } catch (e) {
        res.status(400).json({ statusCode: 400, message: e.message });
    }
};

exports.getProfile = async (req, res) => { // Get current profile
    try {
        const user = await User.findByPk(req.user.id);
        res.send(user);
    } catch (e) {
        res.status(500).json({ statusCode: 500, message: e.message });
    }
};

exports.getAllUsers = async (req, res) => { // Admin feature
    try {
        const { Booking, Event } = require('../models');
        const users = await User.findAll({
            where: { role: 'Customer' },
            attributes: ['id', 'name', 'email', 'role'],
            include: [{
                model: Booking,
                as: 'bookings',
                include: [{
                    model: Event,
                    as: 'event',
                    attributes: ['id', 'title', 'startTime', 'area', 'city']
                }]
            }]
        });
        res.send(users);
    } catch (e) {
        res.status(500).json({ statusCode: 500, message: e.message });
    }
};

exports.getUserBookings = async (req, res) => { // Admin feature
    try {
        const { Booking, Event } = require('../models');
        const bookings = await Booking.findAll({
            where: { userId: req.params.userId },
            include: [{ model: Event, as: 'event' }]
        });
        res.send(bookings);
    } catch (e) {
        res.status(500).json({ statusCode: 500, message: e.message });
    }
};
