const cron = require('node-cron');
const { Op } = require('sequelize');
const { Todo } = require('../models/todo.model.js');
const { User } = require('../models/user.model.js');
const emailService = require('../services/email.service.js');

const startCronJobs = () => {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
        try {
            const now = new Date();
            const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

            // Find tasks expiring within the next hour or already expired but not notified
            const todosToNotify = await Todo.findAll({
                where: {
                    expiry: {
                        [Op.lte]: oneHourFromNow,
                        [Op.not]: null
                    },
                    is_notified: false,
                    is_trashed: false,
                    completion_status: 'PENDING'
                },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['email', 'first_name']
                }]
            });

            for (const todo of todosToNotify) {
                if (todo.user && todo.user.email) {
                    const success = await emailService.sendTodoNotificationEmail(
                        todo.user.email,
                        todo.task_name,
                        todo.expiry
                    );

                    if (success) {
                        todo.is_notified = true;
                        await todo.save();
                        console.log(`Notification sent for task: ${todo.task_name}`);
                    }
                }
            }
        } catch (error) {
            console.error('Error running cron job:', error);
        }
    });
};

module.exports = { startCronJobs };
