import * as joi from 'joi';

export const GetReportSchema = joi.object({
  startTime: joi.date().iso().required(),
  endTime: joi.date().iso().required(),
  sortBy: joi.string().valid('createdAt', 'totalAmount', 'status').optional().default('createdAt')
});
