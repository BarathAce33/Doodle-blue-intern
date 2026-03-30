"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth = (req, res, next) => {
    // header
    const authHeader = req.header('Authorization');
    // check
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ status: 401, message: 'No token' });
    }
    // extract
    const parts = authHeader.split(' ');
    if (parts.length !== 2) {
        return res.status(401).json({ status: 401, message: 'Bad format' });
    }
    const token = parts[1];
    // verify
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded.id;
        next();
    }
    catch (err) {
        return res.status(401).json({ status: 401, message: 'Bad token' });
    }
};
exports.auth = auth;
