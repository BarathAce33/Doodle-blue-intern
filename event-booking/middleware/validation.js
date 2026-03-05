const Joi = require('joi');

const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error } = schema.validate(req[property], { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            return res.status(400).json({ statusCode: 400, message: errorMessage });
        }
        next();
    };
};

const registerUserSchema = Joi.object({
    name: Joi.string().required().messages({ 'any.required': 'Name is required' }),
    email: Joi.string().email().required().messages({ 'any.required': 'Email is required', 'string.email': 'Invalid email format' }),
    password: Joi.string().min(6).required().messages({ 'any.required': 'Password is required', 'string.min': 'Password must be at least 6 characters' }),
    role: Joi.string().valid('Admin', 'Customer').required().messages({ 'any.required': 'Role is required (Admin or Customer)', 'any.only': 'Role must be either "Admin" or "Customer"' }),
    area: Joi.string().required().messages({ 'any.required': 'Area is required' }),
    city: Joi.string().required().messages({ 'any.required': 'City is required' }),
    state: Joi.string().required().messages({ 'any.required': 'State is required' }),
    country: Joi.string().required().messages({ 'any.required': 'Country is required' })
});

const schemas = {
    // Auth
    register: registerUserSchema,
    registerBulk: Joi.array().items(registerUserSchema).min(1).messages({
        'array.base': 'Bulk registration requires an ARRAY of user objects [...]',
        'array.min': 'At least one user must be provided for bulk registration'
    }),
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),
    verifyOTP: Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().required()
    }),
    resetPassword: Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().required(),
        password: Joi.string().min(6).required()
    }),
    changePassword: Joi.object({
        currentPassword: Joi.string().required(),
        newPassword: Joi.string().min(6).required()
    }),
    updateProfile: Joi.object({
        name: Joi.string(),
        location: Joi.object({
            area: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            country: Joi.string().required()
        })
    }).min(1),

    // Events
    createEvent: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        startTime: Joi.date().iso().required(),
        endTime: Joi.date().iso().greater(Joi.ref('startTime')).required(),
        area: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        country: Joi.string().required()
    }),
    getNearbyEvents: Joi.object({
        radius: Joi.number().optional()
    })
};

module.exports = { validate, schemas };
