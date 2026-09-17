const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  recipientId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('ORDER', 'BOOKING', 'PAYMENT', 'QC', 'COMPLAINT', 'SYSTEM', 'APPROVAL'),
    defaultValue: 'SYSTEM',
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  actionUrl: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true
  }
}, {
  tableName: 'notifications',
  updatedAt: false,
  indexes: [
    { fields: ['recipient_id'] },
    { fields: ['recipient_id', 'is_read'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Notification;
