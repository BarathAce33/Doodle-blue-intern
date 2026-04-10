"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetReportSchema = void 0;
const joi = require("joi");
exports.GetReportSchema = joi.object({
    startTime: joi.date().iso().required(),
    endTime: joi.date().iso().required(),
    sortBy: joi.string().valid('createdAt', 'totalAmount', 'status').optional().default('createdAt')
});
//# sourceMappingURL=reports.validator.js.map