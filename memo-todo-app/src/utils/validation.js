// Imports
const Joi = require('joi');

// Schemas
const signupSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email structure',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(6).required().messages({
        'string.min': 'Password must be at least 6 characters long',
        'any.required': 'Password is required'
    }),
    first_name: Joi.string().required().messages({
        'any.required': 'First name is required'
    }),
    last_name: Joi.string().optional(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email structure',
        'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required'
    }),
});

const updatePasswordSchema = Joi.object({
    old_password: Joi.string().required().messages({
        'any.required': 'Old password is required'
    }),
    new_password: Joi.string().min(6).invalid(Joi.ref('old_password')).required().messages({
        'string.min': 'New password must be at least 6 characters long',
        'any.invalid': 'New password cannot be the same as the old password',
        'any.required': 'New password is required'
    }),
});

const updateDetailsSchema = Joi.object({
    first_name: Joi.string().optional(),
    last_name: Joi.string().optional(),
}).min(1).messages({
    'object.min': 'At least one field (first_name or last_name) must be provided for update'
});

const verifyOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required().messages({
        'string.length': 'OTP must be exactly 6 characters',
    }),
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    new_password: Joi.string().min(6).required().messages({
        'string.min': 'New password must be at least 6 characters long',
    }),
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email structure',
        'any.required': 'Email is required'
    })
});

// Todo
const createTodoSchema = Joi.object({
    task_name: Joi.string().required().messages({
        'any.required': 'Task name is required'
    }),
    expiry: Joi.date().iso().optional().messages({
        'date.format': 'Expiry must be a valid ISO date'
    }),
});

const updateTodoSchema = Joi.object({
    task_name: Joi.string().optional(),
    expiry: Joi.date().iso().optional().messages({
        'date.format': 'Expiry must be a valid ISO date'
    }),
    completion_status: Joi.string().valid('PENDING', 'COMPLETED', 'CANCELLED').optional().messages({
        'any.only': 'Status must be PENDING, COMPLETED, or CANCELLED'
    }),
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

// Memo
const createMemoSchema = Joi.object({
    title: Joi.string().required().messages({
        'any.required': 'Title is required'
    }),
    content: Joi.string().optional(),
});

const updateMemoSchema = Joi.object({
    title: Joi.string().optional(),
    content: Joi.string().optional(),
}).min(1).messages({
    'object.min': 'At least one field (title or content) must be provided for update'
});

// Common
const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).optional().default(1),
    limit: Joi.number().integer().min(1).max(100).optional().default(10),
    search: Joi.string().trim().allow('', null).optional().default(''),
});

const idParamSchema = Joi.object({
    id: Joi.number().integer().required().messages({
        'number.base': 'ID must be a number',
        'any.required': 'ID is required'
    }),
});

// Exports
module.exports = {
    signupSchema,
    loginSchema,
    updatePasswordSchema,
    updateDetailsSchema,
    verifyOtpSchema,
    resetPasswordSchema,
    forgotPasswordSchema,
    createTodoSchema,
    updateTodoSchema,
    createMemoSchema,
    updateMemoSchema,
    paginationSchema,
    idParamSchema,
};
