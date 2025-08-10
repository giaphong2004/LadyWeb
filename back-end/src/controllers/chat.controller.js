// controllers/chat.controller.js

const { Op } = require('sequelize');
const chatService = require('../services/chat.service');
const { Conversation, Message, User } = global.models; // Giả sử models được load global

/**
 * Lấy trạng thái của dịch vụ chat
 */
exports.getChatStatus = (req, res) => {
  res.json({
    service: 'Chat Service',
    status: 'active',
    connectedUsers: chatService.getConnectedUsersCount(),
    connectedUsersList: chatService.getConnectedUsers(),
    timestamp: new Date()
  });
};

/**
 * Tạo hoặc lấy một cuộc hội thoại đã có với chuyên gia
 */
exports.getOrCreateConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const { expertId } = req.body;
    
    if (!expertId) {
      return res.status(400).json({ message: 'expertId is required' });
    }

    let convo = await Conversation.findOne({ 
      where: { user_id: userId, expert_id: expertId } 
    });
    
    if (!convo) {
      convo = await Conversation.create({ 
        user_id: userId, 
        expert_id: expertId 
      });
    }
    
    res.status(200).json(convo);
  } catch (error) {
    console.error('Error in getOrCreateConversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Lấy danh sách các cuộc hội thoại của người dùng hiện tại
 */
exports.listConversations = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.user?.role || 'user';
    
    const whereCondition = userRole === 'expert' 
      ? { expert_id: userId } 
      : { user_id: userId };

    whereCondition.lastMessageAt = { [Op.ne]: null };
      
    const conversations = await Conversation.findAll({ 
      where: whereCondition, 
      include: [
        { model: User, as: 'user', attributes: ['id', 'full_name', 'avatar_url'] },
        { model: User, as: 'expert', attributes: ['id', 'full_name', 'avatar_url', 'role'] }
      ],
      order: [['lastMessageAt', 'DESC']] 
    });
    
    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error in listConversations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Lấy tin nhắn trong một cuộc hội thoại (có phân trang)
 */
exports.getMessagesForConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const limit = Math.min(parseInt(req.query.limit || '30', 10), 100);
    const before = req.query.before ? new Date(req.query.before) : null;

    const whereCondition = { conversation_id: id };
    if (before) {
      whereCondition.createdAt = { [Op.lt]: before };
    }

    const messages = await Message.findAll({
      where: whereCondition, 
      include: [
        { model: User, as: 'sender', attributes: ['id', 'full_name', 'avatar_url'] }
      ],
      order: [['createdAt', 'DESC']], 
      limit
    });
    
    // Đảo ngược lại để hiển thị đúng thứ tự trên client
    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error('Error in getMessagesForConversation:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
