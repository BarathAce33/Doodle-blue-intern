"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    // json
    if (err instanceof SyntaxError && 'body' in err) {
        return res.status(400).json({ status: 400, message: 'Invalid JSON' });
    }
    // default
    let status = err.status || 500;
    let message = err.message || 'Server error';
    // mongo
    if (err.name === 'ValidationError')
        status = 400;
    if (err.code === 11000) {
        status = 400;
        message = 'Duplicate value';
    }
    // response
    return res.status(status).json({ status, message });
};
exports.default = errorHandler;
