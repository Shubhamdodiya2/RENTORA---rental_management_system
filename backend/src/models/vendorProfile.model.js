const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { encrypt, decrypt, maskAccountNumber } = require('../utils/crypto');
const { APPROVAL_STATUSES } = require('../config/constants');

const VendorProfile = sequelize.define('VendorProfile', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  businessName: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  businessCategory: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  gstNumber: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  businessEmail: {
    type: DataTypes.STRING(150),
    allowNull: true
  },
  businessPhone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  businessAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    defaultValue: 'Ahmedabad',
    allowNull: false
  },
  state: {
    type: DataTypes.STRING(100),
    defaultValue: 'Gujarat',
    allowNull: false
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  workingHours: {
    type: DataTypes.STRING(100),
    defaultValue: '09:00 AM - 08:00 PM'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // AES-256 Encrypted raw banking data
  bankAccountEncrypted: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'bank_account_encrypted'
  },
  // Masked safe metadata for display
  bankAccountMasked: {
    type: DataTypes.JSON,
    allowNull: true,
    field: 'bank_account_masked'
  },
  verificationStatus: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Suspended'),
    defaultValue: 'Pending',
    allowNull: false
  },
  rejectionReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10.00,
    allowNull: false
  },
  approvedBy: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  approvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'vendor_profiles',
  indexes: [
    { fields: ['user_id'], unique: true },
    { fields: ['verification_status'] },
    { fields: ['city'] },
    { fields: ['business_category'] }
  ]
});

// Custom helper methods for Bank data encryption
VendorProfile.prototype.setBankAccount = function(bankData) {
  if (!bankData) return;
  this.bankAccountEncrypted = encrypt(bankData);
  this.bankAccountMasked = {
    bankName: bankData.bankName || '',
    accountHolder: bankData.accountHolder || this.businessName,
    accountMasked: maskAccountNumber(bankData.accountNumber),
    ifscCode: bankData.ifscCode ? bankData.ifscCode.toUpperCase() : '',
    upiId: bankData.upiId || ''
  };
};

VendorProfile.prototype.getDecryptedBankAccount = function() {
  if (!this.bankAccountEncrypted) return null;
  return decrypt(this.bankAccountEncrypted);
};

module.exports = VendorProfile;
