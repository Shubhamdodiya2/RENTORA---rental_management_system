/**
 * Category Controller (Public Tree & Admin Management)
 */

const { Category, Product } = require('../models');
const ApiResponse = require('../utils/apiResponse');
const { slugify } = require('../utils/slugify');
const { validateCategoryCreate, validateCategoryUpdate } = require('../validations/category.validation');

class CategoryController {
  /**
   * GET /api/v1/categories
   * Public: Hierarchical category tree with active product counts
   */
  static async getCategories(req, res) {
    try {
      const allCategories = await Category.findAll({
        where: { isActive: true },
        order: [['displayOrder', 'ASC'], ['name', 'ASC']]
      });

      // Count active approved products per category
      const productCounts = await Product.count({
        where: { status: 'Active', approvalStatus: 'Approved' },
        group: ['categoryId']
      });

      const countMap = {};
      for (const item of productCounts) {
        countMap[item.categoryId] = item.count;
      }

      // Build parent -> children hierarchical tree
      const categoryMap = {};
      const rootCategories = [];

      for (const cat of allCategories) {
        const catJson = cat.toJSON();
        catJson.activeProductsCount = countMap[cat.id] || 0;
        catJson.subcategories = [];
        categoryMap[cat.id] = catJson;
      }

      for (const cat of allCategories) {
        if (cat.parentId && categoryMap[cat.parentId]) {
          categoryMap[cat.parentId].subcategories.push(categoryMap[cat.id]);
        } else {
          rootCategories.push(categoryMap[cat.id]);
        }
      }

      return ApiResponse.success(res, 'Categories retrieved successfully', {
        categories: rootCategories,
        total: rootCategories.length
      });

    } catch (error) {
      console.error('[Get Categories Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch categories', error.message, 500);
    }
  }

  /**
   * GET /api/v1/categories/:slug
   * Public: Single category details
   */
  static async getCategoryBySlug(req, res) {
    try {
      const { slug } = req.params;
      const category = await Category.findOne({
        where: { slug, isActive: true },
        include: [{ model: Category, as: 'subcategories', where: { isActive: true }, required: false }]
      });

      if (!category) {
        return ApiResponse.error(res, 'Category not found', null, 404);
      }

      const activeProductsCount = await Product.count({
        where: { categoryId: category.id, status: 'Active', approvalStatus: 'Approved' }
      });

      const data = category.toJSON();
      data.activeProductsCount = activeProductsCount;

      return ApiResponse.success(res, 'Category retrieved successfully', data);

    } catch (error) {
      console.error('[Get Category By Slug Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch category detail', error.message, 500);
    }
  }

  /**
   * POST /api/v1/admin/categories
   * Super Admin: Create new category or subcategory
   */
  static async createCategory(req, res) {
    const validation = validateCategoryCreate(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    const { name, iconName, description, bgImage, parentId, displayOrder } = req.body;

    try {
      let slug = slugify(name);
      let existingSlug = await Category.findOne({ where: { slug } });
      let counter = 1;
      while (existingSlug) {
        slug = `${slugify(name)}-${counter++}`;
        existingSlug = await Category.findOne({ where: { slug } });
      }

      const id = slug; // Consistent clean ID for category

      if (parentId) {
        const parent = await Category.findByPk(parentId);
        if (!parent) {
          return ApiResponse.error(res, 'Parent category does not exist', null, 400);
        }
      }

      const category = await Category.create({
        id,
        name: name.trim(),
        slug,
        iconName: iconName || 'Package',
        description: description || null,
        bgImage: bgImage || null,
        parentId: parentId || null,
        displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
        isActive: true
      });

      return ApiResponse.success(res, 'Category created successfully', category, 201);

    } catch (error) {
      console.error('[Create Category Error]:', error);
      return ApiResponse.error(res, 'Failed to create category', error.message, 500);
    }
  }

  /**
   * PUT /api/v1/admin/categories/:id
   * Super Admin: Update category
   */
  static async updateCategory(req, res) {
    const validation = validateCategoryUpdate(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    const { id } = req.params;
    const { name, iconName, description, bgImage, parentId, displayOrder, isActive } = req.body;

    try {
      const category = await Category.findByPk(id);
      if (!category) {
        return ApiResponse.error(res, 'Category not found', null, 404);
      }

      if (name && name.trim() !== category.name) {
        category.name = name.trim();
        let slug = slugify(name);
        const existingSlug = await Category.findOne({ where: { slug } });
        if (existingSlug && existingSlug.id !== category.id) {
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
        category.slug = slug;
      }

      if (iconName !== undefined) category.iconName = iconName;
      if (description !== undefined) category.description = description;
      if (bgImage !== undefined) category.bgImage = bgImage;
      if (parentId !== undefined) category.parentId = parentId;
      if (displayOrder !== undefined) category.displayOrder = Number(displayOrder);
      if (isActive !== undefined) category.isActive = Boolean(isActive);

      await category.save();

      return ApiResponse.success(res, 'Category updated successfully', category);

    } catch (error) {
      console.error('[Update Category Error]:', error);
      return ApiResponse.error(res, 'Failed to update category', error.message, 500);
    }
  }

  /**
   * DELETE /api/v1/admin/categories/:id
   * Super Admin: Deactivate or soft-delete category
   */
  static async deleteCategory(req, res) {
    const { id } = req.params;
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        return ApiResponse.error(res, 'Category not found', null, 404);
      }

      // Check if products exist in category
      const activeProducts = await Product.count({ where: { categoryId: id } });
      if (activeProducts > 0) {
        category.isActive = false;
        await category.save();
        return ApiResponse.success(res, 'Category has active products and was deactivated rather than deleted', { deactivated: true });
      }

      await category.destroy();
      return ApiResponse.success(res, 'Category deleted successfully');

    } catch (error) {
      console.error('[Delete Category Error]:', error);
      return ApiResponse.error(res, 'Failed to delete category', error.message, 500);
    }
  }
}

module.exports = CategoryController;
