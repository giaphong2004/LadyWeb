const User = require('../models/user.model');
const bcrypt = require('bcryptjs'); // Thư viện bcryptjs để mã hóa mật khẩu
const jwt = require('jsonwebtoken');
const Joi = require('joi'); // Thư viện Joi để validate dữ liệu đầu vào
const TokenBlacklist = require('../models/tokenBlacklist.model'); // Thêm dòng này


// Logic đăng ký
exports.register = async (req, res) => {
  try {
    // 1. Validate dữ liệu đầu vào
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      full_name: Joi.string().allow('', null)
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password, full_name } = req.body;

    // 2. Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email đã tồn tại.' });
    }

    // 3. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // 4. Tạo user mới
    const newUser = await User.create({
      email,
      password_hash,
      full_name
    });

    res.status(201).json({
      message: 'Đăng ký thành công!',
      user: { id: newUser.id, email: newUser.email }
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Logic đăng nhập
exports.login = async (req, res) => {
  try {
    // 1. Validate
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    
    const { email, password } = req.body;

    // 2. Tìm user trong DB
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    // 3. So sánh mật khẩu
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email hoặc mật khẩu không đúng.' });
    }

    // 4. Tạo JWT Token
    const payload = {
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '7d' // Token hết hạn sau 7 ngày
    });

    res.status(200).json({
      message: 'Đăng nhập thành công!',
      token,
      user: { id: user.id, email: user.email, full_name: user.full_name }
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// Logic đăng xuất
exports.logout = async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      // Nếu không có token, coi như đã đăng xuất
      return res.status(200).json({ message: 'Đã đăng xuất thành công.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(200).json({ message: 'Đã đăng xuất thành công.' });
    }

    // Lấy thông tin từ token để biết thời gian hết hạn
    const decoded = jwt.decode(token);
    if (!decoded) {
        return res.status(400).json({ message: 'Token không hợp lệ.' });
    }
    
    // expires_at được tính bằng giây (timestamp), cần chuyển sang mili-giây
    const expiresAt = new Date(decoded.exp * 1000);

    // Thêm token vào blacklist
    await TokenBlacklist.create({
      token: token,
      expires_at: expiresAt
    });

    res.status(200).json({ message: 'Đã đăng xuất thành công.' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};