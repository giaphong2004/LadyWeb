// services/email.service.js

const sgMail = require('@sendgrid/mail');

// Debug: Log biến môi trường (ẩn giá trị thực)
console.log('=== EMAIL SERVICE CONFIGURATION ===');
console.log('SENDGRID_API_KEY exists:', !!process.env.SENDGRID_API_KEY);
console.log('GMAIL_USER exists:', !!process.env.GMAIL_USER);

// Cấu hình SendGrid API
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log('✅ SendGrid Web API initialized');
} else {
    console.error('❌ SENDGRID_API_KEY not found!');
}

/**
 * Gửi email mời chuyên gia với mật khẩu tạm thời
 * @param {string} expertEmail Email của chuyên gia
 * @param {string} expertName Tên của chuyên gia
 * @param {string} temporaryPassword Mật khẩu tạm thời
 */
const sendInvitationEmail = async (expertEmail, expertName, temporaryPassword) => {
    const msg = {
        to: expertEmail,
        from: process.env.GMAIL_USER, // Email đã verify trên SendGrid
        subject: 'Thư mời trở thành Chuyên gia trên LadyHeath Web',
        html: `
            <h1>Chào mừng ${expertName},</h1>
            <p>Bạn đã được mời tham gia hệ thống LadyHeath Web với vai trò là một chuyên gia tư vấn.</p>
            <p>Dưới đây là thông tin đăng nhập tạm thời của bạn:</p>
            <ul>
                <li><strong>Email:</strong> ${expertEmail}</li>
                <li><strong>Mật khẩu:</strong> ${temporaryPassword}</li>
            </ul>
            <p>Vui lòng đăng nhập và đổi mật khẩu sớm nhất có thể để đảm bảo an toàn cho tài khoản.</p>
            <p>Trân trọng,<br>Đội ngũ LadyHeath Web</p>
        `
    };

    try {
        console.log(`Attempting to send invitation email to ${expertEmail}...`);
        const response = await sgMail.send(msg);
        console.log(`✅ Invitation email sent successfully to ${expertEmail}`);
        return response;
    } catch (error) {
        console.error(`❌ Error sending email to ${expertEmail}:`, error.message);
        if (error.response) {
            console.error('SendGrid error details:', error.response.body);
        }
        throw new Error(`Could not send invitation email: ${error.message}`);
    }
};

module.exports = { sendInvitationEmail };