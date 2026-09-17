const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    unique: true,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  totalStock: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  availableStock: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  reservedStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  damagedStock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  minStockAlert: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  }
}, {
  tableName: 'inventories',
  indexes: [
    { fields: ['product_id'], unique: true },
    { fields: ['available_stock'] }
  ]
});

module.exports = Inventory;
