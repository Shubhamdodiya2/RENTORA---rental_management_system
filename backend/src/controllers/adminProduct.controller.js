/**
 * Super Admin Product Moderation & Catalog Controller
 */

const { Product, Category, VendorProfile, ProductImage, Inventory, AuditLog } = require('../models');
const ApiResponse = require('../utils/apiResponse');

class AdminProductController {
  /**
   * GET /api/v1/admin/products
   * Moderation Queue: list all products with approval status filters
   */
  static async getAllProducts(req, res) {
    const { approvalStatus, status, vendorId, categoryId, page = 1, limit = 20 } = req.query;

    const where = {};
    if (approvalStatus) where.approvalStatus = approvalStatus;
    if (status) where.status = status;
    if (vendorId) where.vendorId = vendorId;
    if (categoryId) where.categoryId = categoryId;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    try {
      const { count, rows } = await Product.findAndCountAll({
        where,
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
          { model: VendorProfile, as: 'vendor', attributes: ['id', 'businessName', 'city', 'businessEmail', 'verificationStatus'] },
          { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl', 'isPrimary'] },
          { model: Inventory, as: 'inventory', attributes: ['totalStock', 'availableStock', 'reservedStock', 'damagedStock'] }
        ],
        distinct: true,
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset
      });

      return ApiResponse.paginated(res, 'Admin product list retrieved successfully', rows, count, pageNum, limitNum);

    } catch (error) {
      console.error('[Admin Get Products Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch admin product list', error.message, 500);
    }
  }

  /**
   * PATCH /api/v1/admin/products/:id/approval
   * Approve or reject vendor product listing
   */
  static async updateApprovalStatus(req, res) {
    const { id } = req.params;
    const { approvalStatus, rejectionReason } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(approvalStatus)) {
      return ApiResponse.error(res, 'Invalid approvalStatus. Allowed values: Approved, Rejected, Pending', null, 400);
    }

    try {
      const product = await Product.findByPk(id, {
        include: [{ model: VendorProfile, as: 'vendor' }]
      });

      if (!product) {
        return ApiResponse.error(res, 'Product listing not found', null, 404);
      }

      product.approvalStatus = approvalStatus;

      // If approved and currently Draft or Inactive, set status to Active
      if (approvalStatus === 'Approved') {
        product.status = 'Active';
      }

      await product.save();

      // Log Moderation Action in Audit Log
      await AuditLog.create({
        adminName: req.user.fullName || 'SUPER_ADMIN',
        action: `PRODUCT_${approvalStatus.toUpperCase()}`,
        module: 'CATALOG',
        description: `Product '${product.name}' (ID: ${product.id}) was ${approvalStatus.toLowerCase()} by admin.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
        targetId: product.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return ApiResponse.success(res, `Product listing has been ${approvalStatus.toLowerCase()} successfully`, product);

    } catch (error) {
      console.error('[Admin Update Approval Status Error]:', error);
      return ApiResponse.error(res, 'Failed to update approval status', error.message, 500);
    }
  }

  /**
   * PATCH /api/v1/admin/products/:id/featured
   * Toggle homepage featured badge
   */
  static async toggleFeatured(req, res) {
    const { id } = req.params;
    const { isFeatured } = req.body;

    if (isFeatured === undefined) {
      return ApiResponse.error(res, 'isFeatured boolean field is required', null, 400);
    }

    try {
      const product = await Product.findByPk(id);
      if (!product) {
        return ApiResponse.error(res, 'Product not found', null, 404);
      }

      product.isFeatured = Boolean(isFeatured);
      await product.save();

      return ApiResponse.success(res, `Product featured status updated to ${Boolean(isFeatured)}`, product);

    } catch (error) {
      console.error('[Admin Toggle Featured Error]:', error);
      return ApiResponse.error(res, 'Failed to toggle featured status', error.message, 500);
    }
  }
}

module.exports = AdminProductController;
