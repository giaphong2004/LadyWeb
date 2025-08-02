const { Op, fn, col, literal } = require('sequelize');
const User = require('../models/user.model');
const Post = require('../models/post.model'); // Nếu cần sử dụng Post model
// Bạn có thể import thêm các model khác như Post, Question nếu cần

exports.getStats = async (req, res) => {
    try {
        // Lấy ngày đầu tiên và cuối cùng của tháng hiện tại
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // Lấy ngày của 30 ngày trước
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);

        // Chạy các câu lệnh truy vấn song song để tăng tốc độ
        const [
            totalUsers,
            newUsersThisMonth,
            dailyRegistrations,
            totalPosts,
            draftPosts
        ] = await Promise.all([
            // 1. Đếm tổng số người dùng
            User.count(),

            // 2. Đếm người dùng mới trong tháng
            User.count({
                where: {
                    created_at: {
                        [Op.between]: [firstDayOfMonth, lastDayOfMonth]
                    }
                }
            }),
            
            // 3. Thống kê người dùng đăng ký mỗi ngày trong 30 ngày qua
            User.findAll({
                attributes: [
                    [fn('DATE', col('created_at')), 'date'],
                    [fn('COUNT', col('id')), 'count']
                ],
                where: {
                    created_at: {
                        [Op.gte]: thirtyDaysAgo
                    }
                },
                group: [fn('DATE', col('created_at'))],
                order: [[fn('DATE', col('created_at')), 'ASC']]
            }),

            // 4. Đếm tổng số bài viết
            Post.count(),

            // 5. Đếm số bài viết nháp
            Post.count({
                where: {
                    status: 'draft'
                }
            }),

        ]);

        // Gửi tất cả dữ liệu về trong một object
        res.status(200).json({
            totalUsers,
            newUsersThisMonth,
            dailyRegistrations, // Dữ liệu cho biểu đồ
            totalPosts,
            draftPosts,
            publishedPosts: totalPosts - draftPosts // Tính số bài viết đã xuất bản
        });

    } catch (error) {
        console.error("Failed to get dashboard stats:", error);
        res.status(500).json({ message: 'Failed to get dashboard stats.' });
    }
};