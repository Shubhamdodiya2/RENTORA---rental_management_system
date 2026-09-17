const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { PAYMENT_SUBMISSION_STATUSES, PAYMENT_METHODS } = require('../config/constants');

const PaymentSubmission = sequelize.define('PaymentSubmission', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'orders',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  bookingId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'id'
    },
    onDelete: 'CASCADE'
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
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM(...PAYMENT_METHODS),
    defaultValue: 'UPI_MANUAL',
    allowNull: false
  },
  utrNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  payerUpiId: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  payerName: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  proofFileUrl: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  proofFileOriginalName: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  proofFileMimeType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  proofFileSize: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  verificationStatus: {
    type: DataTypes.ENUM(...PAYMENT_SUBMISSION_STATUSES),
    defaultValue: 'Pending',
    allowNull: false
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
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customerNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'payment_submissions',
  indexes: [
    { fields: ['utr_number'], unique: true },
    { fields: ['order_id'] },
    { fields: ['booking_id'] },
    { fields: ['customer_id'] },
    { fields: ['vendor_id'] },
    { fields: ['verification_status'] }
  ]
});

module.exports = PaymentSubmission;
