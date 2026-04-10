"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistSchema = exports.UpdateProductSchema = exports.CreateProductSchema = void 0;
const joi = require("joi");
exports.CreateProductSchema = joi.object({
    title: joi.string().required(),
    description: joi.string().required(),
    price: joi.number().positive().required(),
    stock: joi.number().integer().min(0).required()
});
exports.UpdateProductSchema = joi.object({
    title: joi.string().optional(),
    description: joi.string().optional(),
    price: joi.number().positive().optional(),
    stock: joi.number().integer().min(0).optional()
}).min(1);
exports.WishlistSchema = joi.object({});
//# sourceMappingURL=product.validator.js.map