const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookingItem = sequelize.define('BookingItem', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  productId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  unitRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  depositPerUnit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'booking_items',
  indexes: [
    { fields: ['booking_id'] },
    { fields: ['product_id'] }
  ]
});

module.exports = BookingItem;
