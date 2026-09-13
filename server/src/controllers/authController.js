const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');

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
  });
});

module.exports = { register, login, getMe };
