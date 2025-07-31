// Ví dụ trong file controllers/expert.controller.js
const User = require('../models/user.model'); // Sửa ở đây
const ExpertProfile = require('../models/expertProfile.model'); // Sửa ở đây
const bcrypt = require('bcryptjs');
const { sendInvitationEmail } = require('../services/email.service');
const sequelize = require('../config/database');

exports.createExpert = async (req, res) => {
    // Bắt đầu một transaction
    const t = await sequelize.transaction();

    try {
        const { email, fullName, title, bio, avatarUrl } = req.body;

        // 1. Tạo mật khẩu ngẫu nhiên (ví dụ đơn giản)
        const temporaryPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // 2. Tạo User mới trong transaction
        const newUser = await User.create({
            email,
            full_name: fullName,
            password_hash: hashedPassword,
            role: 'expert',
            avatar_url: avatarUrl
        }, { transaction: t });

        // 3. Tạo Expert Profile mới trong transaction
        await ExpertProfile.create({
            user_id: newUser.id,
            title,
            bio,
            status: 'approved'
        }, { transaction: t });

        // 4. Gửi email mời (chỉ sau khi chắc chắn tạo user thành công)
        await sendInvitationEmail(email, fullName, temporaryPassword);

        // 5. Nếu mọi thứ thành công, commit transaction
        await t.commit();

        res.status(201).json({ message: 'Expert created and invitation sent successfully.' });

    } catch (error) {
        // 6. Nếu có lỗi, rollback transaction
        await t.rollback();
        console.error('Failed to create expert:', error);
        res.status(500).json({ message: 'Failed to create expert.', error: error.message });
    }
};