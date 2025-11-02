const aiService = require('../services/ai.service');

class AIController {
  /**
   * POST /api/ai/chat
   * Chat với AI Lisa
   */
  async chat(req, res) {
    try {
      const { message, history } = req.body;

      // Validate
      if (!message || message.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Message is required'
        });
      }

      // Gọi AI service
      const response = await aiService.chat(message, history);

      return res.json({
        success: true,
        data: {
          message: response,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('AI Chat Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  /**
   * GET /api/ai/quick-questions
   * Lấy danh sách câu hỏi gợi ý
   */
  async getQuickQuestions(req, res) {
    try {
      const questions = aiService.getQuickQuestions();
      
      return res.json({
        success: true,
        data: questions
      });
    } catch (error) {
      console.error('Get Quick Questions Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new AIController();
