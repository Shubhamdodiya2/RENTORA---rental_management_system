const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { PAYMENT_STATUSES } = require('../config/constants');

const RentalPayment = sequelize.define('RentalPayment', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  transactionId: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
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
  currency: {
    type: DataTypes.STRING(5),
    defaultValue: 'INR',
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('UPI', 'Card', 'NetBanking', 'Wallet', 'Mock'),
    defaultValue: 'Mock',
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM(...PAYMENT_STATUSES),
    defaultValue: 'Success',
    allowNull: false
  },
  gatewayResponse: {
    type: DataTypes.JSON,
    allowNull: true
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'rental_payments',
  indexes: [
    { fields: ['transaction_id'], unique: true },
    { fields: ['order_id'] },
    { fields: ['booking_id'] },
    { fields: ['customer_id'] },
    { fields: ['vendor_id'] },
    { fields: ['payment_status'] }
  ]
});

module.exports = RentalPayment;
