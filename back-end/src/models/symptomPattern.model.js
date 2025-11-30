// models/symptomPattern.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Symptom Pattern - Learned symptom patterns for each user
 * Used for personalized predictions and suggestions
 */
const SymptomPattern = sequelize.define('SymptomPattern', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Symptom name
    symptom: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Typical cycle day(s) this symptom occurs (JSON array)
    typical_cycle_days: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    // Frequency (0-1, how often this symptom occurs)
    frequency: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    // Average intensity when it occurs (1-5)
    avg_intensity: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Number of occurrences recorded
    occurrence_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    // Cycle phases where symptom typically occurs
    // JSON: { follicular: 0.2, ovulation: 0.1, luteal: 0.5, menstrual: 0.8 }
    phase_distribution: {
        type: DataTypes.JSON,
        defaultValue: {}
    }
}, {
    tableName: 'symptom_patterns',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { unique: true, fields: ['user_id', 'symptom'] }
    ]
});

module.exports = SymptomPattern;
