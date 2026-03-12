// Imports
const todoService = require('../services/todo.service.js');
const { createTodoSchema, updateTodoSchema, paginationSchema, idParamSchema } = require('../utils/validation.js');

class TodoController {
    async createTodo(req, res, next) {
        try {
            const { error } = createTodoSchema.validate(req.body);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await todoService.createTodo(req.user.id, req.body);
            res.status(201).json({
                statusCode: 201,
                message: 'Todo created successfully',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }

    async updateTodo(req, res, next) {
        try {
            const { error: paramError } = idParamSchema.validate(req.params);
            if (paramError) return res.status(400).json({ statusCode: 400, message: paramError.details[0].message });

            const { error } = updateTodoSchema.validate(req.body);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await todoService.updateTodo(req.user.id, req.params.id, req.body);
            res.status(200).json({
                statusCode: 200,
                message: 'Todo updated successfully',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }

    async deleteTodo(req, res, next) {
        try {
            const { error: paramError } = idParamSchema.validate(req.params);
            if (paramError) return res.status(400).json({ statusCode: 400, message: paramError.details[0].message });

            const result = await todoService.deleteTodo(req.user.id, req.params.id);
            res.status(200).json({
                statusCode: 200,
                message: result.message
            });
        } catch (err) {
            next(err);
        }
    }

    async restoreTodo(req, res, next) {
        try {
            const { error: paramError } = idParamSchema.validate(req.params);
            if (paramError) return res.status(400).json({ statusCode: 400, message: paramError.details[0].message });

            const result = await todoService.restoreTodo(req.user.id, req.params.id);
            res.status(200).json({
                statusCode: 200,
                message: result.message
            });
        } catch (err) {
            next(err);
        }
    }

    async getActiveTodos(req, res, next) {
        try {
            const { error } = paginationSchema.validate(req.query);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await todoService.getActiveTodos(req.user.id, req.query);
            res.status(200).json({
                statusCode: 200,
                message: 'Active todos retrieved successfully',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }

    async getExpiredTodos(req, res, next) {
        try {
            const { error } = paginationSchema.validate(req.query);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await todoService.getExpiredTodos(req.user.id, req.query);
            res.status(200).json({
                statusCode: 200,
                message: 'Expired todos retrieved successfully',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }

    async getTrashedTodos(req, res, next) {
        try {
            const { error } = paginationSchema.validate(req.query);
            if (error) return res.status(400).json({ statusCode: 400, message: error.details[0].message });

            const result = await todoService.getTrashedTodos(req.user.id, req.query);
            res.status(200).json({
                statusCode: 200,
                message: 'Trashed todos retrieved successfully',
                data: result
            });
        } catch (err) {
            next(err);
        }
    }
}

// Exports
module.exports = new TodoController();
