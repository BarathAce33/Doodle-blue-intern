// Imports
const authService = require('../services/auth.service.js');
const {
    signupSchema,
    loginSchema,
    updatePasswordSchema,
    updateDetailsSchema,
    verifyOtpSchema,
    resetPasswordSchema,
    forgotPasswordSchema
} = require('../utils/validation.js');

class AuthController {
    async signup(req, res, next) {
        try {
            const { error } = signupSchema.validate(req.body);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await authService.signup(req.body);
            res.status(201).json({
                statusCode: 201,
                message: 'User registered successfully',
                data: result,
            });
        } catch (err) {
            next(err);
        }
    }

    async login(req, res, next) {
        try {
            const { error } = loginSchema.validate(req.body);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await authService.login(req.body.email, req.body.password);
            res.status(200).json({
                statusCode: 200,
                message: 'Login successful',
                data: result,
            });
        } catch (err) {
            next(err);
        }
    }

    async updatePassword(req, res, next) {
        try {
            const { error } = updatePasswordSchema.validate(req.body);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await authService.updatePassword(req.user.id, req.body.old_password, req.body.new_password);
            res.status(200).json({
                statusCode: 200,
                message: result.message,
            });
        } catch (err) {
            next(err);
        }
    }

    async updateDetails(req, res, next) {
        try {
            const { error } = updateDetailsSchema.validate(req.body);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await authService.updateDetails(req.user.id, req.body);
            res.status(200).json({
                statusCode: 200,
                message: result.message,
            });
        } catch (err) {
            next(err);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const { error } = forgotPasswordSchema.validate(req.body);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });
            const result = await authService.forgotPassword(req.body.email);
            res.status(200).json({
                statusCode: 200,
                message: result.message,
            });
        } catch (err) {
            next(err);
        }
    }

    async verifyOtp(req, res, next) {
        try {
            const { error } = verifyOtpSchema.validate(req.body);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await authService.verifyOtp(req.body.email, req.body.otp);
            res.status(200).json({
                statusCode: 200,
                message: result.message,
            });
        } catch (err) {
            next(err);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const { error } = resetPasswordSchema.validate(req.body);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await authService.resetPassword(req.body.email, req.body.otp, req.body.new_password);
            res.status(200).json({
                statusCode: 200,
                message: result.message,
            });
        } catch (err) {
            next(err);
        }
    }
}

// Exports
module.exports = new AuthController();
