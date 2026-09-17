const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DamageReport = sequelize.define('DamageReport', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  inspectionId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    unique: true,
    references: {
      model: 'quality_inspections',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  reportedBy: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  damageDescription: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  estimatedRepairCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Pending_Review', 'Approved', 'Disputed', 'Waived'),
    defaultValue: 'Pending_Review',
    allowNull: false
  }
}, {
  tableName: 'damage_reports',
  indexes: [
    { fields: ['inspection_id'], unique: true },
    { fields: ['reported_by'] },
    { fields: ['status'] }
  ]
});

module.exports = DamageReport;
