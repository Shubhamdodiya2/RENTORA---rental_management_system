'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payment_submissions', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      order_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        references: {
          model: 'orders',
          key: 'id'
        },
        onDelete: 'CASCADE'
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
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      payment_method: {
        type: Sequelize.ENUM('UPI_MANUAL', 'BANK_TRANSFER', 'RAZORPAY'),
        defaultValue: 'UPI_MANUAL',
        allowNull: false
      },
      utr_number: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      payer_upi_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      payer_name: {
        type: Sequelize.STRING(150),
        allowNull: true
      },
      proof_file_url: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      proof_file_original_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      proof_file_mime_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      proof_file_size: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      verification_status: {
        type: Sequelize.ENUM('Pending', 'Under_Review', 'Verified', 'Rejected'),
        defaultValue: 'Pending',
        allowNull: false
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
      verified_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      customer_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      admin_notes: {
        type: Sequelize.TEXT,
        allowNull: true
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

    await queryInterface.addIndex('payment_submissions', ['utr_number'], { unique: true });
    await queryInterface.addIndex('payment_submissions', ['order_id']);
    await queryInterface.addIndex('payment_submissions', ['booking_id']);
    await queryInterface.addIndex('payment_submissions', ['customer_id']);
    await queryInterface.addIndex('payment_submissions', ['vendor_id']);
    await queryInterface.addIndex('payment_submissions', ['verification_status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('payment_submissions');
  }
};
