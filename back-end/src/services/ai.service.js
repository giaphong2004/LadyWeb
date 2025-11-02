const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // Load .env variables

class AIService {
  constructor() {
    // Khởi tạo Gemini AI
    const apiKey = process.env.GOOGLE_API_KEY;

    console.log('🔑 Checking API Key:', apiKey ? 'Found ✅' : 'Missing ❌');

    if (!apiKey) {
      console.error('❌ GOOGLE_API_KEY is not defined in .env');
      throw new Error('GOOGLE_API_KEY is not defined in .env');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    // Dùng Gemini 2.5 Flash - nhanh, ổn định, hỗ trợ tiếng Việt tốt
    this.model = this.genAI.getGenerativeModel({
      model: 'models/gemini-2.5-flash',
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    console.log('✅ Gemini AI initialized with model: gemini-2.5-flash');

    // System prompt cho Lisa
    this.systemPrompt = `Bạn là Lisa - trợ lý ảo chuyên về sức khỏe phụ nữ của LadyWeb.

Vai trò của bạn:
- Tư vấn về chu kỳ kinh nguyệt, rụng trứng, mang thai
- Giải đáp thắc mắc về sức khỏe sinh sản nữ giới
- Cung cấp lời khuyên về dinh dưỡng và chăm sóc bản thân
- Hỗ trợ tâm lý cho phụ nữ
- Hướng dẫn sử dụng các công cụ trên LadyWeb

Phong cách giao tiếp:
- Thân thiện, ấm áp, đồng cảm
- Sử dụng emoji phù hợp (💕, 🌸, ✨, 💪, 🤗)
- Trả lời bằng tiếng Việt
- Câu ngắn gọn, dễ hiểu
- Luôn khuyến khích gặp bác sĩ khi cần thiết

Lưu ý:
- KHÔNG tự ý chẩn đoán bệnh
- KHÔNG kê đơn thuốc
- Luôn nhắc "Nên tham khảo bác sĩ" với các vấn đề nghiêm trọng
- Cung cấp thông tin dựa trên y học hiện đại

Hãy trả lời câu hỏi của người dùng:`;
  }

  /**
   * Chat với Gemini AI
   * @param {string} message - Tin nhắn từ user
   * @param {Array} history - Lịch sử chat (optional)
   * @returns {Promise<string>} - Phản hồi từ AI
   */
  async chat(message, history = []) {
    try {
      console.log('💬 AI Chat Request:', message);

      // Tạo context từ history
      let prompt = this.systemPrompt + '\n\n';

      if (history.length > 0) {
        prompt += 'Lịch sử cuộc trò chuyện:\n';
        history.slice(-5).forEach(msg => {
          prompt += `${msg.sender === 'user' ? 'Người dùng' : 'Lisa'}: ${msg.text}\n`;
        });
        prompt += '\n';
      }

      prompt += `Người dùng: ${message}\nLisa:`;

      console.log('🤖 Calling Gemini SDK...');

      // Gọi Gemini API qua SDK
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Gemini Response:', text.substring(0, 100) + '...');

      return text || this.getFallbackResponse(message);

    } catch (error) {
      console.error('❌ AI Service Error:', error.message);
      console.log('🔄 Using fallback response...');

      // Fallback response nếu API lỗi
      return this.getFallbackResponse(message);
    }
  }

  /**
   * Phản hồi dự phòng khi API lỗi - Thông minh hơn
   */
  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();

    // Responses chi tiết hơn dựa trên keywords
    if (lowerMessage.includes('chu kỳ') || lowerMessage.includes('kinh nguyệt')) {
      return `✨ **Về chu kỳ kinh nguyệt:**

🔹 **Chu kỳ bình thường:** 21-35 ngày (trung bình 28 ngày)
🔹 **Kéo dài kỳ kinh:** 3-7 ngày
🔹 **Lượng máu:** 30-40ml

📊 **Các giai đoạn:**
• Giai đoạn kinh nguyệt (ngày 1-5)
• Giai đoạn nang trứng (ngày 6-13)
• Giai đoạn rụng trứng (ngày 14)
• Giai đoạn hoàng thể (ngày 15-28)

💡 **Mẹo:** Sử dụng công cụ theo dõi chu kỳ trên LadyWeb để ghi lại và dự đoán chính xác hơn nhé! �`;
    }

    if (lowerMessage.includes('rụng trứng') || lowerMessage.includes('rung trung')) {
      return `🥚 **Về rụng trứng:**

🔹 **Thời điểm:** Khoảng ngày 14 của chu kỳ (giữa chu kỳ)
🔹 **Thời gian thụ thai:** 5 ngày trước + 1 ngày sau rụng trứng

📍 **Dấu hiệu rụng trứng:**
• Dịch nhầy trong suốt, giống lòng trắng trứng
• Đau nhẹ một bên bụng dưới
• Nhiệt độ cơ thể tăng nhẹ (0.3-0.6°C)
• Ham muốn tăng

🎯 Công cụ tính rụng trứng của LadyWeb sẽ giúp bạn xác định chính xác dựa trên chu kỳ riêng! 💕`;
    }

    if (lowerMessage.includes('thai') || lowerMessage.includes('mang bầu') || lowerMessage.includes('có bầu')) {
      return `🤰 **Dấu hiệu mang thai sớm:**

✓ **Dấu hiệu chính:**
• Trễ kinh (dấu hiệu đầu tiên)
• Buồn nôn (đặc biệt buổi sáng)
• Mệt mỏi, uể oải
• Ngực căng, nhạy cảm
• Đi tiểu nhiều hơn
• Thay đổi tâm trạng

🧪 **Nên làm:**
• Test thử thai sau 1 tuần trễ kinh
• Gặp bác sĩ sản khoa để khám thai
• Uống vitamin cho bà bầu

👶 Chúc mừng bạn nếu đang có tin vui! Hãy chăm sóc bản thân thật tốt nhé! 💕`;
    }

    if (lowerMessage.includes('đau') || lowerMessage.includes('dau')) {
      return `💊 **Giảm đau bụng kinh tự nhiên:**

🌿 **Phương pháp tự nhiên:**
• ♨️ Chườm nóng vùng bụng dưới (20-30 phút)
• 💆 Massage nhẹ nhàng theo chiều kim đồng hồ
• 🍵 Uống trà gừng hoặc trà hoa cúc
• 🧘 Tập yoga nhẹ nhàng
• 😴 Nghỉ ngơi đầy đủ, ngủ đủ giấc

⚠️ **Khi nào cần gặp bác sĩ:**
• Đau quá mức, không chịu được
• Chảy máu nhiều bất thường
• Sốt cao kèm theo

💕 Chúc bạn sớm khỏe lại nhé!`;
    }

    if (lowerMessage.includes('dinh dưỡng') || lowerMessage.includes('ăn uống')) {
      return `🥗 **Dinh dưỡng cho phụ nữ:**

✨ **Nhóm thực phẩm cần thiết:**

🥬 **Rau xanh:** Cải bó xôi, cải xoăn (giàu sắt, canxi)
🐟 **Protein:** Cá hồi, thịt gà, đậu (omega-3, protein)
🥛 **Canxi:** Sữa, phô mai, sữa chua
🍊 **Vitamin C:** Cam, dâu, ớt chuông
🌰 **Chất béo tốt:** Bơ, hạt điều, hạnh nhân

💧 **Uống nước:** 2-2.5 lít/ngày

🚫 **Hạn chế:** Đường, muối, caffeine, thức ăn chế biến sẵn

💕 Hãy lắng nghe cơ thể mình và ăn uống cân bằng nhé!`;
    }

    if (lowerMessage.includes('tập') || lowerMessage.includes('thể dục') || lowerMessage.includes('exercise')) {
      return `🏃‍♀️ **Tập luyện phù hợp cho phụ nữ:**

💪 **Các bài tập nên tập:**

🧘 **Yoga:** 3-4 lần/tuần (tăng sự dẻo dai, giảm stress)
🏃 **Cardio nhẹ:** Đi bộ nhanh 30 phút/ngày
🏊 **Bơi lội:** Tập toàn thân, không gây chấn thương
💃 **Pilates:** Tăng cường core, cải thiện tư thế
🚴 **Đạp xe:** Tốt cho tim mạch

⏰ **Lưu ý:**
• Tập 3-5 lần/tuần, mỗi lần 30-45 phút
• Khởi động 5-10 phút trước khi tập
• Tránh tập quá sức trong kỳ kinh
• Nghỉ ngơi đầy đủ giữa các buổi tập

💕 Hãy tập thể dục đều đặn để có sức khỏe tốt nhé!`;
    }

    // Default response
    return `Xin chào! Tôi là Lisa 💕

Tôi có thể giúp bạn về:
✨ Chu kỳ kinh nguyệt
🥚 Rụng trứng và thụ thai
🤰 Thai kỳ và chăm sóc thai nhi
💊 Giảm đau và chăm sóc sức khỏe
🥗 Dinh dưỡng cho phụ nữ
🏃‍♀️ Tập luyện và thể dục

Bạn có thể đặt câu hỏi cụ thể hơn để tôi có thể tư vấn chi tiết hơn nhé! 😊

💡 Hoặc bạn có thể:
• Sử dụng các công cụ trên LadyWeb
• Chat với chuyên gia
• Đọc bài viết trong thư viện`;
  }

  /**
   * Suggest quick questions
   */
  getQuickQuestions() {
    return [
      { id: 1, text: 'Chu kỳ kinh nguyệt của tôi bất thường', category: 'cycle' },
      { id: 2, text: 'Cách tính ngày rụng trứng chính xác', category: 'ovulation' },
      { id: 3, text: 'Dấu hiệu mang thai sớm', category: 'pregnancy' },
      { id: 4, text: 'Giảm đau bụng kinh tự nhiên', category: 'health' },
      { id: 5, text: 'Chế độ dinh dưỡng cho phụ nữ', category: 'nutrition' },
      { id: 6, text: 'Bài tập thể dục phù hợp', category: 'exercise' }
    ];
  }
}

module.exports = new AIService();
