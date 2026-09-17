const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { ESCROW_STATUSES } = require('../config/constants');

const EscrowDeposit = sequelize.define('EscrowDeposit', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    unique: true,
    references: {
      model: 'orders',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  bookingId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    unique: true,
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
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  penaltyDeductions: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  refundedAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(...ESCROW_STATUSES),
    defaultValue: 'Held',
    allowNull: false
  },
  releasedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  releaseReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'escrow_deposits',
  indexes: [
    { fields: ['order_id'], unique: true },
    { fields: ['booking_id'], unique: true },
    { fields: ['customer_id'] },
    { fields: ['vendor_id'] },
    { fields: ['status'] }
  ]
});

module.exports = EscrowDeposit;
