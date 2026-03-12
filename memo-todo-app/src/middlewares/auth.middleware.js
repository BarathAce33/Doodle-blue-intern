// Imports
const jwt = require('jsonwebtoken');

// Auth
const authenticateToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({
            statusCode: 401,
            message: 'Access denied. No token provided.',
        });
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.user = verified;
        next();
    } catch (err) {
        res.status(403).json({
            statusCode: 403,
            message: 'Invalid or expired token.',
        });
    }
};

// Exports
module.exports = authenticateToken;
