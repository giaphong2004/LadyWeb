const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
// const authMiddleware = require('../middlewares/auth.middleware');

// Public routes - Không cần đăng nhập vẫn chat được
router.post('/chat', aiController.chat);
router.get('/quick-questions', aiController.getQuickQuestions);

// Protected routes - Nếu muốn bắt buộc đăng nhập
// router.post('/chat', authMiddleware.authenticate, aiController.chat);

module.exports = router;
