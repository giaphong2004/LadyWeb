const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');

const authMiddleware = require('../middlewares/auth.middleware');

// GET routes - no auth for testing
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);

// POST, PUT, DELETE need auth
router.post('/', authMiddleware, postController.createPost);
router.put('/:id', authMiddleware, postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;