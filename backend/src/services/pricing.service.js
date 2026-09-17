/**
 * Master Pricing Calculation Service for Rentora
 * Strict backend-only pricing, tax, commission, and escrow calculations.
 */

class PricingService {
  /**
   * Calculate unit rate for a product based on duration mode
   * @param {object} product 
   * @param {string} durationMode 'hour' | 'day' | 'week' | 'month' | 'year'
   * @returns {number}
   */
  static getUnitRate(product, durationMode = 'day') {
    const dailyRate = Number(product.discountPrice !== null && product.discountPrice !== undefined ? product.discountPrice : product.pricePerDay) || 0;

    switch (durationMode) {
      case 'hour':
        return Number(product.pricePerHour) || Math.round(dailyRate / 8);
      case 'week':
        return Number(product.pricePerWeek) || (dailyRate * 5);
      case 'month':
        return Number(product.pricePerMonth) || (dailyRate * 18);
      case 'year':
        return Number(product.pricePerYear) || (dailyRate * 180);
      case 'day':
      default:
        return dailyRate;
    }
  }

  /**
   * Calculate full breakdown for a rental booking
   * @param {object} params
   * @param {Array} params.items - array of { product, quantity, durationMode, durationCount }
   * @param {string} params.deliveryType - 'doorstep' | 'store_pickup'
   * @param {number} params.deliveryFee - optional explicit delivery fee override
   * @param {number} params.discountAmount - coupon/promotional discount
   * @param {number} params.gstRate - GST percentage (default 18%)
   * @param {number} params.commissionRate - Platform commission percentage (default 10%)
   * @param {number} params.insuranceAmount - insurance fee
   * @param {number} params.insuranceRate - optional insurance rate percentage
   * @returns {object} complete financial calculation breakdown
   */
  static calculateBookingFinancials({
    items = [],
    deliveryType = 'doorstep',
    deliveryFee: customDeliveryFee,
    discountAmount = 0,
    gstRate = 18,
    commissionRate = 10,
    insuranceAmount: customInsuranceAmount,
    insuranceRate = 0
  }) {
    let itemSubtotal = 0;
    let totalDeposit = 0;
    const computedItems = [];

    for (const item of items) {
      const product = item.product || {};
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const durationCount = Math.max(1, Number(item.durationCount) || 1);
      const durationMode = item.durationMode || 'day';

      const unitRate = this.getUnitRate(product, durationMode);
      const subtotal = unitRate * durationCount * quantity;
      const depositPerUnit = Number(product.securityDeposit) || 0;
      const deposit = depositPerUnit * quantity;

      itemSubtotal += subtotal;
      totalDeposit += deposit;

      computedItems.push({
        productId: product.id,
        productName: product.name,
        quantity,
        durationMode,
        durationCount,
        unitRate,
        subtotal,
        depositPerUnit,
        deposit
      });
    }

    const deliveryFee = customDeliveryFee !== undefined
      ? Number(customDeliveryFee)
      : (deliveryType === 'doorstep' ? 199 : 0);

    const safeDiscount = Math.min(itemSubtotal, Math.max(0, Number(discountAmount) || 0));

    // Pure rental amount (item subtotal minus promotional discount)
    const pureRentalAmount = Number((itemSubtotal - safeDiscount).toFixed(2));

    let insuranceAmount = Number(customInsuranceAmount) || 0;
    if (insuranceRate > 0 && !customInsuranceAmount) {
      insuranceAmount = Math.round((pureRentalAmount * insuranceRate) * 100) / 100;
    }

    // Taxable rental amount (Pure Rental + Delivery Fee + Insurance Fee)
    const taxableRentalAmount = Number((pureRentalAmount + deliveryFee + insuranceAmount).toFixed(2));

    // GST Tax on rental service (18% on taxable subtotal)
    const taxAmount = Math.round((taxableRentalAmount * (gstRate / 100)) * 100) / 100;

    // Rental payment (taxable rental + GST)
    const rentalPaymentAmount = Number((taxableRentalAmount + taxAmount).toFixed(2));

    // Security deposit (held separately in Escrow, 0% tax, 0% commission)
    const escrowDepositAmount = totalDeposit;

    // Total payable by customer at checkout:
    // Exactly: pureRentalAmount + deliveryFee + insuranceAmount + taxAmount + escrowDepositAmount
    const totalCustomerPayable = Number((pureRentalAmount + deliveryFee + insuranceAmount + taxAmount + escrowDepositAmount).toFixed(2));

    // Platform commission and vendor earnings (calculated on pure rental amount)
    const platformCommissionAmount = Math.round((pureRentalAmount * (commissionRate / 100)) * 100) / 100;
    const vendorGrossEarnings = Number((pureRentalAmount - platformCommissionAmount).toFixed(2));

    return {
      items: computedItems,
      itemSubtotal,
      pureRentalAmount,
      discountAmount: safeDiscount,
      deliveryFee,
      insuranceAmount,
      taxableRentalAmount,
      gstRate,
      taxAmount,
      rentalPaymentAmount,
      escrowDepositAmount,
      totalCustomerPayable,
      platformCommissionAmount,
      commissionRate,
      vendorGrossEarnings
    };
  }
}

module.exports = PricingService;
