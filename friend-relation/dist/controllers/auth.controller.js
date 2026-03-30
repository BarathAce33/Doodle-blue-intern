"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.resetPassword = exports.forgetPassword = exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const counter_model_1 = __importDefault(require("../models/counter.model"));
const mail_util_1 = require("../utils/mail.util");
// signup
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        // existing
        const existing = yield user_model_1.default.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return res.status(400).json({ status: 400, message: 'User already exists' });
        }
        // id
        const counter = yield counter_model_1.default.findOneAndUpdate({ id: 'user_id' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        if (!counter)
            throw new Error('No counter');
        // save
        const hashed = yield bcryptjs_1.default.hash(password, 10);
        const newUser = yield user_model_1.default.create({
            _id: counter.seq,
            username,
            email,
            password: hashed
        });
        return res.status(201).json({
            status: 201,
            message: 'User created fully',
            data: { userId: newUser._id }
        });
    }
    catch (err) {
        next(err);
    }
});
exports.signup = signup;
// login
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // find
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: 400, message: 'Invalid credentials' });
        }
        // Pass
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 400, message: 'Invalid credentials' });
        }
        // token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        return res.status(200).json({
            status: 200,
            message: 'Login done',
            data: { userId: user._id, token }
        });
    }
    catch (err) {
        next(err);
    }
});
exports.login = login;
// forget
const forgetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        // token
        const token = jsonwebtoken_1.default.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '10m' });
        // mail
        yield (0, mail_util_1.sendEmail)(email, 'Password Reset', `Your token is: ${token}`);
        return res.status(200).json({ status: 200, message: 'Reset token sent to email' });
    }
    catch (err) {
        next(err);
    }
});
exports.forgetPassword = forgetPassword;
// reset
const resetPassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, newPassword } = req.body;
        // verify
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        const user = yield user_model_1.default.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        // save
        user.password = yield bcryptjs_1.default.hash(newPassword, 10);
        yield user.save();
        return res.status(200).json({ status: 200, message: 'Password reset done' });
    }
    catch (err) {
        return res.status(400).json({ status: 400, message: 'Invalid or expired token' });
    }
});
exports.resetPassword = resetPassword;
// update
const updateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email } = req.body;
        const userId = req.user;
        // check
        if (email) {
            const existing = yield user_model_1.default.findOne({ email, _id: { $ne: userId } });
            if (existing)
                return res.status(400).json({ status: 400, message: 'Email taken' });
        }
        // update
        yield user_model_1.default.findByIdAndUpdate(userId, { username, email });
        return res.status(200).json({ status: 200, message: 'Profile updated' });
    }
    catch (err) {
        next(err);
    }
});
exports.updateProfile = updateProfile;
// change
const changePassword = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { oldPassword, newPassword } = req.body;
        const userId = req.user;
        const user = yield user_model_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ status: 404, message: 'User not found' });
        // compare
        const isMatch = yield bcryptjs_1.default.compare(oldPassword, user.password);
        if (!isMatch)
            return res.status(400).json({ status: 400, message: 'Old password wrong' });
        // save
        user.password = yield bcryptjs_1.default.hash(newPassword, 10);
        yield user.save();
        return res.status(200).json({ status: 200, message: 'Password changed' });
    }
    catch (err) {
        next(err);
    }
});
exports.changePassword = changePassword;
