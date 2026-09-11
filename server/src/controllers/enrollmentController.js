const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../utils/asyncHandler');

// @route POST /api/enrollments (student)
const enroll = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  if (!courseId) return res.status(400).json({ message: 'courseId is required' });

  const course = await Course.findById(courseId);
  if (!course) return res.status(404).json({ message: 'Course not found' });

  const existing = await Enrollment.findOne({ student: req.user._id, course: courseId });
  if (existing) return res.status(409).json({ message: 'Already enrolled in this course' });

  const enrollment = await Enrollment.create({ student: req.user._id, course: courseId });
  res.status(201).json(enrollment);
});

// @route GET /api/enrollments/mine (student)
const getMyEnrollments = asyncHandler(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate('course')
    .sort('-createdAt');
  res.json(enrollments);
});

module.exports = { enroll, getMyEnrollments };
