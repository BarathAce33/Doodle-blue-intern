const Joi = require('joi');

const createBannerSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name must not exceed 100 characters'
    }),
  link: Joi.string()
    .uri()
    .required()
    .messages({
      'string.empty': 'Link is required',
      'string.uri': 'Link must be a valid URL'
    }),
  status: Joi.string()
    .valid('active', 'inactive')
    .default('active')
    .messages({
      'any.only': 'Status must be either active or inactive'
    })
});

const updateBannerSchema = Joi.object({
  name: Joi.string()
    .min(3)
    .max(100)
    .messages({
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name must not exceed 100 characters'
    }),
  link: Joi.string()
    .uri()
    .messages({
      'string.uri': 'Link must be a valid URL'
    }),
  status: Joi.string()
    .valid('active', 'inactive')
    .messages({
      'any.only': 'Status must be either active or inactive'
    })
}).min(1);

const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10)
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit must not exceed 100'
    })
});

module.exports = {
  createBannerSchema,
  updateBannerSchema,
  paginationSchema
};
