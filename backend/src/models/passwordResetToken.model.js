const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordResetToken = sequelize.define('PasswordResetToken', {
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
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  tableName: 'password_reset_tokens',
  updatedAt: false,
  indexes: [
    { fields: ['token_hash'], unique: true },
    { fields: ['user_id'] },
    { fields: ['expires_at'] },
    { fields: ['is_used'] }
  ]
});

module.exports = PasswordResetToken;
