const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { KYC_STATUSES } = require('../config/constants');

const CustomerProfile = sequelize.define('CustomerProfile', {
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
  address: {
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
  pincode: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  kycStatus: {
    type: DataTypes.ENUM(...KYC_STATUSES),
    defaultValue: 'Pending',
    allowNull: false
  },
  kycBadge: {
    type: DataTypes.STRING(100),
    defaultValue: 'Standard Member'
  },
  trustScore: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  }
}, {
  tableName: 'customer_profiles',
  indexes: [
    { fields: ['user_id'], unique: true },
    { fields: ['kyc_status'] },
    { fields: ['city'] }
  ]
});

module.exports = CustomerProfile;
