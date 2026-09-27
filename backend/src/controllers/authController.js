const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const { signToken } = require('../middleware/auth');

/**
 * POST /api/auth/login
 * Verifies credentials and returns a JWT. Generic error message is used
 * for both unknown email and wrong password (no account enumeration).
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email: String(email).toLowerCase().trim() }).select('+password');
  if (!admin || !admin.isActive) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password.');
  }

  admin.lastLoginAt = new Date();
  await admin.save({ validateBeforeSave: false });

  const token = signToken(admin);

  return sendSuccess(res, {
    message: 'Logged in successfully.',
    data: { token, admin: admin.toJSON() },
  });
});

/**
 * POST /api/auth/logout
 * Stateless JWT: the client discards the token. Endpoint exists so the
 * frontend has a consistent call and future token revocation can slot in.
 */
const logout = asyncHandler(async (req, res) => {
  return sendSuccess(res, { message: 'Logged out successfully.' });
});

/**
 * GET /api/auth/me
 * Returns the currently authenticated admin.
 */
const me = asyncHandler(async (req, res) => {
  return sendSuccess(res, { message: 'OK', data: { admin: req.admin.toJSON() } });
});

/**
 * PUT /api/auth/profile
 * Update the admin's own name / phone / avatar.
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar, email } = req.body;

  const admin = await Admin.findById(req.admin._id);

  if (name !== undefined) admin.name = name;
  if (phone !== undefined) admin.phone = phone;
  if (avatar !== undefined) admin.avatar = avatar;

  if (email !== undefined && email.toLowerCase() !== admin.email) {
    const taken = await Admin.exists({ email: email.toLowerCase(), _id: { $ne: admin._id } });
    if (taken) throw ApiError.conflict('This email is already in use.');
    admin.email = email.toLowerCase();
  }

  await admin.save();

  return sendSuccess(res, { message: 'Profile updated successfully.', data: { admin: admin.toJSON() } });
});

/**
 * PUT /api/auth/change-password
 * Requires the current password before setting a new one.
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.admin._id).select('+password');

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    throw ApiError.badRequest('Current password is incorrect.');
  }

  admin.password = newPassword;
  await admin.save();

  const token = signToken(admin);

  return sendSuccess(res, { message: 'Password changed successfully.', data: { token } });
});

module.exports = { login, logout, me, updateProfile, changePassword };
