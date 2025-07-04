const express = require('express');
const router = express.Router();
const cycleController = require('../controllers/cycle.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// POST /api/cycles/predict-anonymous
router.post('/predict-anonymous', cycleController.predictAnonymous);

// Các route dưới đây đều cần xác thực
router.use(authMiddleware);

// POST /api/cycles - Thêm chu kỳ mới
router.post('/', cycleController.addCycle);

// GET /api/cycles - Lấy tất cả chu kỳ của user
router.get('/', cycleController.getCycles);

// GET /api/cycles/prediction - Lấy dự đoán
// (Bạn sẽ implement logic này sau)
// router.get('/prediction', cycleController.getPrediction);

module.exports = router;    