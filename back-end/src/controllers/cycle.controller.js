const MenstrualCycle = require('../models/menstrualCycle.model');
const Joi = require('joi');

// Thêm chu kỳ mới
exports.addCycle = async (req, res) => {
    try {
        const schema = Joi.object({
            start_date: Joi.date().required(),
            end_date: Joi.date().allow(null),
            notes: Joi.string().allow('', null)
        });
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }

        const { start_date, end_date, notes } = req.body;
        // Lấy user id từ middleware đã giải mã
        const user_id = req.user.id;

        const newCycle = await MenstrualCycle.create({
            user_id,
            start_date,
            end_date,
            notes
        });

        res.status(201).json({ message: 'Đã thêm chu kỳ thành công!', cycle: newCycle });

    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Lấy tất cả chu kỳ của người dùng
exports.getCycles = async (req, res) => {
    try {
        const user_id = req.user.id;
        const cycles = await MenstrualCycle.findAll({
            where: { user_id },
            order: [['start_date', 'DESC']] // Sắp xếp từ mới nhất đến cũ nhất
        });

        res.status(200).json(cycles);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Hàm mới cho tính năng dự đoán không cần đăng nhập
exports.predictAnonymous = async (req, res) => {
  try {
    // 1. Validate dữ liệu đầu vào
    const schema = Joi.object({
      last_period_start_date: Joi.date().iso().required(),
      period_length: Joi.number().integer().min(1).max(20).required(),
      cycle_length: Joi.number().integer().min(15).max(60).required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ: " + error.details[0].message });
    }

    const { last_period_start_date, period_length, cycle_length } = req.body;

    // 2. Chuyển đổi chuỗi ngày thành đối tượng Date
    const lastStartDate = new Date(last_period_start_date);

    // 3. Thực hiện tính toán
    // Ngày kinh tiếp theo = Ngày bắt đầu kỳ cuối + độ dài chu kỳ
    const nextPeriodStartDate = new Date(lastStartDate);
    nextPeriodStartDate.setDate(lastStartDate.getDate() + cycle_length);

    // Ngày kết thúc của kỳ kinh tiếp theo
    const nextPeriodEndDate = new Date(nextPeriodStartDate);
    nextPeriodEndDate.setDate(nextPeriodStartDate.getDate() + period_length - 1);

    // Ngày rụng trứng (ước tính) = Ngày kinh tiếp theo - 14 ngày
    // Giả định pha hoàng thể (luteal phase) luôn là 14 ngày
    const ovulationDate = new Date(nextPeriodStartDate);
    ovulationDate.setDate(nextPeriodStartDate.getDate() - 14);

    // Giai đoạn dễ thụ thai (ước tính) = 5 ngày trước ngày rụng trứng + ngày rụng trứng
    const fertileWindowStart = new Date(ovulationDate);
    fertileWindowStart.setDate(ovulationDate.getDate() - 5);

    // Hàm helper để định dạng ngày thành 'YYYY-MM-DD'
    const formatDate = (date) => date.toISOString().split('T')[0];

    // 4. Trả về kết quả
    res.status(200).json({
      next_period_start_date: formatDate(nextPeriodStartDate),
      next_period_end_date: formatDate(nextPeriodEndDate),
      ovulation_date: formatDate(ovulationDate),
      fertile_window_start: formatDate(fertileWindowStart),
      fertile_window_end: formatDate(ovulationDate) // Ngày cuối của giai đoạn là ngày rụng trứng
    });

  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};