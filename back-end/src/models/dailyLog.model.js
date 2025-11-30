// models/dailyLog.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Daily Log - Stores daily symptoms, activities, and observations
 */
const DailyLog = sequelize.define('DailyLog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // The date of this log
    log_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    // Cycle day (calculated)
    cycle_day: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Is period day?
    is_period_day: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Flow intensity (1-5: spotting, light, medium, heavy, very heavy)
    flow_intensity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 }
    },
    // Basal Body Temperature (for ovulation tracking)
    bbt: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Cervical mucus type
    cervical_mucus: {
        type: DataTypes.ENUM('dry', 'sticky', 'creamy', 'watery', 'egg_white'),
        allowNull: true
    },
    // Ovulation test result
    ovulation_test: {
        type: DataTypes.ENUM('negative', 'positive', 'peak'),
        allowNull: true
    },
    // Sexual activity
    sexual_activity: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Protection used (if sexual activity)
    protection_used: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    // Symptoms (stored as JSON array)
    symptoms: {
        type: DataTypes.JSON,
        defaultValue: []
        // Examples: ['cramps', 'headache', 'fatigue', 'mood_swings', 'bloating', 'breast_tenderness', 'acne', 'backache']
    },
    // Mood (1-5 scale)
    mood: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 }
    },
    // Energy level (1-5 scale)
    energy_level: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 }
    },
    // Sleep quality (1-5 scale)
    sleep_quality: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 }
    },
    // Sleep hours
    sleep_hours: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Water intake (glasses)
    water_intake: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Exercise minutes
    exercise_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Weight (optional)
    weight: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Notes
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'daily_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { unique: true, fields: ['user_id', 'log_date'] },
        { fields: ['user_id', 'is_period_day'] }
    ]
});

module.exports = DailyLog;
