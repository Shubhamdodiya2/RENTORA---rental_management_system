const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QualityInspection = sequelize.define('QualityInspection', {
  id: {
    type: DataTypes.CHAR(36),
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  returnId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    unique: true,
    references: {
      model: 'returns',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  bookingId: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'bookings',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  inspectedBy: {
    type: DataTypes.CHAR(36),
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'RESTRICT'
  },
  physicalCondition: {
    type: DataTypes.ENUM('Pristine', 'Minor Scratches', 'Damaged', 'Missing Parts'),
    defaultValue: 'Pristine',
    allowNull: false
  },
  checklistData: {
    type: DataTypes.JSON,
    allowNull: true
  },
  inspectionNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  damagePenalty: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  passed: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  }
}, {
  tableName: 'quality_inspections',
  indexes: [
    { fields: ['return_id'], unique: true },
    { fields: ['booking_id'] },
    { fields: ['inspected_by'] },
    { fields: ['passed'] }
  ]
});

module.exports = QualityInspection;
