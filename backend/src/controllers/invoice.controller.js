/**
 * Rentora Invoice Controller
 * Customer and Vendor Invoice Management & HTML Print Engine
 */

const InvoiceService = require('../services/invoice.service');
const ApiResponse = require('../utils/apiResponse');
const { VendorProfile } = require('../models');

/**
 * Customer Retrieves Their Own Invoices
 */
async function getMyInvoices(req, res, next) {
  try {
    const result = await InvoiceService.getCustomerInvoices(req.user.id, req.query);
    return ApiResponse.success(res, 'Customer invoices retrieved successfully', result.invoices, 200, result.pagination);
  } catch (error) {
    next(error);
  }
}

/**
 * Vendor Retrieves Invoices for their Store Bookings
 */
async function getVendorInvoices(req, res, next) {
  try {
    let vendorId = req.user.vendorProfile ? req.user.vendorProfile.id : null;
    if (!vendorId) {
      const vendorProf = await VendorProfile.findOne({ where: { userId: req.user.id } });
      if (vendorProf) vendorId = vendorProf.id;
    }

    if (!vendorId) {
      const err = new Error('Vendor profile not found for this account');
      err.statusCode = 404;
      throw err;
    }

    const result = await InvoiceService.getVendorInvoices(vendorId, req.query);
    return ApiResponse.success(res, 'Vendor invoices retrieved successfully', result.invoices, 200, result.pagination);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Specific Invoice by ID (Protected with RBAC & Ownership)
 */
async function getInvoiceById(req, res, next) {
  try {
    const invoice = await InvoiceService.getInvoiceById(req.params.id, req.user);
    return ApiResponse.success(res, 'Invoice details retrieved successfully', invoice);
  } catch (error) {
    next(error);
  }
}

/**
 * Get Specific Invoice by Booking ID
 */
async function getInvoiceByBookingId(req, res, next) {
  try {
    const invoice = await InvoiceService.getInvoiceByBookingId(req.params.bookingId, req.user);
    return ApiResponse.success(res, 'Booking invoice retrieved successfully', invoice);
  } catch (error) {
    next(error);
  }
}

/**
 * Render and Stream Printable A4 HTML Invoice
 */
async function renderInvoiceHtml(req, res, next) {
  try {
    const html = await InvoiceService.renderInvoiceHtml(req.params.id, req.user);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (error) {
    next(error);
  }
}

/**
 * Idempotently Generate Invoice for Booking
 */
async function generateBookingInvoice(req, res, next) {
  try {
    const invoice = await InvoiceService.generateInvoiceForBooking(req.params.bookingId);
    return ApiResponse.success(res, 'Invoice generated successfully', invoice, 201);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMyInvoices,
  getVendorInvoices,
  getInvoiceById,
  getInvoiceByBookingId,
  renderInvoiceHtml,
  generateBookingInvoice
};
