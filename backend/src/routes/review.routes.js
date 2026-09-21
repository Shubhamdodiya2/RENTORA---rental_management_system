const express = require('express');
const ReviewController = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

// GET /api/v1/reviews/products/:productId - Public: get reviews for a product
router.get('/products/:productId', ReviewController.getProductReviews);

// POST /api/v1/reviews/products/:productId - Protected: authenticated customer submits review
router.post('/products/:productId', authenticate, ReviewController.createProductReview);

// POST /api/v1/reviews/:id/helpful - Upvote helpful
router.post('/:id/helpful', ReviewController.voteHelpful);

// GET /api/v1/reviews/my - Protected: customer views their own reviews
router.get('/my', authenticate, ReviewController.getMyReviews);

module.exports = router;
