// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Yêu cầu token xác thực.' });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token không hợp lệ.' });
  }

  try {
    // Giải mã token để lấy id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Dùng id để lấy thông tin user mới nhất từ DB
    const user = await User.findByPk(decoded.user.id, {
        attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
        return res.status(401).json({ message: 'Người dùng không tồn tại.' });
    }

    // Gán thông tin user mới nhất vào request
    req.user = user;
    req.userId = user.id; // Thêm userId để dễ truy cập
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.', error: error.message });
  }
};

module.exports = authMiddleware;