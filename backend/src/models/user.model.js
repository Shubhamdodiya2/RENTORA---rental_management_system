const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(150),
    allowNull: false,
    unique: true,
    validate: { isEmail: true }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  avatarUrl: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  mustChangePassword: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  lockUntil: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  indexes: [
    { fields: ['email'], unique: true },
    { fields: ['phone'] },
    { fields: ['is_active'] }
  ]
});

// Sanitize user object to never leak passwordHash in responses
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.passwordHash;
  delete values.failedLoginAttempts;
  delete values.lockUntil;
  return values;
};

module.exports = User;
