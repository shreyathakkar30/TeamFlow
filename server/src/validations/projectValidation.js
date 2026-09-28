const { body } = require('express-validator');

const projectRules = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('status').optional().isIn(['Planning', 'Active', 'On Hold', 'Completed']),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601(),
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) < new Date(req.body.startDate)) {
        throw new Error('Due date must be on or after the start date');
      }
      return true;
    }),
  body('members').optional().isArray().withMessage('Members must be an array of user IDs'),
];

module.exports = { projectRules };
