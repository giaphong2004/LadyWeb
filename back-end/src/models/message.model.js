const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Message = sequelize.define('Message', {
  type: { type: DataTypes.ENUM('text', 'image', 'file'), defaultValue: 'text' },
  content: { type: DataTypes.TEXT, allowNull: true },
  readAt: { type: DataTypes.DATE, field: 'read_at' }
}, {
  tableName: 'messages',
  underscored: true,
  timestamps: true
});

module.exports = Message;
