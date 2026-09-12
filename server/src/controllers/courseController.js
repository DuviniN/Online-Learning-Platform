const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const asyncHandler = require('../utils/asyncHandler');

// @route POST /api/courses (instructor)
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, content } = req.body;

  if (!title || !description || !content) {
    return res.status(400).json({ message: 'Title, description and content are required' });
  }

  const course = await Course.create({ title, description, content, instructor: req.user._id });
  res.status(201).json(course);
});

// @route GET /api/courses (any authenticated user — course catalog)
const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate('instructor', 'name email').sort('-createdAt');
  res.json(courses);
});

// @route GET /api/courses/mine (instructor's own courses)
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor: req.user._id }).sort('-createdAt');
  res.json(courses);
});

// @route GET /api/courses/:id
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('instructor', 'name email');
  if (!course) return res.status(404).json({ message: 'Course not found' });
  res.json(course);
});

// @route PUT /api/courses/:id (instructor, must own the course)
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to edit this course' });
  }

  const { title, description, content } = req.body;
  if (title !== undefined) course.title = title;
  if (description !== undefined) course.description = description;
  if (content !== undefined) course.content = content;

  await course.save();
  res.json(course);
});

// @route DELETE /api/courses/:id (instructor, must own the course)
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to delete this course' });
  }

  await Enrollment.deleteMany({ course: course._id });
  await course.deleteOne();

  res.json({ message: 'Course deleted' });
});

// @route GET /api/courses/:id/students (instructor, must own the course)
const getEnrolledStudents = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (course.instructor.toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: 'Not authorized to view enrollments for this course' });
  }

  const enrollments = await Enrollment.find({ course: course._id })
    .populate('student', 'name email')
    .sort('-createdAt');

  res.json(
    enrollments.map((e) => ({
      _id: e._id,
      studentId: e.student._id,
      name: e.student.name,
      email: e.student.email,
      enrolledAt: e.createdAt,
    }))
  );
});

module.exports = {
  createCourse,
  getAllCourses,
  getMyCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getEnrolledStudents,
};
