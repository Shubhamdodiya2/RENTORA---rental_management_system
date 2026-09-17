'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_specifications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      product_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      spec_key: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      spec_value: {
        type: Sequelize.STRING(255),
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

    await queryInterface.addIndex('product_specifications', ['product_id']);
    await queryInterface.addIndex('product_specifications', ['product_id', 'spec_key']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_specifications');
  }
};
