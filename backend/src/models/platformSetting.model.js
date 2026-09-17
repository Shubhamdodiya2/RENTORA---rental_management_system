const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PlatformSetting = sequelize.define('PlatformSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  settingGroup: {
    type: DataTypes.ENUM('general', 'commission', 'tax', 'orderPolicy', 'vendorPolicy', 'security'),
    allowNull: false
  },
  settingKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  settingValue: {
    type: DataTypes.JSON,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  }
}, {
  tableName: 'platform_settings',
  indexes: [
    { fields: ['setting_key'], unique: true },
    { fields: ['setting_group'] }
  ]
});

module.exports = PlatformSetting;
