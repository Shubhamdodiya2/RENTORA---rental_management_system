'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('quotations', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      quotation_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      customer_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'RESTRICT'
      },
      vendor_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'vendor_profiles',
          key: 'id'
        },
        onDelete: 'RESTRICT'
      },
      event_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      duration_days: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      valid_until: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      deposit_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      vendor_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('Draft', 'Submitted', 'Reviewed', 'Quote_Sent', 'Sent', 'Accepted', 'Rejected', 'Expired'),
        defaultValue: 'Submitted',
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

    await queryInterface.addIndex('quotations', ['quotation_number'], { unique: true });
    await queryInterface.addIndex('quotations', ['customer_id']);
    await queryInterface.addIndex('quotations', ['vendor_id']);
    await queryInterface.addIndex('quotations', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('quotations');
  }
};
