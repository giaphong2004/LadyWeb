const { Op } = require('sequelize');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
// Thêm import cho service gửi email
const { sendInvitationEmail } = require('../services/email.service');

// READ: Lấy danh sách tất cả người dùng (có tìm kiếm)
exports.getAllUsers = async (req, res) => {
    try {
        const { search } = req.query;
        let whereCondition = {};

        if (search) {
            whereCondition = {
                [Op.or]: [
                    { full_name: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        const users = await User.findAll({
            where: whereCondition,
            attributes: { exclude: ['password_hash'] }
        });

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Không thể lấy danh sách người dùng.', error: error.message });
    }
};

exports.createUser = async (req, res) => {
    const { email, fullName } = req.body;
    
    // BƯỚC 1: KIỂM TRA EMAIL TỒN TẠI TRƯỚC TIÊN
    try {
        const existingUser = await User.findOne({ where: { email: email } });
        if (existingUser) {
            // Nếu đã tồn tại, báo lỗi ngay và dừng lại
            return res.status(409).json({ message: 'Email này đã được sử dụng.' });
        }

        // Nếu email chưa tồn tại, tiếp tục xử lý
        const temporaryPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

        // BƯỚC 2: GHI VÀO DATABASE
        const newUser = await User.create({
            email,
            full_name: fullName,
            password_hash: hashedPassword,
            role: 'user'
        });
        
        // Ghi log ngay sau khi tạo thành công để xác nhận
        console.log(`--- User ${email} CREATED successfully in DB with ID: ${newUser.id} ---`);

        // BƯỚC 3: GỬI EMAIL
        console.log(`--- Attempting to send email to ${email}... ---`);
        await sendInvitationEmail(email, fullName, temporaryPassword);
        console.log(`--- Email sent successfully to ${email} ---`);

        // BƯỚC 4: TRẢ VỀ KẾT QUẢ THÀNH CÔNG
        const userResponse = newUser.toJSON();
        delete userResponse.password_hash;
        res.status(201).json({ message: 'User created and invitation sent.', user: userResponse });
        
    } catch (error) {
        // Bất kỳ lỗi nào từ việc tạo user hoặc gửi mail sẽ được bắt ở đây
        console.error("--- AN ERROR OCCURRED ---", error);
        res.status(500).json({ message: 'Không thể hoàn tất thao tác.', error: error.message });
    }
};

// UPDATE: Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    // Chỉ cho phép admin cập nhật tên và vai trò
    const { fullName, role } = req.body; 

    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        // Cập nhật các trường nếu chúng được cung cấp trong request body
        user.full_name = fullName || user.full_name;
        user.role = role || user.role;
        
        await user.save();

        const userResponse = user.toJSON();
        delete userResponse.password_hash;

        res.status(200).json(userResponse);
    } catch (error) {
        res.status(500).json({ message: 'Không thể cập nhật người dùng.', error: error.message });
    }
};

// DELETE: Xóa người dùng
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }

        await user.destroy();
        res.status(200).json({ message: 'Người dùng đã được xóa thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Không thể xóa người dùng.', error: error.message });
    }
};