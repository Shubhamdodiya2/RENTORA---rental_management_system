/**
 * Public Category Routes
 */

const express = require('express');
const CategoryController = require('../controllers/category.controller');

const router = express.Router();

// GET /api/v1/categories - Hierarchical category tree
router.get('/', CategoryController.getCategories);

// GET /api/v1/categories/:slug - Single category detail
router.get('/:slug', CategoryController.getCategoryBySlug);

module.exports = router;
