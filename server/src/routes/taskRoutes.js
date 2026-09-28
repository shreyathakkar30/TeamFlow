const express = require('express');
const {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { addComment, getComments } = require('../controllers/commentController');
const { getTaskActivity } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');
const validate = require('../middleware/validate');
const { taskRules, statusRules } = require('../validations/taskValidation');

const router = express.Router();

router.use(protect);

router.post('/', requireRole('admin'), taskRules, validate, createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', requireRole('admin'), updateTask);
router.patch('/:id/status', statusRules, validate, updateTaskStatus);
router.delete('/:id', requireRole('admin'), deleteTask);

// Nested comment + activity routes
router.post('/:taskId/comments', addComment);
router.get('/:taskId/comments', getComments);
router.get('/:taskId/activity', getTaskActivity);

module.exports = router;
