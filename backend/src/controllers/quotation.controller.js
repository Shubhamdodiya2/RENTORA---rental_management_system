/**
 * B2B Custom Quotation & Negotiation Controller
 */

const { Quotation, QuotationItem, Product, ProductImage, VendorProfile, User } = require('../models');
const QuotationService = require('../services/quotation.service');
const ApiResponse = require('../utils/apiResponse');
const { validateQuotationCreate, validateQuotationRespond } = require('../validations/quotation.validation');

class QuotationController {
  /**
   * POST /api/v1/quotations
   * Customer submits a custom quotation request for bulk/event rental
   */
  static async createQuotation(req, res) {
    const validation = validateQuotationCreate(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    try {
      const quotation = await QuotationService.createQuotation(req.user.id, req.body);
      return ApiResponse.success(res, 'Quotation request submitted to vendor successfully', quotation, 201);
    } catch (error) {
      console.error('[Create Quotation Error]:', error);
      const status = error.statusCode || 500;
      return ApiResponse.error(res, error.message || 'Failed to submit quotation request', null, status);
    }
  }

  /**
   * GET /api/v1/quotations
   * List quotations for the authenticated customer or vendor
   */
  static async getQuotations(req, res) {
    const isVendorUser = req.vendorProfile !== undefined && req.vendorProfile !== null;
    const where = isVendorUser
      ? { vendorId: req.vendorProfile.id }
      : { customerId: req.user.id };

    try {
      const quotations = await Quotation.findAll({
        where,
        include: [
          {
            model: QuotationItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'brand', 'pricePerDay', 'discountPrice'],
              include: [{ model: ProductImage, as: 'images', attributes: ['imageUrl', 'isPrimary'] }]
            }]
          },
          { model: VendorProfile, as: 'vendor', attributes: ['id', 'businessName', 'city', 'businessPhone', 'businessAddress'] },
          { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      return ApiResponse.success(res, 'Quotations retrieved successfully', {
        quotations,
        total: quotations.length
      });

    } catch (error) {
      console.error('[Get Quotations Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch quotations', error.message, 500);
    }
  }

  /**
   * GET /api/v1/quotations/:id
   * Get single quotation detail
   */
  static async getQuotationById(req, res) {
    const { id } = req.params;

    try {
      const quotation = await Quotation.findByPk(id, {
        include: [
          {
            model: QuotationItem,
            as: 'items',
            include: [{
              model: Product,
              as: 'product',
              include: [{ model: ProductImage, as: 'images', attributes: ['imageUrl', 'isPrimary'] }]
            }]
          },
          { model: VendorProfile, as: 'vendor' },
          { model: User, as: 'customer', attributes: ['id', 'fullName', 'email', 'phone'] }
        ]
      });

      if (!quotation) {
        return ApiResponse.error(res, 'Quotation not found', null, 404);
      }

      // Authorization check
      const isCustomer = quotation.customerId === req.user.id;
      const isVendor = req.vendorProfile && quotation.vendorId === req.vendorProfile.id;
      const isAdmin = req.roles && req.roles.includes('SUPER_ADMIN');

      if (!isCustomer && !isVendor && !isAdmin) {
        return ApiResponse.error(res, 'Forbidden: You do not have access to this quotation', null, 403);
      }

      return ApiResponse.success(res, 'Quotation detail retrieved successfully', quotation);

    } catch (error) {
      console.error('[Get Quotation Detail Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch quotation', error.message, 500);
    }
  }

  /**
   * PATCH /api/v1/quotations/:id/respond
   * Vendor responds with custom rates & quote offer
   */
  static async respondQuotation(req, res) {
    const { id } = req.params;
    const validation = validateQuotationRespond(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    if (!req.vendorProfile) {
      return ApiResponse.error(res, 'Vendor profile required to respond to quotations', null, 403);
    }

    try {
      const updated = await QuotationService.respondQuotation(id, req.vendorProfile.id, req.body);
      return ApiResponse.success(res, 'Quotation pricing response sent to customer successfully', updated);
    } catch (error) {
      console.error('[Respond Quotation Error]:', error);
      const status = error.statusCode || 500;
      return ApiResponse.error(res, error.message || 'Failed to submit quote response', null, status);
    }
  }

  /**
   * PATCH /api/v1/quotations/:id/accept
   * Customer accepts quote offer -> automatically creates official Booking
   */
  static async acceptQuotation(req, res) {
    const { id } = req.params;

    try {
      const result = await QuotationService.acceptQuotation(id, req.user.id);
      return ApiResponse.success(res, 'Quotation accepted and official rental booking created successfully', result);
    } catch (error) {
      console.error('[Accept Quotation Error]:', error);
      const status = error.statusCode || 500;
      return ApiResponse.error(res, error.message || 'Failed to accept quotation', null, status);
    }
  }

  /**
   * PATCH /api/v1/quotations/:id/reject
   * Reject quotation proposal
   */
  static async rejectQuotation(req, res) {
    const { id } = req.params;

    try {
      const quotation = await QuotationService.rejectQuotation(id, req.user.id);
      return ApiResponse.success(res, 'Quotation rejected successfully', quotation);
    } catch (error) {
      console.error('[Reject Quotation Error]:', error);
      const status = error.statusCode || 500;
      return ApiResponse.error(res, error.message || 'Failed to reject quotation', null, status);
    }
  }
}

module.exports = QuotationController;
