'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quotation_items', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      quotation_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'quotations',
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
      duration_days: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      unit_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      custom_rate: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
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

    await queryInterface.addIndex('quotation_items', ['quotation_id']);
    await queryInterface.addIndex('quotation_items', ['product_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('quotation_items');
  }
};
