const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { APPROVAL_STATUSES } = require('../config/constants');

const VendorDocument = sequelize.define('VendorDocument', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  vendorId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'vendor_profiles',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  documentType: {
    type: DataTypes.ENUM('GST_CERTIFICATE', 'PAN_CARD', 'SHOP_ESTABLISHMENT', 'AADHAAR', 'OTHER'),
    allowNull: false
  },
  fileUrl: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM(...APPROVAL_STATUSES),
    defaultValue: 'Pending',
    allowNull: false
  },
  reviewedBy: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  reviewNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'vendor_documents',
  indexes: [
    { fields: ['vendor_id'] },
    { fields: ['document_type'] },
    { fields: ['status'] }
  ]
});

module.exports = VendorDocument;
