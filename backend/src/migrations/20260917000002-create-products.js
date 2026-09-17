'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      vendor_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'vendor_profiles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      category_id: {
        type: Sequelize.STRING(50),
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onDelete: 'RESTRICT'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      sku: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      brand: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price_per_hour: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      price_per_day: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      price_per_week: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      price_per_month: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      price_per_year: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      discount_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      security_deposit: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      dimensions: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      weight: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      tags: {
        type: Sequelize.JSON,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('Draft', 'Active', 'Low Stock', 'Out of Stock', 'Inactive', 'Archived'),
        defaultValue: 'Active',
        allowNull: false
      },
      approval_status: {
        type: Sequelize.ENUM('Pending', 'Approved', 'Rejected'),
        defaultValue: 'Approved',
        allowNull: false
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      reviews_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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

    await queryInterface.addIndex('products', ['slug'], { unique: true });
    await queryInterface.addIndex('products', ['sku'], { unique: true });
    await queryInterface.addIndex('products', ['vendor_id', 'status']);
    await queryInterface.addIndex('products', ['category_id', 'status', 'approval_status']);
    await queryInterface.addIndex('products', ['is_featured', 'status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('products');
  }
};
