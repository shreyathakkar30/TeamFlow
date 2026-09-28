const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Admin dashboard summary statistics
// @route   GET /api/dashboard/admin
const getAdminDashboard = asyncHandler(async (req, res) => {
  const now = new Date();

  const [
    totalUsers,
    totalProjects,
    activeProjects,
    completedProjects,
    totalTasks,
    pendingTasks,
    inProgressTasks,
    completedTasks,
    overdueTasks,
  ] = await Promise.all([
    User.countDocuments(),
    Project.countDocuments(),
    Project.countDocuments({ status: 'Active' }),
    Project.countDocuments({ status: 'Completed' }),
    Task.countDocuments(),
    Task.countDocuments({ status: 'Pending' }),
    Task.countDocuments({ status: 'In Progress' }),
    Task.countDocuments({ status: 'Completed' }),
    Task.countDocuments({ status: { $ne: 'Completed' }, dueDate: { $lt: now } }),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      completedTasks,
    },
  });
});

// @desc    Team member dashboard summary
// @route   GET /api/dashboard/member
const getMemberDashboard = asyncHandler(async (req, res) => {
  const now = new Date();
  const userId = req.user._id;

  const projects = await Project.find({ members: userId }).select('name status startDate dueDate');

  const [tasks, pendingTasks, inProgressTasks, completedTasks, overdueTasks] = await Promise.all([
    Task.find({ assignedTo: userId })
      .populate('project', 'name')
      .sort('-createdAt')
      .limit(20),
    Task.countDocuments({ assignedTo: userId, status: 'Pending' }),
    Task.countDocuments({ assignedTo: userId, status: 'In Progress' }),
    Task.countDocuments({ assignedTo: userId, status: 'Completed' }),
    Task.countDocuments({ assignedTo: userId, status: { $ne: 'Completed' }, dueDate: { $lt: now } }),
  ]);

  res.json({
    success: true,
    data: {
      projects,
      tasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
    },
  });
});

module.exports = { getAdminDashboard, getMemberDashboard };
