const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  adminId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  adminName: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  action: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  module: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  targetId: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  updatedAt: false,
  indexes: [
    { fields: ['admin_id'] },
    { fields: ['module'] },
    { fields: ['action'] },
    { fields: ['created_at'] }
  ]
});

module.exports = AuditLog;
