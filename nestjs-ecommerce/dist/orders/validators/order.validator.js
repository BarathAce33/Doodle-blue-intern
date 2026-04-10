"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateOrderSchema = exports.PlaceOrderSchema = void 0;
const joi = require("joi");
exports.PlaceOrderSchema = joi.object({
    products: joi.array().items(joi.object({
        productId: joi.string().required(),
        quantity: joi.number().integer().min(1).required()
    })).min(1).required()
});
exports.UpdateOrderSchema = joi.object({
    status: joi.string().valid('pending', 'shipped', 'delivered', 'cancelled').optional()
}).min(1);
//# sourceMappingURL=order.validator.js.map