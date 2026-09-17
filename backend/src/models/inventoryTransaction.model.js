const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { INVENTORY_TRANSACTIONS } = require('../config/constants');

const InventoryTransaction = sequelize.define('InventoryTransaction', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  deltaQuantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  previousStock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  newStock: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  transactionType: {
    type: DataTypes.ENUM(...INVENTORY_TRANSACTIONS),
    allowNull: false
  },
  reason: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  performedBy: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'inventory_transactions',
  indexes: [
    { fields: ['product_id'] },
    { fields: ['transaction_type'] },
    { fields: ['created_at'] }
  ]
});

module.exports = InventoryTransaction;
