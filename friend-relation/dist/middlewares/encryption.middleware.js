"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptionMiddleware = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-secret-key';
const encryptionMiddleware = (req, res, next) => {
    // 1. Decrypt Request
    if (req.body && typeof req.body === 'object' && req.body.encryptedData) {
        try {
            const bytes = crypto_js_1.default.AES.decrypt(req.body.encryptedData, ENCRYPTION_KEY);
            const decryptedString = bytes.toString(crypto_js_1.default.enc.Utf8);
            if (decryptedString) {
                req.body = JSON.parse(decryptedString);
            }
        }
        catch (err) {
            console.error('Decryption error:', err);
            return res.status(400).json({ status: 400, message: 'Invalid encrypted data' });
        }
    }
    // 2. Encrypt Response
    const originalJson = res.json;
    res.json = function (body) {
        if (body && typeof body === 'object' && !body.isError) {
            try {
                const encryptedData = crypto_js_1.default.AES.encrypt(JSON.stringify(body), ENCRYPTION_KEY).toString();
                return originalJson.call(this, { encryptedData });
            }
            catch (err) {
                console.error('Encryption error:', err);
                return originalJson.call(this, body);
            }
        }
        return originalJson.call(this, body);
    };
    next();
};
exports.encryptionMiddleware = encryptionMiddleware;
