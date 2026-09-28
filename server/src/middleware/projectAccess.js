const mongoose = require('mongoose');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Project = require('../models/Project');

// Ensures a non-admin user is a member of the project before they can
// view or act on its data. Admins bypass this check.
const requireProjectMembership = (getProjectId) =>
  asyncHandler(async (req, res, next) => {
    if (req.user.role === 'admin') return next();

    const projectId = getProjectId(req);
    if (!mongoose.isValidObjectId(projectId)) {
      throw new ApiError(400, 'Invalid project ID.');
    }

    const project = await Project.findById(projectId).select('members');
    if (!project) {
      throw new ApiError(404, 'Project not found.');
    }

    const isMember = project.members.some((m) => m.toString() === req.user._id.toString());
    if (!isMember) {
      throw new ApiError(403, 'You are not a member of this project.');
    }

    next();
  });

module.exports = { requireProjectMembership };
