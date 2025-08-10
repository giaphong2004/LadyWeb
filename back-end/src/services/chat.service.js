// services/chat.service.js
const socketIo = require('socket.io');

class ChatService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // Track connected users
  }

  // Khởi tạo Socket.IO server
  initialize(server) {
    this.io = socketIo(server, {
      cors: {
        origin: "http://localhost:4200",
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupSocketHandlers();
    console.log('Socket.IO Chat Service initialized');
  }

  // Setup các event handlers
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      // User authentication và join personal room
      socket.on('authenticate', (userData) => {
        if (userData && userData.id) {
          socket.userId = userData.id;
          socket.userEmail = userData.email;
          socket.join(`user_${userData.id}`);
          this.connectedUsers.set(userData.id, {
            socketId: socket.id,
            email: userData.email,
            connectedAt: new Date()
          });
        }
      });

      // Join conversation room
      socket.on('join_conversation', (conversationId) => {
        socket.join(`conv_${conversationId}`);
        
        // Notify other users in conversation that someone joined
        socket.to(`conv_${conversationId}`).emit('user_joined_conversation', {
          conversationId,
          userId: socket.userId,
          timestamp: new Date()
        });
      });

      // Leave conversation room
      socket.on('leave_conversation', (conversationId) => {
        socket.leave(`conv_${conversationId}`);
      });

      // Handle sending message
      socket.on('send_message', async (data) => {
        try {
          await this.handleSendMessage(socket, data);
        } catch (error) {
          console.error('Error in send_message:', error);
          socket.emit('message_error', {
            error: 'Failed to send message',
            details: error.message
          });
        }
      });

      // Handle typing indicators
      socket.on('typing_start', (data) => {
        socket.to(`conv_${data.conversationId}`).emit('user_typing', {
          conversationId: data.conversationId,
          userId: socket.userId,
          userEmail: socket.userEmail,
          isTyping: true
        });
      });

      socket.on('typing_stop', (data) => {
        socket.to(`conv_${data.conversationId}`).emit('user_typing', {
          conversationId: data.conversationId,
          userId: socket.userId,
          userEmail: socket.userEmail,
          isTyping: false
        });
      });

      // Handle message read status
      socket.on('mark_messages_read', async (data) => {
        try {
          await this.handleMarkMessagesRead(socket, data);
        } catch (error) {
          console.error('Error marking messages as read:', error);
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
          // Notify friends/contacts that user went offline
          this.broadcastUserStatus(socket.userId, 'offline');
        }
      });
    });
  }

  // Handle sending message
  async handleSendMessage(socket, data) {
    const { conversationId, senderId, content, type = 'text' } = data;

    if (!conversationId || !senderId || !content) {
      throw new Error('Missing required fields: conversationId, senderId, content');
    }

    // Get models from global reference (will be set in server.js)
    const { Message, Conversation, User } = global.models;

    // Save message to database
    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      type
    });

    // Update conversation last message time
    await Conversation.update(
      { lastMessageAt: new Date() },
      { where: { id: conversationId } }
    );

    // Get message with sender info
    const messageWithSender = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'full_name', 'avatar_url', 'email']
        }
      ]
    });

    // Emit to all users in the conversation room
    this.io.to(`conv_${conversationId}`).emit('receive_message', {
      id: messageWithSender.id,
      conversationId,
      senderId,
      content,
      type,
      createdAt: messageWithSender.createdAt,
      sender: messageWithSender.sender,
      isNewMessage: true
    });

    console.log(`Message sent in conversation ${conversationId} by user ${senderId}`);
  }

  // Handle marking messages as read
  async handleMarkMessagesRead(socket, data) {
    const { conversationId, userId } = data;
    const { Message } = global.models;

    // Update read status for messages not sent by current user
    const { Op } = require('sequelize');
    await Message.update(
      { readAt: new Date() },
      {
        where: {
          conversation_id: conversationId,
          sender_id: { [Op.ne]: userId },
          readAt: null
        }
      }
    );

    // Notify other users in conversation
    socket.to(`conv_${conversationId}`).emit('messages_read', {
      conversationId,
      readByUserId: userId,
      readAt: new Date()
    });
  }

  // Broadcast user online/offline status
  broadcastUserStatus(userId, status) {
    this.io.to(`user_${userId}`).emit('user_status_change', {
      userId,
      status,
      timestamp: new Date()
    });
  }

  // Send notification to specific user
  sendNotificationToUser(userId, notification) {
    this.io.to(`user_${userId}`).emit('notification', notification);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Get connected users list
  getConnectedUsers() {
    return Array.from(this.connectedUsers.entries()).map(([userId, data]) => ({
      userId,
      ...data
    }));
  }

  // Send message to specific conversation (for server-side triggers)
  async sendSystemMessage(conversationId, content, type = 'system') {
    this.io.to(`conv_${conversationId}`).emit('receive_message', {
      id: null,
      conversationId,
      senderId: null,
      content,
      type,
      createdAt: new Date(),
      sender: {
        id: 0,
        full_name: 'System',
        avatar_url: null,
        email: 'system'
      },
      isSystemMessage: true
    });
  }
}

// Export singleton instance
module.exports = new ChatService();
