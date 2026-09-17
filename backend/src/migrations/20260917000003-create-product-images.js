'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_images', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
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
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      alt_text: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      display_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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

    await queryInterface.addIndex('product_images', ['product_id']);
    await queryInterface.addIndex('product_images', ['product_id', 'is_primary']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('product_images');
  }
};
