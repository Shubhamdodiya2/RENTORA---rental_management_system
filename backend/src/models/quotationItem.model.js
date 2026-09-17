const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QuotationItem = sequelize.define('QuotationItem', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  quotationId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'quotations',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  productId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  durationDays: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    allowNull: false
  },
  unitRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  customRate: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'quotation_items',
  indexes: [
    { fields: ['quotation_id'] },
    { fields: ['product_id'] }
  ]
});

module.exports = QuotationItem;
