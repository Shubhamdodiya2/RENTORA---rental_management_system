const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { PRODUCT_STATUSES, APPROVAL_STATUSES } = require('../config/constants');

const Product = sequelize.define('Product', {
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
  categoryId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  pricePerHour: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  pricePerDay: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  pricePerWeek: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  pricePerMonth: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  pricePerYear: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  discountPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  securityDeposit: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  dimensions: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  weight: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM(...PRODUCT_STATUSES),
    defaultValue: 'Active',
    allowNull: false
  },
  approvalStatus: {
    type: DataTypes.ENUM(...APPROVAL_STATUSES),
    defaultValue: 'Approved',
    allowNull: false
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 5.00,
    allowNull: false
  },
  reviewsCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  }
}, {
  tableName: 'products',
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['sku'], unique: true },
    { fields: ['vendor_id'] },
    { fields: ['category_id'] },
    { fields: ['status'] },
    { fields: ['approval_status'] },
    { fields: ['is_featured'] }
  ]
});

module.exports = Product;
