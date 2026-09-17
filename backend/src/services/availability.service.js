/**
 * Rentora Date-Based Inventory Availability Engine
 */

const { Op } = require('sequelize');
const { Inventory, Booking, BookingItem } = require('../models');

// Canonical list of statuses that hold / occupy physical inventory units
const BLOCKING_BOOKING_STATUSES = [
  'BOOKING_CONFIRMED',
  'PRODUCT_RESERVED',
  'PICKUP_SCHEDULED',
  'PRODUCT_HANDED_OVER',
  'RENTAL_ACTIVE',
  'RETURN_SCHEDULED',
  'DISPUTED'
];

class AvailabilityService {
  /**
   * Helper: Generate an array of YYYY-MM-DD date strings between start and end (inclusive)
   */
  static getDateRangeArray(startDateStr, endDateStr) {
    const dates = [];
    const current = new Date(`${startDateStr}T00:00:00Z`);
    const end = new Date(`${endDateStr}T00:00:00Z`);

    while (current <= end) {
      dates.push(current.toISOString().split('T')[0]);
      current.setUTCDate(current.getUTCDate() + 1);
    }
    return dates;
  }

  /**
   * Calculate exact available stock for a product across a specific date window
   * Inclusive on both startDate and endDate.
   */
  static async checkAvailability(productId, startDateStr, endDateStr, requestedQty = 1, options = {}) {
    const transaction = options.transaction || null;

    // 1. Fetch real-time Inventory snapshot
    const inventory = await Inventory.findOne({
      where: { productId },
      transaction
    });

    if (!inventory) {
      const error = new Error('Inventory record not found for product');
      error.statusCode = 404;
      throw error;
    }

    const { totalStock, damagedStock } = inventory;
    const netPhysicalCapacity = Math.max(0, totalStock - damagedStock);

    if (netPhysicalCapacity === 0) {
      return {
        productId,
        startDate: startDateStr,
        endDate: endDateStr,
        totalStock,
        damagedStock,
        maxBooked: 0,
        availableStock: 0,
        isAvailable: false,
        shortage: requestedQty,
        dailyBreakdown: []
      };
    }

    // 2. Fetch all overlapping active bookings for this product
    // Overlap condition: booking.startDate <= queryEndDate AND booking.endDate >= queryStartDate
    const overlappingItems = await BookingItem.findAll({
      where: { productId },
      include: [{
        model: Booking,
        as: 'booking',
        where: {
          status: { [Op.in]: BLOCKING_BOOKING_STATUSES },
          startDate: { [Op.lte]: endDateStr },
          endDate: { [Op.gte]: startDateStr }
        },
        attributes: ['id', 'startDate', 'endDate', 'status']
      }],
      transaction
    });

    // 3. Build day-by-day histogram for the requested window
    const dateList = this.getDateRangeArray(startDateStr, endDateStr);
    const dayWiseBooked = {};
    for (const d of dateList) {
      dayWiseBooked[d] = 0;
    }

    for (const item of overlappingItems) {
      const b = item.booking;
      if (!b) continue;

      const bStart = b.startDate;
      const bEnd = b.endDate;
      const qty = item.quantity || 1;

      for (const d of dateList) {
        if (d >= bStart && d <= bEnd) {
          dayWiseBooked[d] += qty;
        }
      }
    }

    let maxBooked = 0;
    const dailyBreakdown = dateList.map((dateStr) => {
      const booked = dayWiseBooked[dateStr];
      if (booked > maxBooked) maxBooked = booked;
      const avail = Math.max(0, netPhysicalCapacity - booked);
      return {
        date: dateStr,
        totalStock,
        damagedStock,
        bookedQuantity: booked,
        availableStock: avail,
        isAvailable: avail >= requestedQty
      };
    });

    const availableStock = Math.max(0, netPhysicalCapacity - maxBooked);
    const isAvailable = availableStock >= requestedQty;

    return {
      productId,
      startDate: startDateStr,
      endDate: endDateStr,
      totalStock,
      damagedStock,
      maxBooked,
      availableStock,
      isAvailable,
      shortage: isAvailable ? 0 : Math.max(0, requestedQty - availableStock),
      dailyBreakdown
    };
  }

