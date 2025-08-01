const express = require('express');
const router = express.Router();
const imagekitController = require('../controllers/imagekit.controller');

router.get('/auth', imagekitController.getAuthSignature);

module.exports = router;