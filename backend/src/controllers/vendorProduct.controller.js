/**
 * Vendor Product Management Controller
 */

const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { 
  sequelize, 
  Product, 
  Category, 
  ProductImage, 
  ProductSpecification, 
  Inventory, 
  InventoryTransaction 
} = require('../models');
const ApiResponse = require('../utils/apiResponse');
const { slugify } = require('../utils/slugify');
const { generateSku } = require('../utils/skuGenerator');
const AvailabilityService = require('../services/availability.service');
const { 
  validateProductCreate, 
  validateProductUpdate 
} = require('../validations/product.validation');

class VendorProductController {
  /**
   * Helper: Generate unique slug with automatic collision disambiguation
   */
  static async generateUniqueSlug(name) {
    const baseSlug = slugify(name);
    let candidate = baseSlug;
    let attempts = 0;

    while (attempts < 5) {
      const existing = await Product.findOne({ where: { slug: candidate } });
      if (!existing) return candidate;

      attempts++;
      candidate = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
    }
    return `${baseSlug}-${Date.now()}`;
  }

  /**
   * POST /api/v1/vendor/products
   * Create new product listing with specifications and initial inventory
   */
  static async createProduct(req, res) {
    const validation = validateProductCreate(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    const {
      name,
      categoryId,
      brand,
      description,
      pricePerHour,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      pricePerYear,
      discountPrice,
      securityDeposit,
      dimensions,
      weight,
      tags,
      stock = 1,
      minStockAlert = 1,
      specifications = [],
      images = [],
      status = 'Active'
    } = req.body;

    const vendorId = req.vendorProfile.id;

    // Verify Category exists (by ID or Slug)
    let category = await Category.findByPk(categoryId);
    if (!category && categoryId) {
      category = await Category.findOne({ where: { slug: categoryId } });
    }
    if (!category) {
      category = await Category.findOne({ where: { isActive: true } });
    }
    const resolvedCategoryId = category ? category.id : categoryId;

    const slug = await VendorProductController.generateUniqueSlug(name);
    let sku = req.body.sku ? req.body.sku.trim().toUpperCase() : generateSku(category ? category.name : 'GEAR', brand || 'RENTORA', name);

    const t = await sequelize.transaction();

    try {
      // 1. Create Product
      const product = await Product.create({
        vendorId,
        categoryId: resolvedCategoryId,
        name: name.trim(),
        slug,
        sku,
        brand: brand ? brand.trim() : null,
        description: description ? description.trim() : null,
        pricePerHour: pricePerHour ? Number(pricePerHour) : null,
        pricePerDay: Number(pricePerDay),
        pricePerWeek: pricePerWeek ? Number(pricePerWeek) : null,
        pricePerMonth: pricePerMonth ? Number(pricePerMonth) : null,
        pricePerYear: pricePerYear ? Number(pricePerYear) : null,
        discountPrice: discountPrice ? Number(discountPrice) : null,
        securityDeposit: Number(securityDeposit || 0),
        dimensions: dimensions || null,
        weight: weight || null,
        tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(s => s.trim()).filter(Boolean) : null),
        status: status === 'Draft' ? 'Draft' : 'Active',
        approvalStatus: req.body.approvalStatus || 'Approved',
        rating: 0.00,
        reviewsCount: 0,
        isFeatured: false
      }, { transaction: t });

      // 2. Create Initial Inventory Record
      const totalStockNum = Number(stock);
      await Inventory.create({
        productId: product.id,
        totalStock: totalStockNum,
        availableStock: totalStockNum,
        reservedStock: 0,
        damagedStock: 0,
        minStockAlert: Number(minStockAlert)
      }, { transaction: t });

      // 3. Record Inventory Audit Transaction
      await InventoryTransaction.create({
        productId: product.id,
        deltaQuantity: totalStockNum,
        previousStock: 0,
        newStock: totalStockNum,
        transactionType: 'STOCK_ADDED',
        reason: 'Initial stock creation for new product listing',
        performedBy: req.user.id
      }, { transaction: t });

      // 4. Save Technical Specifications
      if (Array.isArray(specifications) && specifications.length > 0) {
        const specRows = specifications.map(spec => ({
          productId: product.id,
          specKey: String(spec.specKey || spec.key || '').trim(),
          specValue: String(spec.specValue || spec.value || '').trim()
        })).filter(s => s.specKey && s.specValue);

        if (specRows.length > 0) {
          await ProductSpecification.bulkCreate(specRows, { transaction: t });
        }
      } else if (typeof specifications === 'object' && specifications !== null) {
        const specRows = Object.entries(specifications).map(([key, val]) => ({
          productId: product.id,
          specKey: key.trim(),
          specValue: String(val).trim()
        })).filter(s => s.specKey && s.specValue);

        if (specRows.length > 0) {
          await ProductSpecification.bulkCreate(specRows, { transaction: t });
        }
      }

      // 5. Save Initial Image URLs if provided
      if (Array.isArray(images) && images.length > 0) {
        const imgRows = images.map((img, idx) => {
          const url = typeof img === 'string' ? img : img.imageUrl;
          return {
            productId: product.id,
            imageUrl: url,
            altText: typeof img === 'object' && img.altText ? img.altText : `${name} photo ${idx + 1}`,
            isPrimary: idx === 0,
            displayOrder: idx
          };
        }).filter(i => i.imageUrl);

        if (imgRows.length > 0) {
          await ProductImage.bulkCreate(imgRows, { transaction: t });
        }
      }

      await t.commit();

      // Reload created product with associations
      const createdProduct = await Product.findByPk(product.id, {
        include: [
          { model: Category, as: 'category' },
          { model: ProductSpecification, as: 'specifications' },
          { model: ProductImage, as: 'images' },
          { model: Inventory, as: 'inventory' }
        ]
      });

      return ApiResponse.success(
        res,
        'Product listing created successfully! Submitted to Super Admin for approval.',
        createdProduct,
        201
      );

    } catch (error) {
      if (!t.finished) await t.rollback();
      console.error('[Create Product Error]:', error);
      return ApiResponse.error(res, 'Failed to create product listing', error.message, 500);
    }
  }

