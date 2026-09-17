'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('inventories', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      product_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        unique: true,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      total_stock: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      available_stock: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      reserved_stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      damaged_stock: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      min_stock_alert: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
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

    await queryInterface.addIndex('inventories', ['product_id'], { unique: true });
    await queryInterface.addIndex('inventories', ['available_stock']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('inventories');
  }
};
