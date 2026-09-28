const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Runs after express-validator chains; collects errors into a single
// ApiError so the centralized error handler can format the response.
const validate = (req, res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const errors = result.array().map((e) => e.msg);
    return next(new ApiError(400, 'Validation failed', errors));
  }
  next();
};

module.exports = validate;
