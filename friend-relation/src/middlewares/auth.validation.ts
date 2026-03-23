const Joi = require('joi');

// signup val
exports.signupSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// login val
exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// request val
exports.friendRequestSchema = Joi.object({
  receiverId: Joi.number().required()
});

// response val
exports.respondSchema = Joi.object({
  status: Joi.string().valid('accepted', 'rejected').required()
});

export {};
