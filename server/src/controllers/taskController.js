const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Task = require('../models/Task');
const Project = require('../models/Project');
const ApiFeatures = require('../utils/apiFeatures');
const { logActivity } = require('../services/activityService');

// @desc    Create a task inside a project
// @route   POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, description, project, assignedTo, priority, status, startDate, dueDate } = req.body;

  const projectDoc = await Project.findById(project);
  if (!projectDoc) throw new ApiError(404, 'Project not found.');

  if (assignedTo && !projectDoc.members.some((m) => m.toString() === assignedTo)) {
    throw new ApiError(400, 'Assigned user must be a member of the project.');
  }

  const task = await Task.create({
    title,
    description,
    project,
    assignedTo: assignedTo || null,
    priority,
    status,
    startDate,
    dueDate,
    createdBy: req.user._id,
  });

  await logActivity({ taskId: task._id, userId: req.user._id, action: 'Task created' });
  if (assignedTo) {
    await logActivity({
      taskId: task._id,
      userId: req.user._id,
      action: 'Task assigned',
      newValue: assignedTo,
    });
  }

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'project', select: 'name' },
  ]);

  res.status(201).json({ success: true, data: populated });
});

// @desc    List tasks with search/filter/sort/pagination.
//          Members only see tasks from projects they belong to.
// @route   GET /api/tasks
const getTasks = asyncHandler(async (req, res) => {
  const features = new ApiFeatures({}, Task.find(), req.query)
    .filter(['project', 'assignedTo', 'status', 'priority'])
    .dateRange('dueDate', 'dueBefore', 'dueAfter')
    .search(['title', 'description']);

  if (req.user.role !== 'admin') {
    const myProjects = await Project.find({ members: req.user._id }).select('_id');
    features.query.project = { $in: myProjects.map((p) => p._id) };
  }

  if (req.query.overdue === 'true') {
    features.query.status = { $ne: 'Completed' };
    features.query.dueDate = { $lt: new Date() };
  }

  const sortMap = {
    createdAt: 'createdAt',
    dueDate: 'dueDate',
    priority: 'priority',
    status: 'status',
  };
  const sortField = sortMap[req.query.sortBy] || 'createdAt';
  const sortDir = req.query.order === 'asc' ? '' : '-';
  const sortBy = `${sortDir}${sortField}`;

  const { page, limit, skip, total, totalPages } = await features.paginate(Task, sortBy);

  const tasks = await Task.find(features.query)
    .populate('assignedTo', 'name email profileImage')
    .populate('project', 'name status')
    .populate('createdBy', 'name email')
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: tasks,
    pagination: { page, totalPages, total, limit },
  });
});

// @desc    Get a single task
// @route   GET /api/tasks/:id
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email profileImage')
    .populate('project', 'name members')
    .populate('createdBy', 'name email');

  if (!task) throw new ApiError(404, 'Task not found.');

  if (req.user.role !== 'admin') {
    const isMember = task.project.members.some((m) => m.toString() === req.user._id.toString());
    if (!isMember) throw new ApiError(403, 'You are not a member of this task\'s project.');
  }

  res.json({ success: true, data: task });
});

// @desc    Update a task (full edit - admin only via route protection)
// @route   PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found.');

  const changes = [];
  const fields = ['title', 'description', 'assignedTo', 'priority', 'status', 'startDate', 'dueDate'];

  fields.forEach((field) => {
    if (req.body[field] !== undefined && String(req.body[field]) !== String(task[field] ?? '')) {
      changes.push({ field, previous: task[field], next: req.body[field] });
      task[field] = req.body[field];
    }
  });

  await task.save();

  await Promise.all(
    changes.map((change) => {
      const actionMap = {
        status: 'Status changed',
        priority: 'Priority changed',
        dueDate: 'Due date changed',
        assignedTo: 'Task assigned',
      };
      const action = actionMap[change.field] || 'Task updated';
      return logActivity({
        taskId: task._id,
        userId: req.user._id,
        action,
        previousValue: change.previous,
        newValue: change.next,
      });
    })
  );

  const populated = await task.populate([
    { path: 'assignedTo', select: 'name email profileImage' },
    { path: 'project', select: 'name' },
  ]);

  res.json({ success: true, data: populated });
});

// @desc    Update only task status (team members can update their own tasks)
// @route   PATCH /api/tasks/:id/status
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found.');

  if (
    req.user.role !== 'admin' &&
    (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString())
  ) {
    throw new ApiError(403, 'You can only update the status of tasks assigned to you.');
  }

  const previous = task.status;
  task.status = status;
  await task.save();

  await logActivity({
    taskId: task._id,
    userId: req.user._id,
    action: 'Status changed',
    previousValue: previous,
    newValue: status,
  });

  res.json({ success: true, data: task });
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found.');
  res.json({ success: true, message: 'Task deleted.' });
});

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
