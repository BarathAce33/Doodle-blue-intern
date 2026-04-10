import * as joi from 'joi';

export const RegistrationSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
});

export const LoginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

export const SocialLoginSchema = joi.object({
  token: joi.string().required(),
});
