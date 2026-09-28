const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Project = require('../models/Project');
const Task = require('../models/Task');
const ApiFeatures = require('../utils/apiFeatures');

// @desc    Create a project
// @route   POST /api/projects
const createProject = asyncHandler(async (req, res) => {
  const { name, description, status, startDate, dueDate, members } = req.body;

  const project = await Project.create({
    name,
    description,
    status,
    startDate,
    dueDate,
    members: members || [],
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, data: project });
});

// @desc    List projects (admins see all, members see only their own)
// @route   GET /api/projects
const getProjects = asyncHandler(async (req, res) => {
  const features = new ApiFeatures({}, Project.find(), req.query)
    .filter(['status'])
    .search(['name', 'description']);

  if (req.user.role !== 'admin') {
    features.query.members = req.user._id;
  }

  const { page, limit, skip, sortBy, total, totalPages } = await features.paginate(Project);

  const projects = await Project.find(features.query)
    .populate('members', 'name email profileImage')
    .populate('createdBy', 'name email')
    .sort(sortBy)
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: projects,
    pagination: { page, totalPages, total, limit },
  });
});

// @desc    Get single project
// @route   GET /api/projects/:id
const getProjectById = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id)
    .populate('members', 'name email profileImage')
    .populate('createdBy', 'name email');

  if (!project) throw new ApiError(404, 'Project not found.');

  res.json({ success: true, data: project });
});

// @desc    Update a project
// @route   PUT /api/projects/:id
const updateProject = asyncHandler(async (req, res) => {
  const { name, description, status, startDate, dueDate } = req.body;

  const project = await Project.findByIdAndUpdate(
    req.params.id,
    { name, description, status, startDate, dueDate },
    { new: true, runValidators: true }
  );

  if (!project) throw new ApiError(404, 'Project not found.');

  res.json({ success: true, data: project });
});

// @desc    Delete a project (and its tasks)
// @route   DELETE /api/projects/:id
const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found.');

  await Task.deleteMany({ project: project._id });
  await project.deleteOne();

  res.json({ success: true, message: 'Project and its tasks were deleted.' });
});

// @desc    Add members to a project
// @route   POST /api/projects/:id/members
const addMembers = asyncHandler(async (req, res) => {
  const { memberIds } = req.body;
  if (!Array.isArray(memberIds) || memberIds.length === 0) {
    throw new ApiError(400, 'memberIds must be a non-empty array of user IDs.');
  }

  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found.');

  const existing = new Set(project.members.map((m) => m.toString()));
  memberIds.forEach((id) => existing.add(id));
  project.members = Array.from(existing);
  await project.save();

  await project.populate('members', 'name email profileImage');
  res.json({ success: true, data: project });
});

// @desc    Remove a member from a project
// @route   DELETE /api/projects/:id/members/:userId
const removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, 'Project not found.');

  project.members = project.members.filter((m) => m.toString() !== req.params.userId);
  await project.save();

  res.json({ success: true, data: project });
});

module.exports = {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
};
