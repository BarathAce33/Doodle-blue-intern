import * as joi from 'joi';

export const CreateProductSchema = joi.object({
  title: joi.string().required(),
  description: joi.string().required(),
  price: joi.number().positive().required(),
  stock: joi.number().integer().min(0).required()
});

export const UpdateProductSchema = joi.object({
  title: joi.string().optional(),
  description: joi.string().optional(),
  price: joi.number().positive().optional(),
  stock: joi.number().integer().min(0).optional()
}).min(1);

export const WishlistSchema = joi.object({});
