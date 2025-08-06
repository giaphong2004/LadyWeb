const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET /api/users - Lấy tất cả người dùng (hỗ trợ tìm kiếm qua query ?search=...)
router.get('/', userController.getAllUsers);

// POST /api/users - Tạo người dùng mới
router.post('/', userController.createUser);

// PUT /api/users/profile - Cập nhật profile của user hiện tại (PHẢI ĐẶT TRƯỚC /:id)
router.put('/profile', authMiddleware, userController.updateProfile);

// PUT /api/users/:id - Cập nhật người dùng
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Xóa người dùng
router.delete('/:id', userController.deleteUser);

module.exports = router;