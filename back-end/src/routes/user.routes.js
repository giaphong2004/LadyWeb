const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// GET /api/users - Lấy tất cả người dùng (hỗ trợ tìm kiếm qua query ?search=...)
router.get('/', userController.getAllUsers);

// POST /api/users - Tạo người dùng mới
router.post('/', userController.createUser);

// PUT /api/users/:id - Cập nhật người dùng
router.put('/:id', userController.updateUser);

// DELETE /api/users/:id - Xóa người dùng
router.delete('/:id', userController.deleteUser);

module.exports = router;