const Activity = require('../models/Activity');

// Records a task activity entry. Called from task/comment controllers
// whenever a tracked change happens.
const logActivity = async ({ taskId, userId, action, previousValue = '', newValue = '' }) => {
  await Activity.create({
    task: taskId,
    user: userId,
    action,
    previousValue: String(previousValue ?? ''),
    newValue: String(newValue ?? ''),
  });
};

module.exports = { logActivity };
