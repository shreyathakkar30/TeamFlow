const { body } = require('express-validator');

const taskRules = [
  body('title').trim().notEmpty().withMessage('Task title is required').isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 5000 }),
  body('project').notEmpty().withMessage('Project is required').isMongoId(),
  body('assignedTo').optional({ nullable: true }).isMongoId(),
  body('priority').optional().isIn(['Low', 'Medium', 'High', 'Urgent']),
  body('status').optional().isIn(['Pending', 'In Progress', 'Under Review', 'Completed']),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601(),
  body('dueDate').notEmpty().withMessage('Due date is required').isISO8601(),
];

const statusRules = [
  body('status').isIn(['Pending', 'In Progress', 'Under Review', 'Completed']).withMessage('Invalid status'),
];

module.exports = { taskRules, statusRules };
