const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { BOOKING_STATUSES, DURATION_MODES, DELIVERY_TYPES, PAYMENT_PLANS } = require('../config/constants');

const Booking = sequelize.define('Booking', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  bookingNumber: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
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
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  durationMode: {
    type: DataTypes.ENUM(...DURATION_MODES),
    defaultValue: 'day',
    allowNull: false
  },
  durationCount: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  pickupTime: {
    type: DataTypes.STRING(20),
    defaultValue: '10:00 AM'
  },
  returnTime: {
    type: DataTypes.STRING(20),
    defaultValue: '06:00 PM'
  },
  deliveryType: {
    type: DataTypes.ENUM(...DELIVERY_TYPES),
    defaultValue: 'doorstep',
    allowNull: false
  },
  deliveryAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rentalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
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
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentPlan: {
    type: DataTypes.ENUM(...PAYMENT_PLANS),
    defaultValue: 'full',
    allowNull: false
  },
  currentStep: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false,
    validate: { min: 1, max: 8 }
  },
  status: {
    type: DataTypes.ENUM(...BOOKING_STATUSES),
    defaultValue: 'BOOKING_CONFIRMED',
    allowNull: false
  },
  rentalNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'bookings',
  indexes: [
    { fields: ['booking_number'], unique: true },
    { fields: ['customer_id'] },
    { fields: ['vendor_id'] },
    { fields: ['status'] },
    { fields: ['start_date', 'end_date'] }
  ]
});

module.exports = Booking;
