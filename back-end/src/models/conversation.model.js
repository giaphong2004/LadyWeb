const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  status: { type: DataTypes.ENUM('open', 'closed'), defaultValue: 'open' },
  lastMessageAt: { type: DataTypes.DATE, field: 'last_message_at' }
}, {
  tableName: 'conversations',
  underscored: true,
  timestamps: true
});

module.exports = Conversation;
