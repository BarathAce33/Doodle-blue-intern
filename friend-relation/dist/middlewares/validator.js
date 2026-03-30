"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// val
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                status: 400,
                message: error.details[0].message
            });
        }
        next();
    };
};
exports.default = validate;
