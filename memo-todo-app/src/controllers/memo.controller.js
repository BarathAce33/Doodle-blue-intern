// Imports
const memoService = require('../services/memo.service.js');
const { createMemoSchema, updateMemoSchema, paginationSchema, idParamSchema } = require('../utils/validation.js');

class MemoController {
    async createMemo(req, res, next) {
        try {
            const { error } = createMemoSchema.validate(req.body);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await memoService.createMemo(req.user.id, req.body);
            res.status(201).json({
                statusCode: 201,
                message: 'Memo created successfully',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }

    async updateMemo(req, res, next) {
        try {
            const { error: paramError } = idParamSchema.validate(req.params);
            if (paramError) return res.status(400).json({ statusCode: 400, message: paramError.details[0].message });

            const { error } = updateMemoSchema.validate(req.body);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await memoService.updateMemo(req.user.id, req.params.id, req.body);
            res.status(200).json({
                statusCode: 200,
                message: 'Memo updated successfully',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }

    async deleteMemo(req, res, next) {
        try {
            const { error: paramError } = idParamSchema.validate(req.params);
            if (paramError) return res.status(400).json({ statusCode: 400, message: paramError.details[0].message });

            const result = await memoService.deleteMemo(req.user.id, req.params.id);
            res.status(200).json({
                statusCode: 200,
                message: result.message
            });
        } catch (err) {
            next(err);
        }
    }

    async restoreMemo(req, res, next) {
        try {
            const { error: paramError } = idParamSchema.validate(req.params);
            if (paramError) return res.status(400).json({ statusCode: 400, message: paramError.details[0].message });

            const result = await memoService.restoreMemo(req.user.id, req.params.id);
            res.status(200).json({
                statusCode: 200,
                message: result.message
            });
        } catch (err) {
            next(err);
        }
    }

    async getActiveMemos(req, res, next) {
        try {
            const { error } = paginationSchema.validate(req.query);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await memoService.getActiveMemos(req.user.id, req.query);
            res.status(200).json({
                statusCode: 200,
                message: 'Active memos retrieved successfully',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }

    async getTrashedMemos(req, res, next) {
        try {
            const { error } = paginationSchema.validate(req.query);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await memoService.getTrashedMemos(req.user.id, req.query);
            res.status(200).json({
                statusCode: 200,
                message: 'Trashed memos retrieved successfully',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }
}

// Exports
module.exports = new MemoController();
