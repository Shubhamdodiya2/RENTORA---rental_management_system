/**
 * Super Admin Complaint & Support Tickets Controller
 */

const { Complaint, ComplaintMessage, User, Order, Booking } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const { Op } = require('sequelize');

class AdminComplaintController {
  /**
   * GET /api/v1/admin/complaints
   * List all complaints and tickets with status, priority, and keyword filters
   */
  static async getComplaints(req, res) {
    try {
      const { status, priority, userType, search, page = 1, limit = 20 } = req.query;
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const offset = (pageNum - 1) * limitNum;

      const where = {};
      if (status) where.status = status;
      if (priority) where.priority = priority;
      if (userType) where.userType = userType;
      if (search) {
        where[Op.or] = [
          { ticketNumber: { [Op.like]: `%${search}%` } },
          { subject: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: complaints } = await Complaint.findAndCountAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone'] },
          { model: User, as: 'assignedAdmin', attributes: ['id', 'fullName', 'email'] },
          { model: ComplaintMessage, as: 'messages', include: [{ model: User, as: 'sender', attributes: ['id', 'fullName'] }] }
        ],
        distinct: true,
        order: [['createdAt', 'DESC']],
        limit: limitNum,
        offset
      });

      return ApiResponse.paginated(res, 'Complaints retrieved successfully', complaints, count, pageNum, limitNum);
    } catch (error) {
      console.error('[Admin Get Complaints Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch complaints', error.message, 500);
    }
  }

  /**
   * POST /api/v1/admin/complaints
   * Create an administrative complaint or ticket
   */
  static async createComplaint(req, res) {
    try {
      const { userId, userType = 'Customer', subject, description, priority = 'Medium', relatedOrderId } = req.body;

      if (!subject || !description) {
        return ApiResponse.error(res, 'Subject and description are required', null, 400);
      }

      const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
      const targetUserId = userId || req.user.id;

      const complaint = await Complaint.create({
        ticketNumber,
        userId: targetUserId,
        userType,
        relatedOrderId: relatedOrderId || null,
        subject,
        description,
        priority,
        status: 'Open',
        assignedToAdminId: req.user.id
      });

      return ApiResponse.success(res, 'Support ticket created successfully', complaint, 201);
    } catch (error) {
      console.error('[Admin Create Complaint Error]:', error);
      return ApiResponse.error(res, 'Failed to create support ticket', error.message, 500);
    }
  }

  /**
   * PATCH /api/v1/admin/complaints/:id/status
   * Update complaint status and add resolution note
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, resolutionNote } = req.body;

      if (!['Open', 'In Progress', 'Waiting for Response', 'Resolved', 'Closed'].includes(status)) {
        return ApiResponse.error(res, 'Invalid status value', null, 400);
      }

      const complaint = await Complaint.findByPk(id);
      if (!complaint) {
        return ApiResponse.error(res, 'Complaint not found', null, 404);
      }

      complaint.status = status;
      if (resolutionNote) complaint.resolutionNote = resolutionNote;
      if (status === 'Resolved' || status === 'Closed') {
        complaint.resolvedAt = new Date();
      }
      complaint.assignedToAdminId = req.user.id;
      await complaint.save();

      return ApiResponse.success(res, `Complaint status updated to ${status}`, complaint);
    } catch (error) {
      console.error('[Admin Update Complaint Status Error]:', error);
      return ApiResponse.error(res, 'Failed to update complaint status', error.message, 500);
    }
  }

  /**
   * POST /api/v1/admin/complaints/:id/messages
   * Post response message to complaint thread
   */
  static async addMessage(req, res) {
    try {
      const { id } = req.params;
      const { message, attachments } = req.body;

      if (!message || !message.trim()) {
        return ApiResponse.error(res, 'Message text is required', null, 400);
      }

      const complaint = await Complaint.findByPk(id);
      if (!complaint) {
        return ApiResponse.error(res, 'Complaint not found', null, 404);
      }

      const newMsg = await ComplaintMessage.create({
        complaintId: id,
        senderId: req.user.id,
        senderRole: 'SUPER_ADMIN',
        message: message.trim(),
        attachments: attachments || null
      });

      if (complaint.status === 'Open') {
        complaint.status = 'In Progress';
        await complaint.save();
      }

      return ApiResponse.success(res, 'Response sent successfully', newMsg, 201);
    } catch (error) {
      console.error('[Admin Add Complaint Message Error]:', error);
      return ApiResponse.error(res, 'Failed to add message', error.message, 500);
    }
  }
}

module.exports = AdminComplaintController;
