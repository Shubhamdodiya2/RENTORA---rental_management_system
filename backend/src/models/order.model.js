const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { ORDER_STATUSES, PAYMENT_STATUSES } = require('../config/constants');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderNumber: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
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
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  deliveryFee: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  orderStatus: {
    type: DataTypes.ENUM(...ORDER_STATUSES),
    defaultValue: 'Pending',
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM(...PAYMENT_STATUSES),
    defaultValue: 'Pending',
    allowNull: false
  }
}, {
  tableName: 'orders',
  indexes: [
    { fields: ['order_number'], unique: true },
    { fields: ['booking_id'], unique: true },
    { fields: ['customer_id'] },
    { fields: ['vendor_id'] },
    { fields: ['order_status'] },
    { fields: ['payment_status'] }
  ]
});

module.exports = Order;
