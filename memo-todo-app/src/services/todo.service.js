// Imports
const { Todo } = require('../models/todo.model.js');
const { Op } = require('sequelize');

class TodoService {
    async createTodo(userId, data) {
        const { task_name, expiry } = data;
        const todo = await Todo.create({
            task_name,
            expiry,
            user_id: userId,
        });
        return todo;
    }

    async updateTodo(userId, todoId, data) {
        const todo = await Todo.findOne({ where: { id: todoId, user_id: userId } });
        if (!todo) throw { statusCode: 404, message: 'Todo not found' };

        const { task_name, expiry, completion_status } = data;
        await todo.update({ task_name, expiry, completion_status });
        return todo;
    }

    async deleteTodo(userId, todoId) {
        const todo = await Todo.findOne({ where: { id: todoId, user_id: userId } });
        if (!todo) throw { statusCode: 404, message: 'Todo not found' };

        // Soft delete
        todo.is_trashed = true;
        await todo.save();
        return { message: 'Todo moved to trash' };
    }

    async restoreTodo(userId, todoId) {
        const todo = await Todo.findOne({ where: { id: todoId, user_id: userId, is_trashed: true } });
        if (!todo) throw { statusCode: 404, message: 'Trashed Todo not found' };

        todo.is_trashed = false;
        await todo.save();
        return { message: 'Todo restored successfully' };
    }

    async getActiveTodos(userId, { page = 1, limit = 10, search = '' }) {
        const offset = (page - 1) * limit;

        const whereClause = {
            user_id: userId,
            is_trashed: false,
            [Op.or]: [
                { expiry: { [Op.gt]: new Date() } },
                { expiry: null }
            ],
            task_name: {
                [Op.like]: `%${search}%`
            }
        };

        const { count, rows } = await Todo.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            order: [['creation_timestamp', 'DESC']]
        });

        return {
            totalItems: count,
            todos: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
        };
    }

    async getExpiredTodos(userId, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;

        const { count, rows } = await Todo.findAndCountAll({
            where: {
                user_id: userId,
                is_trashed: false,
                expiry: { [Op.lt]: new Date() } // Past expiry
            },
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            order: [['expiry', 'ASC']]
        });

        return {
            totalItems: count,
            todos: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
        };
    }

    async getTrashedTodos(userId, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;

        const { count, rows } = await Todo.findAndCountAll({
            where: {
                user_id: userId,
                is_trashed: true
            },
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            order: [['edit_timestamp', 'DESC']]
        });

        return {
            totalItems: count,
            todos: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
        };
    }
}

// Exports
module.exports = new TodoService();
