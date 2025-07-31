const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExpertProfile = sequelize.define('ExpertProfile', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users', // Tên bảng
            key: 'id'
        }
    },
    title: { // Chức danh
        type: DataTypes.STRING,
        allowNull: true
    },
    bio: { // Tiểu sử
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'approved'
    }
}, {
    tableName: 'expert_profiles',
    timestamps: false
});

module.exports = ExpertProfile;