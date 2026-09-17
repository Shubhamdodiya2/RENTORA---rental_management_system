const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RentalAgreement = sequelize.define('RentalAgreement', {
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
  termsContent: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  isSigned: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  signedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  signatureHash: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  pdfUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'rental_agreements',
  indexes: [
    { fields: ['order_id'], unique: true },
    { fields: ['customer_id'] },
    { fields: ['vendor_id'] }
  ]
});

module.exports = RentalAgreement;
