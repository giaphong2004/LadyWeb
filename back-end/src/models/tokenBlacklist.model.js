// src/models/tokenBlacklist.model.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TokenBlacklist = sequelize.define('TokenBlacklist', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },
  expires_at: {
      type: DataTypes.DATE,
      allowNull: false
  }
}, {
  tableName: 'token_blacklist',
  timestamps: false // Không cần createdAt, updatedAt
});

module.exports = TokenBlacklist;