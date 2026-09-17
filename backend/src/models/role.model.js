const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { ROLES } = require('../config/constants');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.ENUM(ROLES.CUSTOMER, ROLES.VENDOR, ROLES.SUPER_ADMIN),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'roles',
  timestamps: false
});

module.exports = Role;
