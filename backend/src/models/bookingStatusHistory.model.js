const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BookingStatusHistory = sequelize.define('BookingStatusHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  stepNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 8 }
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  performedBy: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'booking_status_histories',
  updatedAt: false,
  indexes: [
    { fields: ['booking_id'] },
    { fields: ['booking_id', 'step_number'] },
    { fields: ['created_at'] }
  ]
});

module.exports = BookingStatusHistory;
