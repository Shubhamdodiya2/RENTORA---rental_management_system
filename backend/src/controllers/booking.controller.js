/**
 * Customer Booking Controller
 */

const { Booking, BookingItem, BookingStatusHistory, Product, VendorProfile, Order, User } = require('../models');
const BookingService = require('../services/booking.service');
const ApiResponse = require('../utils/apiResponse');
const { validateBookingCreate, validateBookingCancel } = require('../validations/booking.validation');

class BookingController {
  /**
   * POST /api/v1/bookings
   * Customer initiates multi-product rental booking checkout
   */
  static async createBooking(req, res) {
    const validation = validateBookingCreate(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    try {
      const booking = await BookingService.createBooking(req.user.id, req.body);
      return ApiResponse.success(res, 'Booking created and confirmed successfully', booking, 201);
    } catch (error) {
      console.error('[Create Booking Error]:', error);
      const status = error.statusCode || 500;
      return ApiResponse.error(res, error.message || 'Failed to create booking', error.details || null, status);
    }
  }

  /**
   * GET /api/v1/bookings
   * List customer's own rental bookings
   */
  static async getCustomerBookings(req, res) {
    const { status, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const where = { customerId: req.user.id };
    if (status) where.status = status;

    try {
      const { count, rows } = await Booking.findAndCountAll({
        where,
        include: [
          { 
            model: BookingItem, 
            as: 'items', 
            include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'slug', 'brand'] }] 
          },
          { 
            model: VendorProfile, 
            as: 'vendor', 
            attributes: ['id', 'businessName', 'city', 'businessPhone'] 
          }
        ],
        distinct: true,
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset
      });

      return ApiResponse.paginated(res, 'Customer bookings retrieved successfully', rows, count, pageNum, limitNum);

    } catch (error) {
      console.error('[Get Customer Bookings Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch customer bookings', error.message, 500);
    }
  }

  /**
   * GET /api/v1/bookings/:id
   * Get single booking detail with line items, vendor info & timeline history
   */
  static async getBookingById(req, res) {
    const { id } = req.params;

    try {
      const booking = await Booking.findByPk(id, {
        include: [
          { 
            model: BookingItem, 
            as: 'items', 
            include: [{ model: Product, as: 'product' }] 
          },
          { 
            model: BookingStatusHistory, 
            as: 'statusHistory',
            include: [{ model: User, as: 'actor', attributes: ['id', 'fullName', 'email'] }]
          },
          { 
            model: VendorProfile, 
            as: 'vendor', 
            attributes: ['id', 'businessName', 'city', 'businessPhone', 'businessEmail', 'businessAddress'] 
          },
          { 
            model: User, 
            as: 'customer', 
            attributes: ['id', 'fullName', 'email', 'phone'] 
          }
        ],
        order: [[{ model: BookingStatusHistory, as: 'statusHistory' }, 'stepNumber', 'ASC']]
      });

      if (!booking) {
        return ApiResponse.error(res, 'Booking not found', null, 404);
      }

      // Authorization Guard: Only Customer owner, Vendor owner, or Super Admin can view
      const isCustomerOwner = booking.customerId === req.user.id;
      const isVendorOwner = req.vendorProfile && booking.vendorId === req.vendorProfile.id;
      const isSuperAdmin = req.roles && req.roles.includes('SUPER_ADMIN');

      if (!isCustomerOwner && !isVendorOwner && !isSuperAdmin) {
        return ApiResponse.error(res, 'Forbidden: You do not have permission to view this booking', null, 403);
      }

      return ApiResponse.success(res, 'Booking details retrieved successfully', booking);

    } catch (error) {
      console.error('[Get Booking Detail Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch booking detail', error.message, 500);
    }
  }

  /**
   * PATCH /api/v1/bookings/:id/cancel
   * Customer / Vendor cancels booking in early stages (Steps 1..3)
   */
  static async cancelBooking(req, res) {
    const { id } = req.params;
    const validation = validateBookingCancel(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    try {
      const booking = await Booking.findByPk(id);
      if (!booking) {
        return ApiResponse.error(res, 'Booking not found', null, 404);
      }

      const isCustomerOwner = booking.customerId === req.user.id;
      const isVendorOwner = req.vendorProfile && booking.vendorId === req.vendorProfile.id;
      const isSuperAdmin = req.roles && req.roles.includes('SUPER_ADMIN');

      if (!isCustomerOwner && !isVendorOwner && !isSuperAdmin) {
        return ApiResponse.error(res, 'Forbidden: You cannot cancel this booking', null, 403);
      }

      const cancelled = await BookingService.cancelBooking(id, req.user.id, req.body.cancellationReason);
      return ApiResponse.success(res, 'Booking cancelled and reserved inventory released successfully', cancelled);

    } catch (error) {
      console.error('[Cancel Booking Error]:', error);
      const status = error.statusCode || 500;
      return ApiResponse.error(res, error.message || 'Failed to cancel booking', null, status);
    }
  }
}

module.exports = BookingController;
