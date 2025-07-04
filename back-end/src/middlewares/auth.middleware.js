// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  // Lấy token từ header
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối.' });
  }
  
  // Token thường có dạng "Bearer <token>"
  const token = authHeader.split(' ')[1];

  if (!token) {
      return res.status(401).json({ message: 'Token không hợp lệ, truy cập bị từ chối.' });
  }

  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Gán thông tin user đã giải mã vào request để các xử lý sau có thể dùng
    req.user = decoded.user;
    next(); // Chuyển sang xử lý tiếp theo
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};

module.exports = authMiddleware;