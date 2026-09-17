const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ComplaintMessage = sequelize.define('ComplaintMessage', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  complaintId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'complaints',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  senderId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  senderRole: {
    type: DataTypes.STRING(30),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachments: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'complaint_messages',
  updatedAt: false,
  indexes: [
    { fields: ['complaint_id'] },
    { fields: ['sender_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = ComplaintMessage;
