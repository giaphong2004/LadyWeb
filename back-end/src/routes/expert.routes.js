const express = require('express');
const router = express.Router();

// Import controller tương ứng
const expertController = require('../controllers/expert.controller');

// [POST] /api/experts/
// Route để admin tạo một chuyên gia mới.
// Khi có request đến địa chỉ này, nó sẽ gọi hàm 'createExpert' trong controller.
router.post('/', expertController.createExpert);

/*
// Ví dụ: sau này bạn muốn có API lấy danh sách chuyên gia, bạn sẽ thêm vào đây:
// [GET] /api/experts/
router.get('/', expertController.getAllExperts);
*/

// Export router để server.js có thể sử dụng
module.exports = router;