  /**
   * GET /api/v1/vendor/products
   * List all products belonging to the logged-in vendor
   */
  static async getVendorProducts(req, res) {
    try {
      const vendorId = req.vendorProfile.id;

      const products = await Product.findAll({
        where: {
          vendorId,
          status: { [Op.ne]: 'Archived' }
        },
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'iconName'] },
          { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'displayOrder'] },
          { model: Inventory, as: 'inventory', attributes: ['totalStock', 'availableStock', 'reservedStock', 'damagedStock', 'minStockAlert'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      return ApiResponse.success(res, 'Vendor products retrieved successfully', {
        products,
        total: products.length
      });

    } catch (error) {
      console.error('[Get Vendor Products Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch vendor products', error.message, 500);
    }
  }

  /**
   * POST /api/v1/vendor/products/upload-image
   * Upload single image file for product creation / preview
   */
  static async uploadSingleImage(req, res) {
    try {
      const file = req.file;
      if (!file) {
        return ApiResponse.error(res, 'No image file uploaded', null, 400);
      }

      const imageUrl = `/uploads/products/${file.filename}`;
      return ApiResponse.success(res, 'Image uploaded successfully', { imageUrl, filename: file.filename }, 201);
    } catch (error) {
      console.error('[Upload Single Image Error]:', error);
      return ApiResponse.error(res, 'Failed to upload image', error.message, 500);
    }
  }

  /**
   * GET /api/v1/vendor/products/:id
   * Get single vendor product for edit view
   */
  static async getVendorProductById(req, res) {
    try {
      const product = await Product.findByPk(req.params.id, {
        include: [
          { model: Category, as: 'category' },
          { model: ProductImage, as: 'images', order: [['displayOrder', 'ASC']] },
          { model: ProductSpecification, as: 'specifications' },
          { model: Inventory, as: 'inventory' }
        ]
      });

      return ApiResponse.success(res, 'Vendor product retrieved successfully', product);
    } catch (error) {
      return ApiResponse.error(res, 'Failed to fetch product detail', error.message, 500);
    }
  }

  /**
   * PUT /api/v1/vendor/products/:id
   * Update product metadata, rates, specifications
   */
  static async updateProduct(req, res) {
    const validation = validateProductUpdate(req.body);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Validation failed', validation.errors, 400);
    }

    const product = req.product; // Attached by requireProductOwnership middleware
    const {
      name,
      categoryId,
      brand,
      description,
      pricePerHour,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      pricePerYear,
      discountPrice,
      securityDeposit,
      dimensions,
      weight,
      tags,
      status,
      specifications
    } = req.body;

    const t = await sequelize.transaction();

    try {
      if (name && name.trim() !== product.name) product.name = name.trim();
      if (categoryId && categoryId !== product.categoryId) {
        let cat = await Category.findByPk(categoryId);
        if (!cat && categoryId) {
          cat = await Category.findOne({ where: { slug: categoryId } });
        }
        if (cat) {
          product.categoryId = cat.id;
        }
      }

      if (brand !== undefined) product.brand = brand ? brand.trim() : null;
      if (description !== undefined) product.description = description ? description.trim() : null;
      if (pricePerHour !== undefined) product.pricePerHour = pricePerHour ? Number(pricePerHour) : null;
      if (pricePerDay !== undefined) product.pricePerDay = Number(pricePerDay);
      if (pricePerWeek !== undefined) product.pricePerWeek = pricePerWeek ? Number(pricePerWeek) : null;
      if (pricePerMonth !== undefined) product.pricePerMonth = pricePerMonth ? Number(pricePerMonth) : null;
      if (pricePerYear !== undefined) product.pricePerYear = pricePerYear ? Number(pricePerYear) : null;
      if (discountPrice !== undefined) product.discountPrice = discountPrice ? Number(discountPrice) : null;
      if (securityDeposit !== undefined) product.securityDeposit = Number(securityDeposit);
      if (dimensions !== undefined) product.dimensions = dimensions;
      if (weight !== undefined) product.weight = weight;
      if (tags !== undefined) {
        product.tags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(s => s.trim()).filter(Boolean) : null);
      }
      if (status !== undefined) product.status = status;

      await product.save({ transaction: t });

      // Update Specifications if provided
      if (specifications !== undefined) {
        await ProductSpecification.destroy({ where: { productId: product.id }, transaction: t });

        if (Array.isArray(specifications) && specifications.length > 0) {
          const specRows = specifications.map(spec => ({
            productId: product.id,
            specKey: String(spec.specKey || spec.key || '').trim(),
            specValue: String(spec.specValue || spec.value || '').trim()
          })).filter(s => s.specKey && s.specValue);

          if (specRows.length > 0) {
            await ProductSpecification.bulkCreate(specRows, { transaction: t });
          }
        }
      }

      // Update Images if provided
      const inputImages = req.body.images || (req.body.image ? [req.body.image] : null);
      if (inputImages && Array.isArray(inputImages) && inputImages.length > 0) {
        await ProductImage.destroy({ where: { productId: product.id }, transaction: t });
        const imgRows = inputImages.map((imgUrl, idx) => ({
          productId: product.id,
          imageUrl: typeof imgUrl === 'string' ? imgUrl : (imgUrl?.imageUrl || imgUrl?.url),
          isPrimary: idx === 0,
          displayOrder: idx
        })).filter(img => img.imageUrl);
        if (imgRows.length > 0) {
          await ProductImage.bulkCreate(imgRows, { transaction: t });
        }
      }

      await t.commit();

      const updated = await Product.findByPk(product.id, {
        include: [
          { model: Category, as: 'category' },
          { model: ProductSpecification, as: 'specifications' },
          { model: ProductImage, as: 'images' },
          { model: Inventory, as: 'inventory' }
        ]
      });

      return ApiResponse.success(res, 'Product updated successfully', updated);

    } catch (error) {
      if (!t.finished) await t.rollback();
      console.error('[Update Product Error]:', error);
      return ApiResponse.error(res, 'Failed to update product', error.message, 500);
    }
  }

  /**
   * DELETE /api/v1/vendor/products/:id
   * Soft-delete / Archive product
   */
  static async deleteProduct(req, res) {
    try {
      const product = req.product;
      product.status = 'Archived';
      await product.save();

      return ApiResponse.success(res, 'Product listing archived successfully');
    } catch (error) {
      return ApiResponse.error(res, 'Failed to archive product', error.message, 500);
    }
  }

  /**
   * POST /api/v1/vendor/products/:id/images
   * Upload multi-part image files
   */
  static async uploadImages(req, res) {
    try {
      const product = req.product;
      const files = req.files || [];

      if (files.length === 0) {
        return ApiResponse.error(res, 'No image files uploaded', null, 400);
      }

      const existingImagesCount = await ProductImage.count({ where: { productId: product.id } });
      const hasPrimary = await ProductImage.findOne({ where: { productId: product.id, isPrimary: true } });

      const imageRows = files.map((file, idx) => {
        const imageUrl = `/uploads/products/${file.filename}`;
        const isPrimary = !hasPrimary && idx === 0 && existingImagesCount === 0;
        return {
          productId: product.id,
          imageUrl,
          altText: `${product.name} photo`,
          isPrimary,
          displayOrder: existingImagesCount + idx
        };
      });

      const savedImages = await ProductImage.bulkCreate(imageRows);

      return ApiResponse.success(res, 'Images uploaded successfully', savedImages, 201);

    } catch (error) {
      console.error('[Upload Images Error]:', error);
      return ApiResponse.error(res, 'Failed to upload images', error.message, 500);
    }
  }

  /**
   * DELETE /api/v1/vendor/products/:id/images/:imageId
   * Delete single image with primary promotion fallback
   */
  static async deleteImage(req, res) {
    const { id, imageId } = req.params;

    const t = await sequelize.transaction();

    try {
      const image = await ProductImage.findOne({
        where: { id: imageId, productId: id },
        transaction: t
      });

      if (!image) {
        await t.rollback();
        return ApiResponse.error(res, 'Image record not found', null, 404);
      }

      const wasPrimary = image.isPrimary;
      const filePath = path.resolve(__dirname, '../../', image.imageUrl.replace(/^\//, ''));

      await image.destroy({ transaction: t });

      // If deleted image was primary, promote next lowest displayOrder image
      if (wasPrimary) {
        const nextPrimary = await ProductImage.findOne({
          where: { productId: id },
          order: [['displayOrder', 'ASC'], ['createdAt', 'ASC']],
          transaction: t
        });

        if (nextPrimary) {
          nextPrimary.isPrimary = true;
          await nextPrimary.save({ transaction: t });
        }
      }

      await t.commit();

      // Delete file from disk safely
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }

      return ApiResponse.success(res, 'Image deleted successfully');

    } catch (error) {
      if (!t.finished) await t.rollback();
      console.error('[Delete Image Error]:', error);
      return ApiResponse.error(res, 'Failed to delete image', error.message, 500);
    }
  }

  /**
   * PATCH /api/v1/vendor/products/:id/images/:imageId/primary
   * Atomically designate single primary image
   */
  static async setPrimaryImage(req, res) {
    const { id, imageId } = req.params;

    const t = await sequelize.transaction();

    try {
      const targetImage = await ProductImage.findOne({
        where: { id: imageId, productId: id },
        transaction: t
      });

      if (!targetImage) {
        await t.rollback();
        return ApiResponse.error(res, 'Image not found for this product', null, 404);
      }

      // Reset all images for this product to isPrimary = false
      await ProductImage.update(
        { isPrimary: false },
        { where: { productId: id }, transaction: t }
      );

      // Set target to primary
      targetImage.isPrimary = true;
      await targetImage.save({ transaction: t });

      await t.commit();

      return ApiResponse.success(res, 'Primary image updated successfully', targetImage);

    } catch (error) {
      if (!t.finished) await t.rollback();
      console.error('[Set Primary Image Error]:', error);
      return ApiResponse.error(res, 'Failed to set primary image', error.message, 500);
    }
  }

  /**
   * PATCH /api/v1/vendor/products/:id/inventory
   * Adjust total stock or minimum alert threshold with future commitment safety check
   */
  static async updateInventory(req, res) {
    const { totalStock, minStockAlert } = req.body;
    const product = req.product;

    if (totalStock === undefined && minStockAlert === undefined) {
      return ApiResponse.error(res, 'totalStock or minStockAlert is required', null, 400);
    }

    const t = await sequelize.transaction();

    try {
      const inventory = await Inventory.findOne({
        where: { productId: product.id },
        lock: t.LOCK.UPDATE,
        transaction: t
      });

      if (!inventory) {
        await t.rollback();
        return ApiResponse.error(res, 'Inventory record not found', null, 404);
      }

      if (totalStock !== undefined) {
        const newTotal = parseInt(totalStock, 10);
        if (isNaN(newTotal) || newTotal < 1) {
          await t.rollback();
          return ApiResponse.error(res, 'totalStock must be an integer of at least 1', null, 400);
        }

        // Validate stock reduction against future active bookings
        if (newTotal < inventory.totalStock) {
          const reductionCheck = await AvailabilityService.validateStockReduction(product.id, newTotal, { transaction: t });
          if (!reductionCheck.isAllowed) {
            await t.rollback();
            return ApiResponse.error(
              res,
              `Cannot reduce total stock to ${newTotal}. You have ${reductionCheck.maxFutureBooked} units committed in future bookings and ${reductionCheck.damagedStock} damaged units. Minimum allowable stock is ${reductionCheck.minAllowableStock}.`,
              reductionCheck,
              409
            );
          }
        }

        const delta = newTotal - inventory.totalStock;
        const prevTotal = inventory.totalStock;

        inventory.totalStock = newTotal;
        inventory.availableStock = Math.max(0, newTotal - inventory.reservedStock - inventory.damagedStock);
        await inventory.save({ transaction: t });

        // Record Audit Transaction
        await InventoryTransaction.create({
          productId: product.id,
          deltaQuantity: delta,
          previousStock: prevTotal,
          newStock: newTotal,
          transactionType: delta > 0 ? 'STOCK_ADDED' : 'STOCK_REMOVED',
          reason: `Manual inventory adjustment by vendor (${delta > 0 ? '+' : ''}${delta} units)`,
          performedBy: req.user.id
        }, { transaction: t });
      }

      if (minStockAlert !== undefined) {
        const newAlert = parseInt(minStockAlert, 10);
        if (isNaN(newAlert) || newAlert < 0) {
          await t.rollback();
          return ApiResponse.error(res, 'minStockAlert must be a non-negative integer', null, 400);
        }
        inventory.minStockAlert = newAlert;
        await inventory.save({ transaction: t });
      }

      await t.commit();

      return ApiResponse.success(res, 'Inventory updated successfully', inventory);

    } catch (error) {
      if (!t.finished) await t.rollback();
      console.error('[Update Inventory Error]:', error);
      return ApiResponse.error(res, 'Failed to update inventory', error.message, 500);
    }
  }
}

module.exports = VendorProductController;
