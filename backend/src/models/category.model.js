const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.STRING(50),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  iconName: {
    type: DataTypes.STRING(50),
    defaultValue: 'Package'
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  bgImage: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  parentId: {
    type: DataTypes.STRING(50),
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  displayOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'categories',
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['parent_id'] },
    { fields: ['is_active'] }
  ]
});

module.exports = Category;
