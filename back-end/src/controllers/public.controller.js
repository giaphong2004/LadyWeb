const { Op } = require('sequelize');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const Tag = require('../models/tag.model');
const ExpertProfile = require('../models/expertProfile.model'); // Sửa: bỏ destructuring

// Lấy danh sách bài viết (có tìm kiếm, lọc theo tag, và phân trang)
exports.getPublicPosts = async (req, res) => {
    try {
        const { search, tag, page = 1, limit = 9, exclude } = req.query;
        const offset = (page - 1) * limit;

        let whereCondition = { status: 'published' }; // Luôn chỉ lấy bài đã xuất bản
        let includeCondition = [
            { model: User, as: 'author', attributes: ['id', 'full_name'] }
        ];

        // Lọc theo từ khóa tìm kiếm
        if (search) {
            whereCondition.title = { [Op.like]: `%${search}%` };
        }

        // Lọc theo tag (dựa vào slug của tag)
        if (tag) {
            includeCondition.push({
                model: Tag,
                where: { slug: tag },
                attributes: [], // Không cần lấy thông tin tag ở đây vì sẽ include lại ở dưới
                through: { attributes: [] }
            });
        }
        
        if (exclude) {
            whereCondition.id = { [Op.ne]: exclude }; // [Op.ne] = Not Equal (Không bằng)
        }

        const { count, rows } = await Post.findAndCountAll({
            where: whereCondition,
            include: [
                ...includeCondition,
                // Include lại Tag ở đây để lấy thông tin chi tiết
                { model: Tag, attributes: ['name', 'slug'], through: { attributes: [] } }
            ],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['published_at', 'DESC']],
            distinct: true // Quan trọng khi include many-to-many để count hoạt động đúng
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            posts: rows
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết.' });
    }
};

// Lấy chi tiết một bài viết theo slug
exports.getPostBySlug = async (req, res) => {
    try {
        const post = await Post.findOne({
            where: { slug: req.params.slug, status: 'published' },
            include: [
                { model: User, as: 'author', attributes: ['id', 'full_name'] },
                { model: Tag, attributes: ['name', 'slug'], through: { attributes: [] } }
            ]
        });
        if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy chi tiết bài viết.' });
    }
};

// Lấy danh sách tất cả các tags
exports.getAllTags = async (req, res) => {
    try {
        const tags = await Tag.findAll({ order: [['name', 'ASC']] });
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách tags.' });
    }
};

exports.getPublicExperts = async (req, res) => {
    try {
        const { search, specialty, page = 1, limit = 9 } = req.query;
        const offset = (page - 1) * limit;

        let whereCondition = { role: 'expert' }; // Luôn lọc user có vai trò là expert
        let expertProfileWhere = { status: 'approved' }; // Luôn chỉ lấy profile đã được duyệt

        // Xử lý tìm kiếm
        if (search) {
            whereCondition.full_name = { [Op.like]: `%${search}%` };
        }

        // Xử lý lọc theo chuyên khoa
        if (specialty) {
            // Giả sử chuyên khoa được lưu trong trường 'title' của ExpertProfile
            expertProfileWhere.title = { [Op.like]: `%${specialty}%` };
        }

        const { count, rows } = await User.findAndCountAll({
            where: whereCondition,
            include: [{
                model: ExpertProfile,
                as: 'ExpertProfile',
                where: expertProfileWhere,
                required: true // Bắt buộc user phải có expert profile tương ứng
            }],
            attributes: ['id', 'full_name', 'avatar_url'],
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [['created_at', 'DESC']],
            distinct: true
        });

        res.status(200).json({
            totalItems: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            experts: rows
        });
    } catch (error) {
        console.error("Failed to get public experts:", error);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách chuyên gia.' });
    }
};

// Lấy thông tin chi tiết của một chuyên gia theo ID
exports.getExpertById = async (req, res) => {
    try {
        const { id } = req.params;

        const expert = await User.findOne({
            where: { 
                id: id,
                role: 'expert' // Đảm bảo người dùng có vai trò là expert
            },
            include: [{
                model: ExpertProfile,
                as: 'ExpertProfile',
                required: true // Bắt buộc phải có expert profile
            }],
            attributes: ['id', 'full_name', 'email', 'avatar_url', 'created_at']
        });

        if (!expert) {
            return res.status(404).json({ message: 'Không tìm thấy chuyên gia.' });
        }

        res.status(200).json(expert);
    } catch (error) {
        console.error("Failed to get expert details:", error);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin chi tiết chuyên gia.' });
    }
};