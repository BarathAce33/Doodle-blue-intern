// Imports
const { Memo } = require('../models/memo.model.js');
const { Op } = require('sequelize');

class MemoService {
    async createMemo(userId, data) {
        const { title, content } = data;
        const memo = await Memo.create({
            title,
            content,
            user_id: userId,
        });
        return memo;
    }

    async updateMemo(userId, memoId, data) {
        const memo = await Memo.findOne({ where: { id: memoId, user_id: userId } });
        if (!memo) throw { statusCode: 404, message: 'Memo not found' };

        const { title, content } = data;
        await memo.update({ title, content });
        return memo;
    }

    async deleteMemo(userId, memoId) {
        const memo = await Memo.findOne({ where: { id: memoId, user_id: userId } });
        if (!memo) throw { statusCode: 404, message: 'Memo not found' };

        // Soft delete
        memo.is_trashed = true;
        await memo.save();
        return { message: 'Memo moved to trash' };
    }

    async restoreMemo(userId, memoId) {
        const memo = await Memo.findOne({ where: { id: memoId, user_id: userId, is_trashed: true } });
        if (!memo) throw { statusCode: 404, message: 'Trashed Memo not found' };

        memo.is_trashed = false;
        await memo.save();
        return { message: 'Memo restored successfully' };
    }

    async getActiveMemos(userId, { page = 1, limit = 10, search = '' }) {
        const offset = (page - 1) * limit;

        const whereClause = {
            user_id: userId,
            is_trashed: false,
            [Op.or]: [
                { title: { [Op.like]: `%${search}%` } },
                { content: { [Op.like]: `%${search}%` } }
            ]
        };

        const { count, rows } = await Memo.findAndCountAll({
            where: whereClause,
            limit: parseInt(limit, 10),
            offset: parseInt(offset, 10),
            order: [['creation_timestamp', 'DESC']]
        });

        return {
            totalItems: count,
            memos: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
        };
    }

    async getTrashedMemos(userId, { page = 1, limit = 10 }) {
        const offset = (page - 1) * limit;

        const { count, rows } = await Memo.findAndCountAll({
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
            memos: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page, 10),
        };
    }
}

// Exports
module.exports = new MemoService();
