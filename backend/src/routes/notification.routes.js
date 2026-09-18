/**
 * Notification Routes
 */

const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// All notification routes require authentication
router.use(authenticate);

// Get my notifications
router.get('/', NotificationController.getMyNotifications);

// Mark all as read
router.post('/mark-all-read', NotificationController.markAllAsRead);

// Toggle/set read on specific notification
router.patch('/:id/read', NotificationController.markAsRead);

// Delete specific notification
router.delete('/:id', NotificationController.deleteNotification);

// Clear all notifications
router.delete('/', NotificationController.clearAll);

module.exports = router;
