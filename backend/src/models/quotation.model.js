const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Quotation = sequelize.define('Quotation', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quotationNumber: {
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
  eventDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  durationDays: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  validUntil: {
    type: DataTypes.DATEONLY,
    allowNull: true
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
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vendorNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Submitted', 'Reviewed', 'Quote_Sent', 'Sent', 'Accepted', 'Rejected', 'Expired'),
    defaultValue: 'Submitted',
    allowNull: false
  }
}, {
  tableName: 'quotations',
  indexes: [
    { fields: ['quotation_number'], unique: true },
    { fields: ['customer_id'] },
    { fields: ['vendor_id'] },
    { fields: ['status'] }
  ]
});

module.exports = Quotation;
