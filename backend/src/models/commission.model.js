const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Commission = sequelize.define('Commission', {
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
  vendorId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'vendor_profiles',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  grossAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  commissionAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  vendorEarnings: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payoutStatus: {
    type: DataTypes.ENUM('Pending', 'Settled', 'Withheld'),
    defaultValue: 'Pending',
    allowNull: false
  },
  payoutDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'commissions',
  indexes: [
    { fields: ['order_id'], unique: true },
    { fields: ['vendor_id'] },
    { fields: ['payout_status'] }
  ]
});

module.exports = Commission;
