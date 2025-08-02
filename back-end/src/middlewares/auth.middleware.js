// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
require('dotenv').config();

const authMiddleware = async (req, res, next) => {
  console.log('🔍 [Auth] Checking authorization header...');
  const authHeader = req.header('Authorization');
  console.log('🔍 [Auth] Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('❌ [Auth] Missing or invalid authorization header');
    return res.status(401).json({ message: 'Yêu cầu token xác thực.' });
  }
  
  const token = authHeader.split(' ')[1];
  console.log('🔍 [Auth] Extracted token:', token.substring(0, 20) + '...');
  
  if (!token) {
    console.log('❌ [Auth] No token found');
    return res.status(401).json({ message: 'Token không hợp lệ.' });
  }

  try {
    // Giải mã token để lấy id
    console.log('🔍 [Auth] Verifying token with secret...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 [Auth] Decoded token:', decoded);
    
    // Dùng id để lấy thông tin user mới nhất từ DB
    console.log('🔍 [Auth] Looking for user with ID:', decoded.user.id);
    const user = await User.findByPk(decoded.user.id, { // ← Sửa từ decoded.id thành decoded.user.id
        attributes: { exclude: ['password_hash'] } // Không lấy mật khẩu
    });
    console.log('🔍 [Auth] Found user:', user ? user.email : 'null');

    if (!user) {
        console.log('❌ [Auth] User not found in database');
        return res.status(401).json({ message: 'Người dùng không tồn tại.' });
    }

    // Gán thông tin user mới nhất vào request
    req.user = user; 
    console.log('✅ [Auth] Authentication successful for user:', user.email);
    next();
  } catch (error) {
    console.log('❌ [Auth] Token verification failed:', error.message);
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn.', error: error.message });
  }
};

module.exports = authMiddleware;