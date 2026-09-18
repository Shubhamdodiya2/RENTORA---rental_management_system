/**
 * Vendor Booking & Fulfillment Controller
 */

const { Booking, BookingItem, BookingStatusHistory, Product, ProductImage, User } = require('../models');
const BookingService = require('../services/booking.service');
const ApiResponse = require('../utils/apiResponse');
const { validateBookingTransition } = require('../validations/booking.validation');

class VendorBookingController {
  /**
   * GET /api/v1/vendor/bookings
   * List all rental bookings for the logged-in vendor store
   */
  static async getVendorBookings(req, res) {
    const { status, page = 1, limit = 15 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 15));
    const offset = (pageNum - 1) * limitNum;

    const where = { vendorId: req.vendorProfile.id };
    if (status) where.status = status;

    try {
      const { count, rows } = await Booking.findAndCountAll({
        where,
        include: [
          { 
            model: BookingItem, 
            as: 'items', 
            include: [
              { 
                model: Product, 
                as: 'product', 
                attributes: ['id', 'name', 'brand', 'sku'],
                include: [{ model: ProductImage, as: 'images', attributes: ['imageUrl', 'isPrimary'] }]
              }
            ] 
          },
          { 
            model: User, 
            as: 'customer', 
            attributes: ['id', 'fullName', 'email', 'phone', 'avatarUrl'] 
          }
        ],
        distinct: true,
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset
      });

      return ApiResponse.paginated(res, 'Vendor bookings retrieved successfully', rows, count, pageNum, limitNum);

    } catch (error) {
      console.error('[Get Vendor Bookings Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch vendor bookings', error.message, 500);
    }
  }

  /**
   * GET /api/v1/vendor/bookings/:id
   * Get single booking details for vendor order fulfillment
   */
  static async getVendorBookingById(req, res) {
    const { id } = req.params;

    try {
      const booking = await Booking.findOne({
        where: { id, vendorId: req.vendorProfile.id },
        include: [
          { model: BookingItem, as: 'items', include: [{ model: Product, as: 'product' }] },
          { model: BookingStatusHistory, as: 'statusHistory', include: [{ model: User, as: 'actor', attributes: ['id', 'fullName'] }] },
          { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone'] }
        ]
      });

      if (!booking) {
        return ApiResponse.error(res, 'Booking not found for this vendor store', null, 404);
      }

      return ApiResponse.success(res, 'Vendor booking details retrieved successfully', booking);

    } catch (error) {
      console.error('[Get Vendor Booking By ID Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch booking detail', error.message, 500);
    }
  }

  /**
   * PATCH /api/v1/vendor/bookings/:id/transition
   * Advance booking lifecycle step (e.g. Schedule Pickup, Handover, Return, Deposit Release)
   */
  static async transitionBookingStep(req, res) {
    const { id } = req.params;
    const validation = validateBookingTransition(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    try {
      const booking = await Booking.findOne({
        where: { id, vendorId: req.vendorProfile.id }
      });

      if (!booking) {
        return ApiResponse.error(res, 'Booking not found or not owned by vendor store', null, 404);
      }

      const targetStep = parseInt(req.body.targetStep, 10);
      const updated = await BookingService.transitionStep(id, targetStep, req.user, req.body);

      return ApiResponse.success(
        res,
        `Booking successfully advanced to Step ${targetStep}: ${updated.status}`,
        updated
      );

    } catch (error) {
      console.error('[Transition Booking Error]:', error);
      const status = error.statusCode || 500;
      return ApiResponse.error(res, error.message || 'Failed to advance booking lifecycle', null, status);
    }
  }

  /**
   * POST /api/v1/vendor/bookings/:id/verify-otp
   * Verify customer OTP and advance to Step 4 (PRODUCT_HANDED_OVER)
   */
  static async verifyHandoverOtp(req, res) {
    const { id } = req.params;
    const { otp, notes } = req.body;

    if (!otp || String(otp).trim().length !== 6) {
      return ApiResponse.error(res, '6-digit OTP is required for verification', { otp: 'Invalid' }, 400);
    }

    try {
      const booking = await Booking.findOne({
        where: { id, vendorId: req.vendorProfile.id }
      });

      if (!booking) {
        return ApiResponse.error(res, 'Booking not found', null, 404);
      }

      const updated = await BookingService.transitionStep(id, 4, req.user, {
        handoverOtp: otp,
        notes: notes || 'Equipment handed over and OTP verified successfully'
      });

      return ApiResponse.success(res, 'Handover OTP verified successfully! Equipment is now in active rental.', updated);

    } catch (error) {
      console.error('[Verify Handover OTP Error]:', error);
      const status = error.statusCode || 500;
      return ApiResponse.error(res, error.message || 'Handover OTP verification failed', null, status);
    }
  }
}

module.exports = VendorBookingController;
