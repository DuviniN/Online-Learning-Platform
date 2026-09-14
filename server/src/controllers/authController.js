const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const { validatePassword } = require('../utils/validatePassword');

// Fixed-length digest comparison so timingSafeEqual never throws on mismatched
// input length, and the comparison time doesn't leak the code's length either.
function safeCompare(a, b) {
  const hashA = crypto.createHash('sha256').update(String(a)).digest();
  const hashB = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// @route POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, instructorCode } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email and password are required' });
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  const wantsInstructor = role === 'instructor';

  // The backend is the only authority on the instructor role — the client's
  // requested role is never trusted on its own. Fails closed if the server's
  // own code isn't configured.
  if (wantsInstructor) {
    const expectedCode = process.env.INSTRUCTOR_REGISTRATION_CODE;
    if (!expectedCode || !instructorCode || !safeCompare(instructorCode, expectedCode)) {
      return res.status(403).json({ message: 'Invalid instructor registration code.' });
    }
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const user = await User.create({
    name,
    email,
    password,
    role: wantsInstructor ? 'instructor' : 'student',
  });

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
});

// @route POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: generateToken(user._id, user.role),
  });
});

// @route GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    createdAt: req.user.createdAt,
  });
});

// @route PUT /api/auth/me
// Updates the caller's own profile (name) and/or password. Email and role are
// never accepted here — the backend stays the sole authority on both, the
// same way it is for the instructor role at registration.
const updateMe = asyncHandler(async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (name !== undefined) {
    if (!name.trim()) {
      return res.status(400).json({ message: 'Name cannot be empty' });
    }
    user.name = name.trim();
  }

  if (newPassword) {
    if (!currentPassword || !(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }
    user.password = newPassword;
  }

  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  });
});

module.exports = { register, login, getMe, updateMe };
