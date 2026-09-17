const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductSpecification = sequelize.define('ProductSpecification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
  specKey: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  specValue: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'product_specifications',
  indexes: [
    { fields: ['product_id'] },
    { fields: ['product_id', 'spec_key'] }
  ]
});

module.exports = ProductSpecification;
