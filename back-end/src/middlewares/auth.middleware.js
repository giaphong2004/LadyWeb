// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const TokenBlacklist = require('../models/tokenBlacklist.model'); // Import model
require('dotenv').config();

const authMiddleware = async (req, res, next) => { // Chuyển hàm thành async
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối.' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token không hợp lệ, truy cập bị từ chối.' });
  }

  try {
    // 1. Kiểm tra xem token có trong blacklist không
    const blacklistedToken = await TokenBlacklist.findOne({ where: { token: token } });
    if (blacklistedToken) {
      return res.status(401).json({ message: 'Token đã hết hiệu lực. Vui lòng đăng nhập lại.' });
    }

    // 2. Xác thực token (như cũ)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    // Nếu lỗi là do token hết hạn (TokenExpiredError), không cần thêm vào blacklist
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token đã hết hạn.' });
    }
    res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};

module.exports = authMiddleware;