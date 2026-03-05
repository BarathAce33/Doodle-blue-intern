const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => { // User authentication
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) throw new Error();

        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
        const user = await User.findByPk(decoded._id);

        if (!user) throw new Error();

        req.token = token;
        req.user = user;
        next();
    } catch (e) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

const authorize = (roles = []) => { // Role-based access
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        if (roles.length && !roles.includes(req.user.role)) {
            return res.status(403).json({
                statusCode: 403,
                message: `Forbidden: This action requires one of the following roles: [${roles.join(', ')}]. Your current role is: "${req.user.role}"`
            });
        }
        next();
    };
};

module.exports = { auth, authorize };
