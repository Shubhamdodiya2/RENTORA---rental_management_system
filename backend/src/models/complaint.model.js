const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ticketNumber: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: true
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
  userType: {
    type: DataTypes.ENUM('Customer', 'Vendor'),
    allowNull: false
  },
  relatedOrderId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'orders',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Urgent'),
    defaultValue: 'Medium',
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Open', 'In Progress', 'Waiting for Response', 'Resolved', 'Closed'),
    defaultValue: 'Open',
    allowNull: false
  },
  assignedToAdminId: {
    type: DataTypes.CHAR(36),
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  resolutionNote: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'complaints',
  indexes: [
    { fields: ['ticket_number'], unique: true },
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['assigned_to_admin_id'] }
  ]
});

module.exports = Complaint;
