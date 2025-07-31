// services/email.service.js

const nodemailer = require('nodemailer');

// Cấu hình transporter (phương tiện vận chuyển mail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER, // Lấy từ file .env
        pass: process.env.GMAIL_PASS  // Lấy từ file .env
    }
});

/**
 * Gửi email mời chuyên gia với mật khẩu tạm thời
 * @param {string} expertEmail Email của chuyên gia
 * @param {string} expertName Tên của chuyên gia
 * @param {string} temporaryPassword Mật khẩu tạm thời
 */
const sendInvitationEmail = async (expertEmail, expertName, temporaryPassword) => {
    const mailOptions = {
        from: `"Lady Care App" <${process.env.GMAIL_USER}>`,
        to: expertEmail,
        subject: 'Thư mời trở thành Chuyên gia trên Lady Care App',
        html: `
            <h1>Chào mừng ${expertName},</h1>
            <p>Bạn đã được mời tham gia hệ thống Lady Care với vai trò là một chuyên gia tư vấn.</p>
            <p>Dưới đây là thông tin đăng nhập tạm thời của bạn:</p>
            <ul>
                <li><strong>Email:</strong> ${expertEmail}</li>
                <li><strong>Mật khẩu:</strong> ${temporaryPassword}</li>
            </ul>
            <p>Vui lòng đăng nhập và đổi mật khẩu sớm nhất có thể để đảm bảo an toàn cho tài khoản.</p>
            <p>Trân trọng,<br>Đội ngũ Lady Care</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Invitation email sent to ${expertEmail}`);
    } catch (error) {
        console.error(`Error sending email to ${expertEmail}:`, error);
        // Ném lỗi để controller có thể xử lý
        throw new Error('Could not send invitation email.');
    }
};

module.exports = { sendInvitationEmail };