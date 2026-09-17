const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
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
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  altText: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'product_images',
  indexes: [
    { fields: ['product_id'] },
    { fields: ['product_id', 'is_primary'] }
  ]
});

module.exports = ProductImage;
