"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordSchema = exports.updateProfileSchema = exports.resetPasswordSchema = exports.forgetPasswordSchema = exports.respondSchema = exports.friendRequestSchema = exports.loginSchema = exports.signupSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// signup
exports.signupSchema = joi_1.default.object({
    username: joi_1.default.string().required(),
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required()
});
// login
exports.loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required()
});
// request
exports.friendRequestSchema = joi_1.default.object({
    receiverId: joi_1.default.number().required()
});
// respond
exports.respondSchema = joi_1.default.object({
    status: joi_1.default.string().valid('accepted', 'rejected').required()
});
// forget
exports.forgetPasswordSchema = joi_1.default.object({
    email: joi_1.default.string().email().required()
});
// reset
exports.resetPasswordSchema = joi_1.default.object({
    token: joi_1.default.string().required(),
    newPassword: joi_1.default.string().min(6).required()
});
// profile
exports.updateProfileSchema = joi_1.default.object({
    username: joi_1.default.string(),
    email: joi_1.default.string().email()
});
// change
exports.changePasswordSchema = joi_1.default.object({
    oldPassword: joi_1.default.string().required(),
    newPassword: joi_1.default.string().min(6).required()
});
