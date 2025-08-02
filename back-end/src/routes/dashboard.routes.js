const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

// GET /api/dashboard/stats - Lấy tất cả số liệu thống kê
router.get('/stats', dashboardController.getStats);

module.exports = router;