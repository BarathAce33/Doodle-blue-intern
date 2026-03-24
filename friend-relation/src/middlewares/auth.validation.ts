import Joi from 'joi';

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
  receiverId: Joi.number().required()
});

// respond
export const respondSchema = Joi.object({
  status: Joi.string().valid('accepted', 'rejected').required()
});
