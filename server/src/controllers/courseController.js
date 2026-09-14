const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// Escapes regex special characters in user-supplied search text so it's safe
// to interpolate into a MongoDB $regex (prevents regex-injection / ReDoS).
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
// Supports pagination (?page=&limit=) and search (?search=), matched against
// course title/description or the instructor's name, all at the database level
// so the full catalog is never loaded into memory just to show one page of it.
const getAllCourses = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 50);
  const search = (req.query.search || '').trim();

  let filter = {};
  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    const matchingInstructors = await User.find({ role: 'instructor', name: regex }).select('_id');
    filter = {
      $or: [
        { title: regex },
        { description: regex },
        { instructor: { $in: matchingInstructors.map((u) => u._id) } },
      ],
    };
  }

  const [courses, totalCount] = await Promise.all([
    Course.find(filter)
      .populate('instructor', 'name email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
    Course.countDocuments(filter),
  ]);

  res.json({
    courses,
    page,
    totalPages: Math.max(Math.ceil(totalCount / limit), 1),
    totalCount,
  });
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
