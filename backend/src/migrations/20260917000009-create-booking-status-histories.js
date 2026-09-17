'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('booking_status_histories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      booking_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'bookings',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      step_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      changed_by: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('booking_status_histories', ['booking_id']);
    await queryInterface.addIndex('booking_status_histories', ['booking_id', 'created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('booking_status_histories');
  }
};
