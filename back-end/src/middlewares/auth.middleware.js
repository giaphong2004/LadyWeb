// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Không có token, truy cập bị từ chối.' });
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token không hợp lệ, truy cập bị từ chối.' });
  }

  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    // Nếu lỗi là do token hết hạn (TokenExpiredError)
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token đã hết hạn.' });
    }
    res.status(401).json({ message: 'Token không hợp lệ.' });
  }
};

module.exports = authMiddleware;