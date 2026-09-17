const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Return = sequelize.define('Return', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  returnNumber: {
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
  requestedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  actualReturnDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Requested', 'Scheduled', 'Received', 'Inspected', 'Completed', 'Disputed'),
    defaultValue: 'Requested',
    allowNull: false
  }
}, {
  tableName: 'returns',
  indexes: [
    { fields: ['return_number'], unique: true },
    { fields: ['booking_id'], unique: true },
    { fields: ['status'] },
    { fields: ['requested_date'] }
  ]
});

module.exports = Return;
