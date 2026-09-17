/**
 * Standardized API Response Helper
 */

class ApiResponse {
  static success(res, message = 'Request completed successfully', data = {}, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      errors: null
    });
  }

  static paginated(res, message = 'Data fetched successfully', results = [], count = 0, page = 1, limit = 10, statusCode = 200) {
    const totalPages = Math.ceil(count / limit) || 1;
    return res.status(statusCode).json({
      success: true,
      message,
      data: {
        count,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        results
      },
      errors: null
    });
  }

  static error(res, message = 'Something went wrong', errors = null, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      data: null,
      errors
    });
  }
}

module.exports = ApiResponse;
