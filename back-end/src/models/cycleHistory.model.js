// models/cycleHistory.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Cycle History - Stores detailed cycle data for learning
 */
const CycleHistory = sequelize.define('CycleHistory', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Cycle start date (first day of period)
    start_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    // Cycle end date (day before next period starts)
    end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    // Period end date (last day of bleeding)
    period_end_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    // Actual cycle length (calculated when next cycle starts)
    cycle_length: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Actual period length
    period_length: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Ovulation date (if tracked/confirmed)
    ovulation_date: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    // Was ovulation confirmed (BBT, OPK, etc)?
    ovulation_confirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Luteal phase length (days from ovulation to period)
    luteal_phase_length: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    // Flow intensity (1-5 scale average)
    avg_flow_intensity: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    // Is this cycle complete?
    is_complete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    // Notes
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'cycle_history',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['user_id', 'start_date'] }
    ]
});

module.exports = CycleHistory;
