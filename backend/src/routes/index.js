const express = require('express');
const router = express.Router();
const ApiResponse = require('../utils/apiResponse');
const { sequelize } = require('../models');

// Sub-routers
const authRoutes = require('./auth.routes');
const categoryRoutes = require('./category.routes');
const productRoutes = require('./product.routes');
const vendorProductRoutes = require('./vendorProduct.routes');
const adminRoutes = require('./admin.routes');
const bookingRoutes = require('./booking.routes');
const vendorBookingRoutes = require('./vendorBooking.routes');
const adminBookingRoutes = require('./adminBooking.routes');
const quotationRoutes = require('./quotation.routes');
const paymentRoutes = require('./payment.routes');
const adminPaymentRoutes = require('./adminPayment.routes');
const invoiceRoutes = require('./invoice.routes');
const adminInvoiceRoutes = require('./adminInvoice.routes');
const notificationRoutes = require('./notification.routes');
const complaintRoutes = require('./complaint.routes');

// Mount Sub-routers
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/vendor/products', vendorProductRoutes);
router.use('/admin', adminRoutes);
router.use('/bookings', bookingRoutes);
router.use('/vendor/bookings', vendorBookingRoutes);
router.use('/admin/bookings', adminBookingRoutes);
router.use('/quotations', quotationRoutes);
router.use('/payments', paymentRoutes);
router.use('/admin/payments', adminPaymentRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/admin/invoices', adminInvoiceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/complaints', complaintRoutes);

// System Health Check Endpoint
router.get('/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    return ApiResponse.success(res, 'Rentora API Server is healthy and connected to MySQL database', {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: 'Connected',
      version: '1.0.0'
    });
  } catch (error) {
    return ApiResponse.error(res, 'Database connection error', { db: error.message }, 503);
  }
});

module.exports = router;