  /**
   * Generate monthly calendar availability matrix (day-by-day JSON)
   */
  static async getMonthlyMatrix(productId, year, month) {
    const formattedMonth = String(month).padStart(2, '0');
    const firstDayStr = `${year}-${formattedMonth}-01`;

    // Last day of month
    const lastDayNum = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const lastDayStr = `${year}-${formattedMonth}-${String(lastDayNum).padStart(2, '0')}`;

    const result = await this.checkAvailability(productId, firstDayStr, lastDayStr, 1);

    return {
      productId,
      year,
      month,
      daysInMonth: lastDayNum,
      matrix: result.dailyBreakdown.map((day) => ({
        date: day.date,
        totalStock: day.totalStock,
        availableStock: day.availableStock,
        bookedQuantity: day.bookedQuantity,
        isAvailable: day.availableStock > 0
      }))
    };
  }

  /**
   * Validate if a vendor can safely reduce totalStock without breaking future bookings
   */
  static async validateStockReduction(productId, newTotalStock, options = {}) {
    const transaction = options.transaction || null;
    const todayStr = new Date().toISOString().split('T')[0];

    const inventory = await Inventory.findOne({ where: { productId }, transaction });
    if (!inventory) return { isAllowed: true, maxCommitted: 0, minAllowableStock: 0 };

    const damagedStock = inventory.damagedStock || 0;

    // Query all current and future active bookings
    const futureItems = await BookingItem.findAll({
      where: { productId },
      include: [{
        model: Booking,
        as: 'booking',
        where: {
          status: { [Op.in]: BLOCKING_BOOKING_STATUSES },
          endDate: { [Op.gte]: todayStr }
        },
        attributes: ['id', 'startDate', 'endDate', 'status']
      }],
      transaction
    });

    // Build timeline of peak concurrent bookings
    const dayDemand = {};
    for (const item of futureItems) {
      const b = item.booking;
      if (!b) continue;
      const start = b.startDate < todayStr ? todayStr : b.startDate;
      const end = b.endDate;
      const qty = item.quantity || 1;

      const range = this.getDateRangeArray(start, end);
      for (const d of range) {
        dayDemand[d] = (dayDemand[d] || 0) + qty;
      }
    }

    let maxFutureBooked = 0;
    for (const d in dayDemand) {
      if (dayDemand[d] > maxFutureBooked) {
        maxFutureBooked = dayDemand[d];
      }
    }

    const minAllowableStock = damagedStock + maxFutureBooked;
    const isAllowed = newTotalStock >= minAllowableStock;

    return {
      isAllowed,
      damagedStock,
      maxFutureBooked,
      minAllowableStock
    };
  }

  /**
   * Pessimistic row-locking reservation mutex
   * Acquires exclusive lock on Inventory row before checking date capacity
   */
  static async acquireReservationLockAndVerify(productId, startDateStr, endDateStr, quantity, transaction) {
    if (!transaction) {
      throw new Error('Database transaction is required for pessimistic reservation locking');
    }

    // 1. Lock the product inventory row using SELECT FOR UPDATE
    const inventory = await Inventory.findOne({
      where: { productId },
      lock: transaction.LOCK.UPDATE,
      transaction
    });

    if (!inventory) {
      const err = new Error('Product inventory not found');
      err.statusCode = 404;
      throw err;
    }

    // 2. Perform availability calculation under lock
    const check = await this.checkAvailability(productId, startDateStr, endDateStr, quantity, { transaction });

    if (!check.isAvailable) {
      const err = new Error(
        `Conflict: Insufficient inventory for product between ${startDateStr} and ${endDateStr}. Requested: ${quantity}, Available: ${check.availableStock}.`
      );
      err.statusCode = 409;
      err.details = {
        productId,
        requestedQuantity: quantity,
        availableStock: check.availableStock,
        shortage: check.shortage
      };
      throw err;
    }

    return {
      inventory,
      availableStock: check.availableStock
    };
  }
}

module.exports = AvailabilityService;
