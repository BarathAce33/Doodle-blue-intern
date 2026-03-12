// Imports
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');
const { User } = require('./user.model.js');

const Todo = sequelize.define('Todo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    task_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    expiry: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    completion_status: {
        type: DataTypes.STRING,
        defaultValue: 'PENDING',
        validate: {
            isIn: [['PENDING', 'COMPLETED', 'CANCELLED']],
        },
    },
    is_trashed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    }
}, {
    tableName: 'todos',
    timestamps: true,
    createdAt: 'creation_timestamp',
    updatedAt: 'edit_timestamp',
});

// Associations
User.hasMany(Todo, { foreignKey: 'user_id', as: 'todos' });
Todo.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Exports
module.exports = { Todo };
