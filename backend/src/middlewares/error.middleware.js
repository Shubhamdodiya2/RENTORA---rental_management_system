const ApiResponse = require('../utils/apiResponse');

function errorMiddleware(err, req, res, next) {
  console.error('[Error Stack]:', err);

  // Sequelize Unique Constraint Error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const fieldErrors = {};
    err.errors.forEach((e) => {
      fieldErrors[e.path] = `${e.path} already exists`;
    });
    return ApiResponse.error(res, 'Duplicate resource error', fieldErrors, 409);
  }

  // Sequelize Validation Error
  if (err.name === 'SequelizeValidationError') {
    const fieldErrors = {};
    err.errors.forEach((e) => {
      fieldErrors[e.path] = e.message;
    });
    return ApiResponse.error(res, 'Validation failed', fieldErrors, 400);
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token provided', null, 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token has expired', null, 401);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return ApiResponse.error(res, message, err.errors || null, statusCode);
}

module.exports = errorMiddleware;
