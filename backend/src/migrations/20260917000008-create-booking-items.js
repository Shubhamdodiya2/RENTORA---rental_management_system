'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('booking_items', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
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
      product_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'RESTRICT'
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      unit_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      deposit_per_unit: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
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

    await queryInterface.addIndex('booking_items', ['booking_id']);
    await queryInterface.addIndex('booking_items', ['product_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('booking_items');
  }
};
