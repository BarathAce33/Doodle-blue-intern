// Imports
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database.js');
const { User } = require('./user.model.js');

const Memo = sequelize.define('Memo', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: true,
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
    tableName: 'memos',
    timestamps: true,
    createdAt: 'creation_timestamp',
    updatedAt: 'edit_timestamp',
});

// Associations
User.hasMany(Memo, { foreignKey: 'user_id', as: 'memos' });
Memo.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Exports
module.exports = { Memo };
