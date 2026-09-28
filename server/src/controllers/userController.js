const path = require('path');
const fs = require('fs');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');
const ApiFeatures = require('../utils/apiFeatures');
const { toPublicUser } = require('./authController');

// @desc    List users (admin) - search, filter, paginate
// @route   GET /api/users
const getUsers = asyncHandler(async (req, res) => {
  const features = new ApiFeatures({}, User.find(), req.query)
    .filter(['role', 'isActive'])
    .search(['name', 'email']);

  const { page, limit, skip, sortBy, total, totalPages } = await features.paginate(User);

  const users = await User.find(features.query).sort(sortBy).skip(skip).limit(limit);

  res.json({
    success: true,
    data: users.map(toPublicUser),
    pagination: { page, totalPages, total, limit },
  });
});

// @desc    Get single user
// @route   GET /api/users/:id
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  res.json({ success: true, data: toPublicUser(user) });
});

// @desc    Update a user's own profile info (name)
// @route   PUT /api/users/:id
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'admin' && req.user._id.toString() !== id) {
    throw new ApiError(403, 'You can only update your own profile.');
  }

  const updates = {};
  if (req.body.name) updates.name = req.body.name;

  // Prevent privilege escalation: users cannot set their own role here.
  if ('role' in req.body && req.user._id.toString() === id) {
    throw new ApiError(403, 'You cannot change your own role.');
  }
  if (req.user.role === 'admin' && req.body.role) {
    updates.role = req.body.role;
  }

  const user = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
  if (!user) throw new ApiError(404, 'User not found.');

  res.json({ success: true, data: toPublicUser(user) });
});

// @desc    Activate/deactivate a user
// @route   PATCH /api/users/:id/status
const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (req.user._id.toString() === req.params.id) {
    throw new ApiError(400, 'You cannot deactivate your own account.');
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: Boolean(isActive) },
    { new: true }
  );
  if (!user) throw new ApiError(404, 'User not found.');

  res.json({ success: true, data: toPublicUser(user) });
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
const deleteUser = asyncHandler(async (req, res) => {
  if (req.user._id.toString() === req.params.id) {
    throw new ApiError(400, 'You cannot delete your own account.');
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw new ApiError(404, 'User not found.');
  res.json({ success: true, message: 'User deleted.' });
});

// @desc    Update own profile image
// @route   PUT /api/users/:id/profile-image
const updateProfileImage = asyncHandler(async (req, res) => {
  if (req.user._id.toString() !== req.params.id) {
    throw new ApiError(403, 'You can only update your own profile image.');
  }
  if (!req.file) {
    throw new ApiError(400, 'No image file provided.');
  }

  const user = await User.findById(req.params.id);

  // Remove old profile image file if present.
  if (user.profileImage) {
    const oldPath = path.join(__dirname, '..', '..', user.profileImage.replace(/^\/+/, ''));
    fs.unlink(oldPath, () => {});
  }

  user.profileImage = `/uploads/profiles/${req.file.filename}`;
  await user.save();

  res.json({ success: true, data: toPublicUser(user) });
});

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  updateProfileImage,
};
