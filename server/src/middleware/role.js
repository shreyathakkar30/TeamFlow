const ApiError = require('../utils/ApiError');

// Restricts a route to the given roles. Use after `protect`.
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };

module.exports = { requireRole };
