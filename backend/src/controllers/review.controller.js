const { Review, Product, User, Booking } = require('../models');
const ApiResponse = require('../utils/apiResponse');

class ReviewController {
  /**
   * GET /api/v1/products/:productId/reviews
   * Get all reviews and rating breakdown for a product
   */
  static async getProductReviews(req, res) {
    try {
      const { productId } = req.params;

      const product = await Product.findByPk(productId);
      if (!product) {
        return ApiResponse.error(res, 'Product not found', null, 404);
      }

      // Ensure review table is synced in case of first run
      await Review.sync();

      const reviews = await Review.findAll({
        where: { productId },
        include: [
          {
            model: User,
            as: 'customer',
            attributes: ['id', 'fullName', 'avatarUrl']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      // Calculate rating breakdown
      const totalReviews = reviews.length;
      const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let sumRating = 0;

      reviews.forEach((r) => {
        const star = Math.min(5, Math.max(1, Math.round(r.rating)));
        breakdown[star] = (breakdown[star] || 0) + 1;
        sumRating += r.rating;
      });

      const averageRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : Number(product.rating || 5.0);

      // Percentage breakdown
      const breakdownPercentage = {
        5: totalReviews > 0 ? Math.round((breakdown[5] / totalReviews) * 100) : 0,
        4: totalReviews > 0 ? Math.round((breakdown[4] / totalReviews) * 100) : 0,
        3: totalReviews > 0 ? Math.round((breakdown[3] / totalReviews) * 100) : 0,
        2: totalReviews > 0 ? Math.round((breakdown[2] / totalReviews) * 100) : 0,
        1: totalReviews > 0 ? Math.round((breakdown[1] / totalReviews) * 100) : 0
      };

      return ApiResponse.success(res, 'Product reviews retrieved successfully', {
        reviews,
        summary: {
          averageRating,
          totalReviews,
          breakdown,
          breakdownPercentage
        }
      });
    } catch (error) {
      console.error('[Get Product Reviews Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch reviews', error.message, 500);
    }
  }

  /**
   * POST /api/v1/products/:productId/reviews
   * Customer submits a new review for a product
   */
  static async createProductReview(req, res) {
    try {
      const { productId } = req.params;
      const { rating, title, comment, bookingId } = req.body;
      const customerId = req.user.id;

      if (!rating || rating < 1 || rating > 5) {
        return ApiResponse.error(res, 'Please provide a valid rating between 1 and 5 stars', null, 400);
      }

      if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
        return ApiResponse.error(res, 'Review comment must be at least 3 characters long', null, 400);
      }

      const product = await Product.findByPk(productId);
      if (!product) {
        return ApiResponse.error(res, 'Product not found', null, 404);
      }

      // Check if user already reviewed this product
      await Review.sync();
      const existing = await Review.findOne({
        where: { productId, customerId }
      });

      if (existing) {
        // Update existing review
        existing.rating = Number(rating);
        if (title !== undefined) existing.title = title.trim();
        existing.comment = comment.trim();
        await existing.save();

        // Recalculate product rating
        await ReviewController.recalculateProductRating(productId);

        const updated = await Review.findByPk(existing.id, {
          include: [{ model: User, as: 'customer', attributes: ['id', 'fullName', 'avatarUrl'] }]
        });

        return ApiResponse.success(res, 'Your review has been updated successfully', updated);
      }

      // Verify if customer has rented this gear
      let isVerified = true;
      if (bookingId) {
        const booking = await Booking.findOne({
          where: { id: bookingId, customerId }
        });
        if (booking) isVerified = true;
      }

      const newReview = await Review.create({
        productId,
        customerId,
        bookingId: bookingId || null,
        rating: Number(rating),
        title: title ? title.trim() : '',
        comment: comment.trim(),
        isVerified,
        helpfulCount: 0
      });

      // Recalculate product rating & reviewsCount
      await ReviewController.recalculateProductRating(productId);

      const reviewWithUser = await Review.findByPk(newReview.id, {
        include: [{ model: User, as: 'customer', attributes: ['id', 'fullName', 'avatarUrl'] }]
      });

      return ApiResponse.success(res, 'Review submitted successfully! Thank you for your feedback.', reviewWithUser, 201);
    } catch (error) {
      console.error('[Create Review Error]:', error);
      return ApiResponse.error(res, 'Failed to submit review', error.message, 500);
    }
  }

  /**
   * Helper: Recalculate product's average rating and reviews count
   */
  static async recalculateProductRating(productId) {
    try {
      const allReviews = await Review.findAll({ where: { productId } });
      const total = allReviews.length;
      const sum = allReviews.reduce((acc, r) => acc + Number(r.rating), 0);
      const avg = total > 0 ? Number((sum / total).toFixed(2)) : 5.0;

      await Product.update(
        {
          rating: avg,
          reviewsCount: total
        },
        { where: { id: productId } }
      );
    } catch (err) {
      console.warn('[Recalculate Rating Error]:', err.message);
    }
  }

  /**
   * POST /api/v1/reviews/:id/helpful
   * Mark review as helpful (increment helpfulCount)
   */
  static async voteHelpful(req, res) {
    try {
      const { id } = req.params;
      const review = await Review.findByPk(id);
      if (!review) {
        return ApiResponse.error(res, 'Review not found', null, 404);
      }

      review.helpfulCount = (review.helpfulCount || 0) + 1;
      await review.save();

      return ApiResponse.success(res, 'Marked as helpful', { helpfulCount: review.helpfulCount });
    } catch (error) {
      console.error('[Vote Helpful Error]:', error);
      return ApiResponse.error(res, 'Failed to vote', error.message, 500);
    }
  }

  /**
   * GET /api/v1/reviews/my
   * Get all reviews submitted by the authenticated customer
   */
  static async getMyReviews(req, res) {
    try {
      const customerId = req.user.id;
      const reviews = await Review.findAll({
        where: { customerId },
        include: [
          {
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'brand', 'pricePerDay']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return ApiResponse.success(res, 'Your reviews retrieved successfully', reviews);
    } catch (error) {
      console.error('[Get My Reviews Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch your reviews', error.message, 500);
    }
  }
}

module.exports = ReviewController;
