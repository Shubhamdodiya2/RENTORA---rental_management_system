'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventory_transactions', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      productId: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      delta_quantity: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      previous_stock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      new_stock: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      transaction_type: {
        type: Sequelize.ENUM(
          'STOCK_ADDED',
          'STOCK_REMOVED',
          'STOCK_RESERVED',
          'STOCK_RELEASED',
          'DAMAGED',
          'RETURNED',
          'ADJUSTED'
        ),
        allowNull: false
      },
      reason: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      performed_by: {
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

    await queryInterface.addIndex('inventory_transactions', ['product_id']);
    await queryInterface.addIndex('inventory_transactions', ['transaction_type']);
    await queryInterface.addIndex('inventory_transactions', ['created_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventory_transactions');
  }
};
