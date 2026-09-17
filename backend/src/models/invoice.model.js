const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { INVOICE_STATUSES, PAYMENT_STATUSES } = require('../config/constants');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
  },
  bookingId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'bookings',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  orderId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  quotationId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'quotations',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  customerId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  vendorId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'vendor_profiles',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  invoiceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  issuedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  rentalDays: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  rentalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  insuranceAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  additionalCharges: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  taxableAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  cgstAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  sgstAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  igstAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  rentalTotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  remainingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(...INVOICE_STATUSES),
    defaultValue: 'ISSUED',
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM(...PAYMENT_STATUSES),
    defaultValue: 'Pending',
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    defaultValue: 'UPI_MANUAL',
    allowNull: false
  },
  paymentReference: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  paymentVerificationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verifiedByAdminId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  customerSnapshot: {
    type: DataTypes.JSON,
    allowNull: true
  },
  vendorSnapshot: {
    type: DataTypes.JSON,
    allowNull: true
  },
  itemsSnapshot: {
    type: DataTypes.JSON,
    allowNull: true
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  terms: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'invoices',
  indexes: [
    { fields: ['invoice_number'], unique: true },
    { fields: ['booking_id'] },
    { fields: ['order_id'] },
    { fields: ['customer_id'] },
    { fields: ['vendor_id'] },
    { fields: ['status'] },
    { fields: ['payment_status'] }
  ]
});

module.exports = Invoice;
