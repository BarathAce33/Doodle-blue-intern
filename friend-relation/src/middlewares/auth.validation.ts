import Joi from 'joi';

// page
export const paginationSchema = Joi.object({
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional()
}).unknown(true);

// signup
export const signupSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// login
export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// request
export const friendRequestSchema = Joi.object({
  receiverId: Joi.string().required()
});

// respond
export const respondSchema = Joi.object({
  status: Joi.string().valid('accepted', 'rejected').required()
});

// forget
export const forgetPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

// reset
export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  newPassword: Joi.string().min(6).required()
});

// profile
export const updateProfileSchema = Joi.object({
  username: Joi.string(),
  email: Joi.string().email()
});

// change
export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});
