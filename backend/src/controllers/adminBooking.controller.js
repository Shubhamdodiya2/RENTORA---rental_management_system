/**
 * Super Admin Booking Management & Dispute Controller
 */

const { Booking, BookingItem, BookingStatusHistory, Product, VendorProfile, User, AuditLog } = require('../models');
const { BOOKING_STATUSES } = require('../config/constants');
const ApiResponse = require('../utils/apiResponse');

class AdminBookingController {
  /**
   * GET /api/v1/admin/bookings
   * List all platform bookings with comprehensive filters
   */
  static async getAllBookings(req, res) {
    const { status, vendorId, customerId, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const where = {};
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;
    if (customerId) where.customerId = customerId;

    try {
      const { count, rows } = await Booking.findAndCountAll({
        where,
        include: [
          { model: VendorProfile, as: 'vendor', attributes: ['id', 'businessName', 'city', 'businessEmail'] },
          { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone'] },
          { model: BookingItem, as: 'items', include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }] }
        ],
        distinct: true,
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset
      });

      return ApiResponse.paginated(res, 'Admin bookings retrieved successfully', rows, count, pageNum, limitNum);

    } catch (error) {
      console.error('[Admin Get Bookings Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch platform bookings', error.message, 500);
    }
  }

  /**
   * PATCH /api/v1/admin/bookings/:id/status
   * Administrative override / dispute escalation & resolution
   */
  static async overrideBookingStatus(req, res) {
    const { id } = req.params;
    const { status, notes, reason } = req.body;
    const adminReason = notes || reason;

    if (!status || !BOOKING_STATUSES.includes(status)) {
      return ApiResponse.error(
        res,
        `Valid status is required for administrative override. Allowed: ${BOOKING_STATUSES.join(', ')}`,
        null,
        400
      );
    }

    if (!adminReason || String(adminReason).trim().length < 10) {
      return ApiResponse.error(
        res,
        'A comprehensive reason (minimum 10 characters) is strictly mandatory for administrative status override',
        { reason: 'Minimum 10 characters required' },
        400
      );
    }

    try {
      const booking = await Booking.findByPk(id);
      if (!booking) {
        return ApiResponse.error(res, 'Booking not found', null, 404);
      }

      const prevStatus = booking.status;
      booking.status = status;
      await booking.save();

      // Record in status history
      await BookingStatusHistory.create({
        bookingId: booking.id,
        status,
        stepNumber: booking.currentStep,
        title: status === 'DISPUTED' ? 'Dispute Escalated' : 'Administrative Override',
        notes: `[ADMIN OVERRIDE: ${status}] ${adminReason.trim()} (Previous: ${prevStatus})`,
        performedBy: req.user.id
      });

      // Immutable Audit Log entry
      await AuditLog.create({
        adminId: req.user.id,
        adminName: req.user.fullName || 'SUPER_ADMIN',
        action: 'BOOKING_STATUS_OVERRIDE',
        module: 'BOOKINGS',
        description: `Booking #${booking.bookingNumber} status overridden from '${prevStatus}' to '${status}' by admin. Reason: ${adminReason.trim()}`,
        targetId: booking.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return ApiResponse.success(res, `Booking status successfully updated to '${status}'`, booking);

    } catch (error) {
      console.error('[Admin Override Status Error]:', error);
      return ApiResponse.error(res, 'Failed to update booking status', error.message, 500);
    }
  }
}

module.exports = AdminBookingController;
