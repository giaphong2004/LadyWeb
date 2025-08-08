const express = require('express');
const router = express.Router();
const publicController = require('../controllers/public.controller');

// GET /api/public/posts - Lấy danh sách bài viết công khai
router.get('/posts', publicController.getPublicPosts);

// GET /api/public/posts/:slug - Lấy chi tiết bài viết theo slug
router.get('/posts/:slug', publicController.getPostBySlug);

// GET /api/public/tags - Lấy danh sách các tag
router.get('/tags', publicController.getAllTags);

// GET /api/public/experts - Lấy danh sách chuyên gia công khai
router.get('/experts', publicController.getPublicExperts);

// GET /api/public/experts/:id - Lấy chi tiết một chuyên gia
router.get('/experts/:id', publicController.getExpertById);

module.exports = router;