/**
 * Customer & Vendor Support Tickets / Complaints Controller
 */

const { Complaint, ComplaintMessage, User, Notification } = require('../models');
const ApiResponse = require('../utils/apiResponse');

class ComplaintController {
  /**
   * POST /api/v1/complaints
   * Submit a new support ticket / complaint (Customer or Vendor)
   */
  static async createComplaint(req, res) {
    try {
      const { subject, description, priority = 'Medium', relatedOrderId } = req.body;

      if (!subject || !subject.trim() || !description || !description.trim()) {
        return ApiResponse.error(res, 'Subject and description are required', null, 400);
      }

      const isVendor = (req.roles || []).includes('VENDOR');
      const userType = isVendor ? 'Vendor' : 'Customer';
      const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

      const complaint = await Complaint.create({
        ticketNumber,
        userId: req.user.id,
        userType,
        relatedOrderId: relatedOrderId || null,
        subject: subject.trim(),
        description: description.trim(),
        priority,
        status: 'Open'
      });

      // Create initial thread message
      await ComplaintMessage.create({
        complaintId: complaint.id,
        senderId: req.user.id,
        senderRole: userType.toUpperCase(),
        message: description.trim()
      });

      // Create Admin Alert Notification
      await Notification.create({
        recipientId: 'sys-admin',
        title: `New Support Ticket ${ticketNumber}`,
        message: `${req.user.fullName} (${userType}) raised ticket: "${subject.trim()}"`,
        type: 'TICKET_RAISED',
        metadata: { ticketId: complaint.id, ticketNumber }
      }).catch(() => null);

      const ticketWithMessages = await Complaint.findByPk(complaint.id, {
        include: [
          { model: User, as: 'user', attributes: ['id', 'fullName', 'email', 'phone'] },
          { model: ComplaintMessage, as: 'messages', include: [{ model: User, as: 'sender', attributes: ['id', 'fullName'] }] }
        ]
      });

      return ApiResponse.success(res, 'Support ticket submitted successfully to Super Admin', ticketWithMessages, 201);
    } catch (error) {
      console.error('[Create Complaint Error]:', error);
      return ApiResponse.error(res, 'Failed to submit support ticket', error.message, 500);
    }
  }

  /**
   * GET /api/v1/complaints/my
   * List support tickets raised by current Customer or Vendor
   */
  static async getMyComplaints(req, res) {
    try {
      const complaints = await Complaint.findAll({
        where: { userId: req.user.id },
        include: [
          { model: User, as: 'assignedAdmin', attributes: ['id', 'fullName', 'email'] },
          { 
            model: ComplaintMessage, 
            as: 'messages', 
            include: [{ model: User, as: 'sender', attributes: ['id', 'fullName'] }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return ApiResponse.success(res, 'Support tickets retrieved successfully', complaints);
    } catch (error) {
      console.error('[Get My Complaints Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch support tickets', error.message, 500);
    }
  }

  /**
   * POST /api/v1/complaints/:id/messages
   * Reply to a support ticket thread
   */
  static async addMessage(req, res) {
    try {
      const { id } = req.params;
      const { message } = req.body;

      if (!message || !message.trim()) {
        return ApiResponse.error(res, 'Message text is required', null, 400);
      }

      const complaint = await Complaint.findOne({
        where: { id, userId: req.user.id }
      });

      if (!complaint) {
        return ApiResponse.error(res, 'Support ticket not found', null, 404);
      }

      const isVendor = (req.roles || []).includes('VENDOR');
      const senderRole = isVendor ? 'VENDOR' : 'CUSTOMER';

      const newMsg = await ComplaintMessage.create({
        complaintId: id,
        senderId: req.user.id,
        senderRole,
        message: message.trim()
      });

      if (complaint.status === 'Resolved' || complaint.status === 'Closed') {
        complaint.status = 'Open';
        await complaint.save();
      }

      return ApiResponse.success(res, 'Reply posted successfully', newMsg, 201);
    } catch (error) {
      console.error('[Add Ticket Message Error]:', error);
      return ApiResponse.error(res, 'Failed to post reply', error.message, 500);
    }
  }
}

module.exports = ComplaintController;
