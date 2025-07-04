const { Sequelize } = require('sequelize');
require('dotenv').config(); //thư viện dotenv để quản lý biến môi trường từ file .env vào process.env
//require() để nạp các module cần thiết
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false // Tắt log các câu lệnh SQL ra console
  }
);

module.exports = sequelize;