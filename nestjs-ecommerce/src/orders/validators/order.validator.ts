import * as joi from 'joi';

export const PlaceOrderSchema = joi.object({
  products: joi.array().items(
    joi.object({
      productId: joi.string().required(),
      quantity: joi.number().integer().min(1).required()
    })
  ).min(1).required()
});

export const UpdateOrderSchema = joi.object({
  status: joi.string().valid('pending', 'shipped', 'delivered', 'cancelled').optional()
}).min(1);
