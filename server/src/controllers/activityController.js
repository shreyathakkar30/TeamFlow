const asyncHandler = require('../utils/asyncHandler');
const Activity = require('../models/Activity');

// @desc    Get chronological activity history for a task
// @route   GET /api/tasks/:taskId/activity
const getTaskActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.find({ task: req.params.taskId })
    .populate('user', 'name email profileImage')
    .sort('createdAt');

  res.json({ success: true, data: activity });
});

module.exports = { getTaskActivity };
