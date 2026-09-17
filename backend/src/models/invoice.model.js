const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoiceNumber: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
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
  depositAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Issued', 'Paid', 'Cancelled'),
    defaultValue: 'Paid',
    allowNull: false
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  issuedDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'invoices',
  indexes: [
    { fields: ['invoice_number'], unique: true },
    { fields: ['order_id'], unique: true },
    { fields: ['customer_id'] },
    { fields: ['vendor_id'] },
    { fields: ['status'] }
  ]
});

module.exports = Invoice;
