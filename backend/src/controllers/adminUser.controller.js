const { User, Role, CustomerProfile, VendorProfile, AuditLog, Booking, Order, Product } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const { ROLES } = require('../config/constants');
const { Op } = require('sequelize');

class AdminUserController {
  /**
   * GET /api/v1/admin/users
   * List platform users with pagination & role filtering
   */
  static async getUsers(req, res) {
    try {
      const { page = 1, limit = 20, search, role } = req.query;
      const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { fullName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ];
      }

      const roleInclude = {
        model: Role,
        as: 'roles',
        through: { attributes: ['isActive'] }
      };

      if (role) {
        roleInclude.where = { name: role.toUpperCase() };
      }

      const { rows: users, count: total } = await User.findAndCountAll({
        where: whereClause,
        include: [
          roleInclude,
          { model: CustomerProfile, as: 'customerProfile' },
          { model: VendorProfile, as: 'vendorProfile' }
        ],
        distinct: true,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit, 10),
        offset
      });

      return ApiResponse.paginated(res, 'Users retrieved successfully', users, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total
      });
    } catch (error) {
      console.error('[Admin Get Users Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch users', error.message, 500);
    }
  }

  /**
   * PATCH /api/v1/admin/users/:id/status
   * Toggle active/inactive status of a user
   */
  static async updateUserStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== 'boolean') {
        return ApiResponse.error(res, 'isActive boolean field is required', null, 400);
      }

      const user = await User.findByPk(id, {
        include: [{ model: Role, as: 'roles' }]
      });

      if (!user) {
        return ApiResponse.error(res, 'User not found', null, 404);
      }

      // Prevent deactivating own Super Admin account
      if (user.id === req.user.id && !isActive) {
        return ApiResponse.error(res, 'You cannot deactivate your own administrative account', null, 400);
      }

      user.isActive = isActive;
      await user.save();

      // Log audit entry
      await AuditLog.create({
        adminId: req.user.id,
        adminName: req.user.fullName,
        action: isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
        module: 'USERS',
        targetId: user.id,
        targetType: 'User',
        details: { targetEmail: user.email, isActive },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return ApiResponse.success(res, `User account ${isActive ? 'activated' : 'deactivated'} successfully`, {
        user: user.toJSON()
      });
    } catch (error) {
      console.error('[Admin Update User Status Error]:', error);
      return ApiResponse.error(res, 'Failed to update user status', error.message, 500);
    }
  }

  /**
   * GET /api/v1/admin/vendors
   * List all vendor stores and their KYC verification status
   */
  static async getVendors(req, res) {
    try {
      const { page = 1, limit = 20, verificationStatus, search } = req.query;
      const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

      const whereClause = {};
      if (verificationStatus) {
        whereClause.verificationStatus = verificationStatus;
      }
      if (search) {
        whereClause[Op.or] = [
          { businessName: { [Op.like]: `%${search}%` } },
          { businessEmail: { [Op.like]: `%${search}%` } },
          { city: { [Op.like]: `%${search}%` } }
        ];
      }

      const { rows: vendors, count: total } = await VendorProfile.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'fullName', 'email', 'phone', 'isActive', 'createdAt']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit, 10),
        offset
      });

      return ApiResponse.paginated(res, 'Vendors retrieved successfully', vendors, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total
      });
    } catch (error) {
      console.error('[Admin Get Vendors Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch vendors', error.message, 500);
    }
  }

  /**
   * PATCH /api/v1/admin/vendors/:id/verification
   * Approve or reject vendor KYC
   */
  static async updateVendorVerification(req, res) {
    try {
      const { id } = req.params;
      const { verificationStatus, rejectionReason } = req.body;

      if (!['Approved', 'Rejected', 'Suspended'].includes(verificationStatus)) {
        return ApiResponse.error(res, 'verificationStatus must be Approved, Rejected, or Suspended', null, 400);
      }

      const vendor = await VendorProfile.findByPk(id, {
        include: [{ model: User, as: 'user' }]
      });

      if (!vendor) {
        return ApiResponse.error(res, 'Vendor profile not found', null, 404);
      }

      vendor.verificationStatus = verificationStatus;
      if (verificationStatus === 'Approved') {
        vendor.approvedBy = req.user.id;
        vendor.approvedAt = new Date();
      }
      await vendor.save();

      // Log audit
      await AuditLog.create({
        adminId: req.user.id,
        adminName: req.user.fullName,
        action: `VENDOR_${verificationStatus.toUpperCase()}`,
        module: 'VENDORS',
        targetId: vendor.id,
        targetType: 'VendorProfile',
        details: {
          businessName: vendor.businessName,
          verificationStatus,
          rejectionReason: rejectionReason || null
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });

      return ApiResponse.success(res, `Vendor status updated to ${verificationStatus}`, { vendor });
    } catch (error) {
      console.error('[Admin Update Vendor Status Error]:', error);
      return ApiResponse.error(res, 'Failed to update vendor status', error.message, 500);
    }
  }

  /**
   * GET /api/v1/admin/audit-logs
   * View immutable platform audit log trail
   */
  static async getAuditLogs(req, res) {
    try {
      const { page = 1, limit = 20, module: mod, action } = req.query;
      const offset = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);

      const whereClause = {};
      if (mod) whereClause.module = mod.toUpperCase();
      if (action) whereClause.action = { [Op.like]: `%${action}%` };

      const { rows: logs, count: total } = await AuditLog.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit, 10),
        offset
      });

      return ApiResponse.paginated(res, 'Audit logs retrieved successfully', logs, {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total
      });
    } catch (error) {
      console.error('[Admin Get Audit Logs Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch audit logs', error.message, 500);
    }
  }

  /**
   * GET /api/v1/admin/stats
   * Dashboard KPI statistics
   */
  static async getAdminStats(req, res) {
    try {
      const [totalUsers, totalVendors, totalProducts, totalBookings] = await Promise.all([
        User.count(),
        VendorProfile.count(),
        Product.count(),
        Booking.count()
      ]);

      return ApiResponse.success(res, 'Admin stats retrieved successfully', {
        totalUsers,
        totalVendors,
        totalProducts,
        totalBookings
      });
    } catch (error) {
      console.error('[Admin Stats Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch admin statistics', error.message, 500);
    }
  }
}

module.exports = AdminUserController;
