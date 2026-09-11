const express = require('express');
const {
  createCourse,
  getAllCourses,
  getMyCourses,
  getCourseById,
  updateCourse,
  getEnrolledStudents,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getAllCourses);
router.post('/', protect, authorize('instructor'), createCourse);
router.get('/mine', protect, authorize('instructor'), getMyCourses);
router.get('/:id/students', protect, authorize('instructor'), getEnrolledStudents);
router.get('/:id', protect, getCourseById);
router.put('/:id', protect, authorize('instructor'), updateCourse);

module.exports = router;
