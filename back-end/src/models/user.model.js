const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  full_name: {
    type: DataTypes.STRING,
  },
  avatar_url: { // <-- THÊM DÒNG NÀY
    type: DataTypes.STRING,
    allowNull: true, // Cho phép giá trị null
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'expert'),
    defaultValue: 'user',
  }
}, {
  tableName: 'users', // Tên bảng trong DB
  timestamps: true, // Tự động thêm createdAt và updatedAt
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = User;