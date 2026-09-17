const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authRateLimiter } = require('../middlewares/rateLimit.middleware');

// Public Auth Routes (with auth rate limiter)
router.post('/register', authRateLimiter, AuthController.register);
router.post('/login', authRateLimiter, AuthController.login);
router.post('/token/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);
router.post('/forgot-password', authRateLimiter, AuthController.forgotPassword);
router.post('/reset-password', authRateLimiter, AuthController.resetPassword);

// Private Authenticated Routes
router.use(authenticate); // Apply live DB auth middleware

router.get('/me', AuthController.getMe);
router.patch('/profile', AuthController.updateProfile);
router.post('/change-password', AuthController.changePassword);
router.post('/logout-all', AuthController.logoutAll);
router.post('/become-vendor', AuthController.becomeVendor);

module.exports = router;
