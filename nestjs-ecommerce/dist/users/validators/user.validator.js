"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialLoginSchema = exports.LoginSchema = exports.RegistrationSchema = void 0;
const joi = require("joi");
exports.RegistrationSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
});
exports.LoginSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
});
exports.SocialLoginSchema = joi.object({
    token: joi.string().required(),
});
//# sourceMappingURL=user.validator.js.map