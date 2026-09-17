const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Pickup = sequelize.define('Pickup', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  pickupNumber: {
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
  scheduledDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  timeSlot: {
    type: DataTypes.STRING(30),
    defaultValue: '10:00 AM - 12:00 PM'
  },
  pickupType: {
    type: DataTypes.ENUM('doorstep', 'store_pickup'),
    defaultValue: 'doorstep',
    allowNull: false
  },
  verificationCode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Scheduled', 'In_Progress', 'Completed', 'Failed'),
    defaultValue: 'Scheduled',
    allowNull: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'pickups',
  indexes: [
    { fields: ['pickup_number'], unique: true },
    { fields: ['booking_id'], unique: true },
    { fields: ['status'] },
    { fields: ['scheduled_date'] }
  ]
});

module.exports = Pickup;
