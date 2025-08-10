// routes/chat.routes.js
const router = require('express').Router();
const auth = require('../middlewares/auth.middleware');
const chatController = require('../controllers/chat.controller');

// Định nghĩa các routes và trỏ đến hàm controller tương ứng

// Lấy trạng thái của dịch vụ chat
router.get('/status', chatController.getChatStatus);

// Lấy danh sách các cuộc hội thoại
router.get('/conversations', auth, chatController.listConversations);

// Tạo hoặc lấy một cuộc hội thoại
router.post('/conversations', auth, chatController.getOrCreateConversation);

// Lấy tin nhắn của một cuộc hội thoại
router.get(
  '/conversations/:id/messages', 
  auth, 
  chatController.getMessagesForConversation
);

module.exports = router;
