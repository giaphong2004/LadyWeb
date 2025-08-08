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

exports.getAllExperts = async (req, res) => {
  try {
    const experts = await User.findAll({
      where: { role: 'expert' },
      include: [{
        model: ExpertProfile,
        as: 'ExpertProfile', // Thêm alias để khớp với server.js
        required: true // INNER JOIN: Bắt buộc phải có profile
      }],
      // Không trả về password_hash để bảo mật
      attributes: { exclude: ['password_hash'] },
      order: [['created_at', 'DESC']]
    });
    res.status(200).json(experts);
  } catch (error) {
    console.error('Failed to get experts:', error);
    res.status(500).json({ message: 'Failed to retrieve experts.' });
  }
};

exports.deleteExpert = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Expert not found.' });
    }

    // Xóa user, CSDL sẽ tự động xóa profile liên quan nhờ 'ON DELETE CASCADE'
    await user.destroy();
    
    res.status(200).json({ message: 'Expert deleted successfully.' });
  } catch (error) {
    console.error(`Failed to delete expert ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete expert.', error: error.message });
  }
};

// Thêm hàm này vào file expert.controller.js
exports.updateExpert = async (req, res) => {
  const { id } = req.params;
  const { fullName, title, bio } = req.body;
  const t = await sequelize.transaction();

  try {
    const user = await User.findByPk(id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: 'Expert not found.' });
    }

    // Cập nhật bảng users
    user.full_name = fullName;
    await user.save({ transaction: t });

    // Cập nhật bảng expert_profiles
    const profile = await ExpertProfile.findOne({ where: { user_id: id }, transaction: t });
    if (profile) {
      profile.title = title;
      profile.bio = bio;
      await profile.save({ transaction: t });
    }

    await t.commit();
    res.status(200).json({ message: 'Expert updated successfully.' });

  } catch (error) {
    await t.rollback();
    console.error(`Failed to update expert ${id}:`, error);
    res.status(500).json({ message: 'Failed to update expert.', error: error.message });
  }
};