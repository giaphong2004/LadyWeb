const { Sequelize } = require('sequelize');
require('dotenv').config();

const connectionUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;

// Kiểm tra xem có đang chạy ở production không
const isProduction = process.env.NODE_ENV === 'production';

const dbConfig = {
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    connectTimeout: 20000,
    // Bỏ hẳn SSL mặc định, chỉ dùng khi có biến REQUIRE_SSL=true
    ...(process.env.REQUIRE_SSL === 'true' ? {
        ssl: {
          rejectUnauthorized: false,
        }
    } : {})
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  retry: {
    max: 3,
  },
};

const sequelize = connectionUrl
  ? new Sequelize(connectionUrl, dbConfig)
  : new Sequelize(
      process.env.DB_NAME || process.env.MYSQLDATABASE,
      process.env.DB_USER || process.env.MYSQLUSER,
      process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
      {
        ...dbConfig,
        host: process.env.DB_HOST || process.env.MYSQLHOST,
        port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
      }
    );

module.exports = sequelize;

// ĐOẠN CODE TEST - XOÁ TRƯỚC KHI COMMIT
sequelize.authenticate()
  .then(() => {
    console.log('✅ Kết nối thành công tới Database trên Railway!');
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối:', err);
    process.exit(1);
  });