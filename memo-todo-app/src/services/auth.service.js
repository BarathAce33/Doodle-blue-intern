// Imports
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user.model.js');
const emailService = require('./email.service.js');
const { Op } = require('sequelize');

class AuthService {
    async signup(data) {
        const { email, password, first_name, last_name } = data;

        // Check user
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            throw { statusCode: 400, message: 'User already exists' };
        }

        // Hash pass
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Add user
        const user = await User.create({
            email,
            password_hash,
            first_name,
            last_name,
        });

        return { id: user.id, email: user.email };
    }

    async login(email, password) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw { statusCode: 401, message: 'Invalid email or password' };
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            throw { statusCode: 401, message: 'Invalid email or password' };
        }

        // JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret_key',
            { expiresIn: '1d' }
        );

        return { token, user: { id: user.id, email: user.email } };
    }

    async updatePassword(userId, oldPassword, newPassword) {
        const user = await User.findByPk(userId);
        if (!user) throw { statusCode: 404, message: 'User not found' };

        const validPassword = await bcrypt.compare(oldPassword, user.password_hash);
        if (!validPassword) throw { statusCode: 400, message: 'Invalid old password' };

        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);
        await user.save();

        return { message: 'Password updated successfully' };
    }

    async updateDetails(userId, details) {
        const user = await User.findByPk(userId);
        if (!user) throw { statusCode: 404, message: 'User not found' };

        await user.update(details);
        return { message: 'User details updated successfully' };
    }

    async forgotPassword(email) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return { message: 'If this email exists, an OTP will be sent to it.' };
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 15 min expiry
        const expiry = new Date();
        expiry.setMinutes(expiry.getMinutes() + 15);

        user.reset_otp = otp;
        user.reset_otp_expiry = expiry;
        await user.save();

        // Send Email
        await emailService.sendOTPEmail(email, otp);

        return { message: 'If this email exists, an OTP will be sent to it.' };
    }

    async verifyOtp(email, otp) {
        const user = await User.findOne({
            where: {
                email,
                reset_otp: otp,
                reset_otp_expiry: { [Op.gt]: new Date() } // not expired
            }
        });

        if (!user) throw { statusCode: 400, message: 'Invalid or Expired OTP' };

        return { message: 'OTP Verified successfully. You may now reset your password.' };
    }

    async resetPassword(email, otp, newPassword) {
        const user = await User.findOne({
            where: {
                email,
                reset_otp: otp,
                reset_otp_expiry: { [Op.gt]: new Date() }
            }
        });

        if (!user) throw { statusCode: 400, message: 'Invalid or Expired OTP for password reset' };

        const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
        if (isSamePassword) {
            throw { statusCode: 400, message: 'New password cannot be the same as the old password' };
        }

        const salt = await bcrypt.genSalt(10);
        user.password_hash = await bcrypt.hash(newPassword, salt);

        // Clear OTP fields
        user.reset_otp = null;
        user.reset_otp_expiry = null;
        await user.save();

        return { message: 'Password reset successfully' };
    }
}

// Exports
module.exports = new AuthService();
