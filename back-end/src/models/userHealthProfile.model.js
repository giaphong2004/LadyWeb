// models/userHealthProfile.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * User Health Profile - Stores user's reproductive health goals and preferences
 */
const UserHealthProfile = sequelize.define('UserHealthProfile', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    // User's primary goal
    goal: {
        type: DataTypes.ENUM('avoid_pregnancy', 'track_health', 'trying_to_conceive'),
        defaultValue: 'track_health'
    },
    // Average cycle length (learned from data)
    avg_cycle_length: {
        type: DataTypes.FLOAT,
        defaultValue: 28
    },
    // Average period length (learned from data)
    avg_period_length: {
        type: DataTypes.FLOAT,
        defaultValue: 5
    },
    // Cycle length standard deviation (for prediction confidence)
    cycle_length_std: {
        type: DataTypes.FLOAT,
        defaultValue: 2
    },
    // Average luteal phase length (learned)
    avg_luteal_phase: {
        type: DataTypes.FLOAT,
        defaultValue: 14
    },
    // Last menstrual period start date
    last_period_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    // Is user currently pregnant?
    is_pregnant: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Pregnancy start date (if pregnant)
    pregnancy_start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    // Expected due date
    expected_due_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    // Sexual activity tracking enabled
    track_sexual_activity: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Number of cycles recorded (for algorithm accuracy)
    cycles_recorded: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // Notification preferences
    notify_period: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notify_ovulation: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    notify_fertile_window: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    // Days before to send notification
    notify_days_before: {
        type: DataTypes.INTEGER,
        defaultValue: 2
    }
}, {
    tableName: 'user_health_profiles',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = UserHealthProfile;
