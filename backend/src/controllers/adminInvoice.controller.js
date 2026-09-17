/**
 * Rentora Super Admin Invoice & Financial Statement Controller
 */

const InvoiceService = require('../services/invoice.service');
const ApiResponse = require('../utils/apiResponse');

/**
 * Super Admin Lists All Invoices across Platform with Filters
 */
async function listAllInvoices(req, res, next) {
  try {
    const result = await InvoiceService.getAllInvoices(req.query);
    return ApiResponse.success(res, 'All platform invoices retrieved successfully', result.invoices, 200, result.pagination);
  } catch (error) {
    next(error);
  }
}

/**
 * Super Admin Gets Detailed Invoice by ID
 */
async function getAdminInvoiceById(req, res, next) {
  try {
    const invoice = await InvoiceService.getInvoiceById(req.params.id, req.user);
    return ApiResponse.success(res, 'Admin invoice details retrieved successfully', invoice);
  } catch (error) {
    next(error);
  }
}

/**
 * Super Admin Renders A4 HTML Invoice
 */
async function renderAdminInvoiceHtml(req, res, next) {
  try {
    const html = await InvoiceService.renderInvoiceHtml(req.params.id, req.user);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listAllInvoices,
  getAdminInvoiceById,
  renderAdminInvoiceHtml
};
