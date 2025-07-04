const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenstrualCycle = sequelize.define('MenstrualCycle', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    start_date: { type: DataTypes.DATE, allowNull: false },
    end_date: { type: DataTypes.DATE },
    notes: { type: DataTypes.TEXT }
}, {
    tableName: 'menstrual_cycles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false // Không cần updated_at cho bảng này
});

module.exports = MenstrualCycle;