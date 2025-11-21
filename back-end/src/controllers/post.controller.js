const { Op } = require('sequelize');
const slugify = require('slugify');
const Post = require('../models/post.model');
const User = require('../models/user.model');
const Tag = require('../models/tag.model');
const sequelize = require('../config/database');

// READ: Lấy danh sách bài viết
exports.getAllPosts = async (req, res) => {
    try {
        const { search } = req.query; // Lấy từ khóa tìm kiếm từ query param
        let whereCondition = {};

        // Nếu có từ khóa tìm kiếm, thêm điều kiện WHERE
        if (search) {
            whereCondition = {
                title: { [Op.like]: `%${search}%` } // Tìm các bài viết có tiêu đề chứa từ khóa
            };
        }

        const posts = await Post.findAll({
            where: whereCondition, // Áp dụng điều kiện tìm kiếm
            attributes: ['id', 'title', 'slug', 'content', 'cover_image_url', 'status', 'published_at', 'created_at'],
            include: [
                { model: User, as: 'author', attributes: ['id', 'full_name'] },
                { model: Tag, attributes: ['id', 'name'], through: { attributes: [] } }
            ],
            order: [['created_at', 'DESC']]
        });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách bài viết.', error: error.message });
    }
};

// READ: Lấy một bài viết theo ID
exports.getPostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await Post.findByPk(id, {
            include: [
                { model: User, as: 'author', attributes: ['id', 'full_name', 'avatar_url'] },
                { model: Tag, attributes: ['id', 'name'], through: { attributes: [] } },
            ]
        });
        
        if (!post) {
            return res.status(404).json({ message: 'Không tìm thấy bài viết.' });
        }
        
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy bài viết.', error: error.message });
    }
};

// CREATE: Tạo bài viết mới
exports.createPost = async (req, res) => {
    const { title, content, cover_image_url, status, tags } = req.body;
    
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Không tìm thấy thông tin user' });
    }
    
    const author_id = req.user.id; 
    const t = await sequelize.transaction();
    try {
        const newPost = await Post.create({
            title,
            slug: slugify(title, { lower: true, strict: true }),
            content,
            cover_image_url,
            status,
            author_id,
            published_at: status === 'published' ? new Date() : null,
            created_at: new Date(),
            updated_at: new Date()
        }, { transaction: t });

        // Xử lý tags nếu có
        if (tags && Array.isArray(tags) && tags.length > 0) {
            try {
                await newPost.setTags(tags, { transaction: t });
            } catch (tagError) {
                console.warn('Tag assignment failed:', tagError.message);
                // Không fail toàn bộ request nếu chỉ tags lỗi
            }
        }

        await t.commit();
        res.status(201).json(newPost);

    } catch (error) {
        await t.rollback();
        // Giờ đây bạn sẽ thấy lỗi thật sự trong console
        console.error('CreatePost error:', error); 
        res.status(500).json({ message: 'Lỗi khi tạo bài viết.', error: error.message });
    }
};

// UPDATE: Cập nhật bài viết
exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, content, cover_image_url, status, tags } = req.body;
    const t = await sequelize.transaction();
    try {
        const post = await Post.findByPk(id);
        if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.'});

        await post.update({
            title,
            slug: slugify(title, { lower: true, strict: true }),
            content,
            cover_image_url,
            status,
            published_at: status === 'published' && !post.published_at ? new Date() : post.published_at,
            updated_at: new Date()
        }, { transaction: t });

        if (tags) {
            await post.setTags(tags, { transaction: t });
        }
        
        await t.commit();
        res.status(200).json(post);
    } catch (error) {
        await t.rollback();
        res.status(500).json({ message: 'Lỗi khi cập nhật bài viết.', error: error.message });
    }
};

// DELETE: Xóa bài viết
exports.deletePost = async (req, res) => {
    const { id } = req.params;
    try {
        const post = await Post.findByPk(id);
        if (!post) return res.status(404).json({ message: 'Không tìm thấy bài viết.'});

        await post.destroy();
        res.status(200).json({ message: 'Xóa bài viết thành công.' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa bài viết.', error: error.message });
    }
};