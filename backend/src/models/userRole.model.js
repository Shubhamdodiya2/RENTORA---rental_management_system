const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserRole = sequelize.define('UserRole', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'roles',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'user_roles',
  indexes: [
    { fields: ['user_id', 'role_id'], unique: true },
    { fields: ['user_id'] },
    { fields: ['role_id'] }
  ]
});

module.exports = UserRole;
