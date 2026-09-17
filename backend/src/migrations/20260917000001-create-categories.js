'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.STRING(50),
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      icon_name: {
        type: Sequelize.STRING(50),
        defaultValue: 'Package'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      bg_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      parent_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        references: {
          model: 'categories',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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

    await queryInterface.addIndex('categories', ['slug'], { unique: true });
    await queryInterface.addIndex('categories', ['parent_id']);
    await queryInterface.addIndex('categories', ['is_active']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('categories');
  }
};
