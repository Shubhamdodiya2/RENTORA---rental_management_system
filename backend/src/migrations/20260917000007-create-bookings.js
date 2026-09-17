'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bookings', {
      id: {
        type: Sequelize.CHAR(36),
        primaryKey: true,
        allowNull: false
      },
      booking_number: {
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
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      duration_mode: {
        type: Sequelize.ENUM('hour', 'day', 'week', 'month', 'year'),
        defaultValue: 'day',
        allowNull: false
      },
      duration_count: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      pickup_time: {
        type: Sequelize.STRING(20),
        defaultValue: '10:00 AM'
      },
      return_time: {
        type: Sequelize.STRING(20),
        defaultValue: '06:00 PM'
      },
      delivery_type: {
        type: Sequelize.ENUM('doorstep', 'store_pickup'),
        defaultValue: 'doorstep',
        allowNull: false
      },
      delivery_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rental_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      deposit_amount: {
        type: Sequelize.DECIMAL(10, 2),
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
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0.00,
        allowNull: false
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      payment_plan: {
        type: Sequelize.ENUM('full', 'deposit_only', 'pay_on_delivery'),
        defaultValue: 'full',
        allowNull: false
      },
      current_step: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM(
          'BOOKING_CONFIRMED',
          'PRODUCT_RESERVED',
          'PICKUP_SCHEDULED',
          'PRODUCT_HANDED_OVER',
          'RENTAL_ACTIVE',
          'RETURN_SCHEDULED',
          'PRODUCT_RETURNED',
          'DEPOSIT_RELEASED',
          'CANCELLED',
          'DISPUTED'
        ),
        defaultValue: 'BOOKING_CONFIRMED',
        allowNull: false
      },
      rental_notes: {
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

    await queryInterface.addIndex('bookings', ['booking_number'], { unique: true });
    await queryInterface.addIndex('bookings', ['customer_id']);
    await queryInterface.addIndex('bookings', ['vendor_id']);
    await queryInterface.addIndex('bookings', ['status']);
    await queryInterface.addIndex('bookings', ['start_date', 'end_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('bookings');
  }
};
