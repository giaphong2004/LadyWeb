const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// GET /api/public/posts - Lấy danh sách bài viết công khai
router.get('/posts', publicController.getPublicPosts);

// GET /api/public/posts/:slug - Lấy chi tiết bài viết theo slug
router.get('/posts/:slug', publicController.getPostBySlug);

// GET /api/public/tags - Lấy danh sách các tag
router.get('/tags', publicController.getAllTags);

module.exports = router;