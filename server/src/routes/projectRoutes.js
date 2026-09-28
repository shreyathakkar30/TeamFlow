const express = require('express');
const {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addMembers,
  removeMember,
} = require('../controllers/projectController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const { requireProjectMembership } = require('../middleware/projectAccess');
const validate = require('../middleware/validate');
const { projectRules } = require('../validations/projectValidation');

const router = express.Router();

router.use(protect);

router.post('/', requireRole('admin'), projectRules, validate, createProject);
router.get('/', getProjects);
router.get('/:id', requireProjectMembership((req) => req.params.id), getProjectById);
router.put('/:id', requireRole('admin'), projectRules, validate, updateProject);
router.delete('/:id', requireRole('admin'), deleteProject);
router.post('/:id/members', requireRole('admin'), addMembers);
router.delete('/:id/members/:userId', requireRole('admin'), removeMember);

module.exports = router;
