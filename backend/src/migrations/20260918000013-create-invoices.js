'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // If invoices table exists from initial schema, drop or update it safely
    const tables = await queryInterface.showAllTables();
    if (tables.includes('invoices')) {
      await queryInterface.dropTable('invoices');
    }

    await queryInterface.createTable('invoices', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      invoice_number: {
        type: Sequelize.STRING(30),
        allowNull: false,
        unique: true
      },
      booking_id: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: {
          model: 'bookings',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      order_id: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: {
          model: 'orders',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      quotation_id: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: {
          model: 'quotations',
          key: 'id'
        },
        onDelete: 'SET NULL'
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
      invoice_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      issued_date: {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      rental_days: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      rental_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      delivery_fee: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      insurance_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      additional_charges: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      taxable_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      cgst_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      sgst_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      igst_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      rental_total: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      deposit_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      amount_paid: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      remaining_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('DRAFT', 'ISSUED', 'PAYMENT_PENDING', 'PAID', 'PARTIALLY_PAID', 'CANCELLED', 'REFUNDED', 'REVISED'),
        defaultValue: 'ISSUED',
        allowNull: false
      },
      payment_status: {
        type: Sequelize.ENUM('Pending', 'Success', 'Failed', 'Refunded'),
        defaultValue: 'Pending',
        allowNull: false
      },
      payment_method: {
        type: Sequelize.STRING(50),
        defaultValue: 'UPI_MANUAL',
        allowNull: false
      },
      payment_reference: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      payment_verification_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      verified_by_admin_id: {
        type: Sequelize.CHAR(36),
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      customer_snapshot: {
        type: Sequelize.JSON,
        allowNull: true
      },
      vendor_snapshot: {
        type: Sequelize.JSON,
        allowNull: true
      },
      items_snapshot: {
        type: Sequelize.JSON,
        allowNull: true
      },
      pdf_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      terms: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex('invoices', ['invoice_number'], { unique: true });
    await queryInterface.addIndex('invoices', ['booking_id']);
    await queryInterface.addIndex('invoices', ['order_id']);
    await queryInterface.addIndex('invoices', ['customer_id']);
    await queryInterface.addIndex('invoices', ['vendor_id']);
    await queryInterface.addIndex('invoices', ['status']);
    await queryInterface.addIndex('invoices', ['payment_status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('invoices');
  }
};
