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
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const Counter = require('../models/counter.model');
// signup
exports.signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, email, password } = req.body;
        const existing = yield User.findOne({ $or: [{ email }, { username }] });
        if (existing) {
            return res.status(400).json({ status: 400, message: 'User already exists' });
        }
        // counter
        const counter = yield Counter.findOneAndUpdate({ id: 'user_id' }, { $inc: { seq: 1 } }, { new: true, upsert: true });
        const hashed = yield bcrypt.hash(password, 10);
        const newUser = yield User.create({
            _id: counter.seq,
            username,
            email,
            password: hashed
        });
        res.status(201).json({
            status: 201,
            message: 'User created successfully',
            data: { userId: newUser._id }
        });
    }
    catch (err) {
        next(err);
    }
});
// login
exports.login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield User.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: 400, message: 'Invalid credentials' });
        }
        const isMatch = yield bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ status: 400, message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.status(200).json({
            status: 200,
            message: 'Login success',
            data: {
                userId: user._id,
                token
            }
        });
    }
    catch (err) {
        next(err);
    }
});
