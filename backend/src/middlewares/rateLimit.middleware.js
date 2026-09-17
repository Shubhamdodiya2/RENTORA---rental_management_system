const rateLimit = require('express-rate-limit');

// Strict rate limiter for Authentication endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 requests per IP
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    data: null,
    errors: { rateLimit: 'Exceeded maximum login/registration attempts' }
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Standard API rate limiter
const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300, // 300 requests per IP
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  authRateLimiter,
  apiRateLimiter
};
