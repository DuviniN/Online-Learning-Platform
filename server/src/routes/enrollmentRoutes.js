const express = require('express');
const { enroll, getMyEnrollments } = require('../controllers/enrollmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, authorize('student'), enroll);
router.get('/mine', protect, authorize('student'), getMyEnrollments);

module.exports = router;
