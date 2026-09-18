/**
 * Notification Controller
 * Handles user notifications fetching, mark as read, and deletion
 */

const { Notification } = require('../models');
const ApiResponse = require('../utils/apiResponse');

class NotificationController {
  /**
   * GET /api/v1/notifications
   * Fetch current user's notifications
   */
  static async getMyNotifications(req, res) {
    try {
      const recipientId = req.user.id;
      const notifications = await Notification.findAll({
        where: { recipientId },
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      return ApiResponse.success(res, 'Notifications retrieved successfully', notifications);
    } catch (error) {
      console.error('[Get Notifications Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch notifications', error.message, 500);
    }
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   * Toggle or set isRead status for a single notification
   */
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const recipientId = req.user.id;
      const isRead = req.body.isRead !== undefined ? req.body.isRead : true;

      const notification = await Notification.findOne({
        where: { id, recipientId }
      });

      if (!notification) {
        return ApiResponse.error(res, 'Notification not found', null, 404);
      }

      notification.isRead = isRead;
      await notification.save();

      return ApiResponse.success(res, 'Notification updated successfully', notification);
    } catch (error) {
      console.error('[Mark Notification Error]:', error);
      return ApiResponse.error(res, 'Failed to update notification', error.message, 500);
    }
  }

  /**
   * POST /api/v1/notifications/mark-all-read
   * Mark all notifications as read for current user
   */
  static async markAllAsRead(req, res) {
    try {
      const recipientId = req.user.id;
      await Notification.update(
        { isRead: true },
        { where: { recipientId, isRead: false } }
      );

      return ApiResponse.success(res, 'All notifications marked as read');
    } catch (error) {
      console.error('[Mark All Read Error]:', error);
      return ApiResponse.error(res, 'Failed to mark all as read', error.message, 500);
    }
  }

  /**
   * DELETE /api/v1/notifications/:id
   * Delete a single notification
   */
  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const recipientId = req.user.id;

      const deleted = await Notification.destroy({
        where: { id, recipientId }
      });

      if (!deleted) {
        return ApiResponse.error(res, 'Notification not found', null, 404);
      }

      return ApiResponse.success(res, 'Notification deleted successfully');
    } catch (error) {
      console.error('[Delete Notification Error]:', error);
      return ApiResponse.error(res, 'Failed to delete notification', error.message, 500);
    }
  }

  /**
   * DELETE /api/v1/notifications
   * Clear all notifications for current user
   */
  static async clearAll(req, res) {
    try {
      const recipientId = req.user.id;
      await Notification.destroy({
        where: { recipientId }
      });

      return ApiResponse.success(res, 'All notifications cleared successfully');
    } catch (error) {
      console.error('[Clear Notifications Error]:', error);
      return ApiResponse.error(res, 'Failed to clear notifications', error.message, 500);
    }
  }
}

module.exports = NotificationController;
