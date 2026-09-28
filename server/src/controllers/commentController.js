const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { logActivity } = require('../services/activityService');

// @desc    Add a comment to a task
// @route   POST /api/tasks/:taskId/comments
const addComment = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { comment } = req.body;

  if (!comment || !comment.trim()) {
    throw new ApiError(400, 'Comment text is required.');
  }

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, 'Task not found.');

  const created = await Comment.create({ task: taskId, user: req.user._id, comment: comment.trim() });
  await logActivity({ taskId, userId: req.user._id, action: 'Comment added' });

  const populated = await created.populate('user', 'name email profileImage');
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get all comments for a task
// @route   GET /api/tasks/:taskId/comments
const getComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({ task: req.params.taskId })
    .populate('user', 'name email profileImage')
    .sort('createdAt');

  res.json({ success: true, data: comments });
});

// @desc    Edit own comment
// @route   PUT /api/comments/:id
const updateComment = asyncHandler(async (req, res) => {
  const { comment } = req.body;
  const existing = await Comment.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Comment not found.');

  if (existing.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own comments.');
  }

  existing.comment = comment?.trim() || existing.comment;
  await existing.save();

  const populated = await existing.populate('user', 'name email profileImage');
  res.json({ success: true, data: populated });
});

// @desc    Delete own comment
// @route   DELETE /api/comments/:id
const deleteComment = asyncHandler(async (req, res) => {
  const existing = await Comment.findById(req.params.id);
  if (!existing) throw new ApiError(404, 'Comment not found.');

  if (existing.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new ApiError(403, 'You can only delete your own comments.');
  }

  await existing.deleteOne();
  res.json({ success: true, message: 'Comment deleted.' });
});

module.exports = { addComment, getComments, updateComment, deleteComment };
