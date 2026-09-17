const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RefreshToken = sequelize.define('RefreshToken', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  tokenHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isRevoked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
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
  tableName: 'refresh_tokens',
  indexes: [
    { fields: ['token_hash'], unique: true },
    { fields: ['user_id'] },
    { fields: ['expires_at'] },
    { fields: ['is_revoked'] }
  ]
});

module.exports = RefreshToken;
