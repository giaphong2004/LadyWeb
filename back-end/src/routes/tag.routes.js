const express = require('express');
const router = express.Router();
const Tag = require('../models/tag.model');

// GET /api/tags - Lấy tất cả tags
router.get('/', async (req, res) => {
    try {
        const tags = await Tag.findAll({
            attributes: ['id', 'name', 'slug'],
            order: [['name', 'ASC']]
        });
        res.status(200).json(tags);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách tags.', error: error.message });
    }
});

module.exports = router;
