const express = require('express');
const { getRecommendations } = require('../controllers/recommendationController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('student'), getRecommendations);

module.exports = router;
