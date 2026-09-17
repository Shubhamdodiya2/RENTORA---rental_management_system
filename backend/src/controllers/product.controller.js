/**
 * Public Product Catalog & Availability Controller
 */

const { Op } = require('sequelize');
const { 
  Product, 
  Category, 
  ProductImage, 
  ProductSpecification, 
  Inventory, 
  VendorProfile 
} = require('../models');
const ApiResponse = require('../utils/apiResponse');
const AvailabilityService = require('../services/availability.service');
const { 
  validateCatalogExploreQuery 
} = require('../validations/product.validation');
const { 
  validateDateRangeQuery, 
  validateMonthlyMatrixQuery 
} = require('../validations/availability.validation');

class ProductController {
  /**
   * Helper: Format public product object with unrated state
   */
  static formatProduct(product) {
    const json = product.toJSON ? product.toJSON() : product;
    const isUnrated = !json.reviewsCount || json.reviewsCount === 0;

    return {
      ...json,
      rating: isUnrated ? null : Number(json.rating),
      isUnrated,
      pricePerDay: Number(json.pricePerDay),
      discountPrice: json.discountPrice ? Number(json.discountPrice) : null,
      securityDeposit: Number(json.securityDeposit || 0),
      primaryImage: json.images && json.images.length > 0 
        ? (json.images.find(img => img.isPrimary) || json.images[0]).imageUrl 
        : null
    };
  }

  /**
   * GET /api/v1/products
   * Public Explore Catalog: search, filter, sort, paginate
   */
  static async getProducts(req, res) {
    const validation = validateCatalogExploreQuery(req.query);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Invalid query parameters', validation.errors, 400);
    }

    const { 
      search, 
      category, 
      city, 
      brand, 
      minPrice, 
      maxPrice, 
      minRating, 
      sort, 
      page, 
      limit 
    } = validation.sanitized;

    try {
      const where = {
        status: 'Active',
        approvalStatus: 'Approved'
      };

      // Search keyword across name, brand, description
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { brand: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      // Brand filter
      if (brand) {
        where.brand = brand;
      }

      // Category filter (match categoryId or Category.slug)
      const categoryInclude = {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug', 'iconName']
      };

      if (category) {
        categoryInclude.where = {
          [Op.or]: [
            { id: category },
            { slug: category }
          ]
        };
      }

      // Price filter
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.pricePerDay = {};
        if (minPrice !== undefined) where.pricePerDay[Op.gte] = minPrice;
        if (maxPrice !== undefined) where.pricePerDay[Op.lte] = maxPrice;
      }

      // Min Rating filter
      if (minRating !== undefined && minRating > 0) {
        where.rating = { [Op.gte]: minRating };
        where.reviewsCount = { [Op.gt]: 0 }; // Exclude unrated from rating filter
      }

      // Vendor City filter
      const vendorInclude = {
        model: VendorProfile,
        as: 'vendor',
        attributes: ['id', 'businessName', 'city', 'verificationStatus']
      };

      if (city) {
        vendorInclude.where = { city };
      }

      // Sort order
      let order = [['createdAt', 'DESC']];
      if (sort === 'popular') order = [['reviewsCount', 'DESC'], ['rating', 'DESC']];
      if (sort === 'price_asc') order = [['pricePerDay', 'ASC']];
      if (sort === 'price_desc') order = [['pricePerDay', 'DESC']];
      if (sort === 'newest') order = [['createdAt', 'DESC']];
      if (sort === 'rating') order = [['rating', 'DESC'], ['reviewsCount', 'DESC']];

      const offset = (page - 1) * limit;

      const { count, rows } = await Product.findAndCountAll({
        where,
        include: [
          categoryInclude,
          vendorInclude,
          {
            model: ProductImage,
            as: 'images',
            attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'displayOrder']
          },
          {
            model: Inventory,
            as: 'inventory',
            attributes: ['totalStock', 'availableStock', 'reservedStock', 'damagedStock']
          }
        ],
        distinct: true,
        order,
        limit,
        offset
      });

      const formattedProducts = rows.map(ProductController.formatProduct);
      const totalPages = Math.ceil(count / limit);

      return ApiResponse.paginated(res, 'Products retrieved successfully', formattedProducts, count, page, limit);

    } catch (error) {
      console.error('[Get Products Explore Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch products', error.message, 500);
    }
  }

  /**
   * GET /api/v1/products/featured
   * Public: Curated homepage featured products
   */
  static async getFeaturedProducts(req, res) {
    try {
      const products = await Product.findAll({
        where: {
          status: 'Active',
          approvalStatus: 'Approved',
          isFeatured: true
        },
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'iconName'] },
          { model: VendorProfile, as: 'vendor', attributes: ['id', 'businessName', 'city'] },
          { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl', 'isPrimary', 'displayOrder'] },
          { model: Inventory, as: 'inventory', attributes: ['totalStock', 'availableStock'] }
        ],
        limit: 8,
        order: [['reviewsCount', 'DESC'], ['rating', 'DESC']]
      });

      return ApiResponse.success(res, 'Featured products retrieved successfully', products.map(ProductController.formatProduct));
    } catch (error) {
      console.error('[Get Featured Products Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch featured products', error.message, 500);
    }
  }

  /**
   * GET /api/v1/products/:slugOrId
   * Public: Single product detail with specifications, images, inventory, vendor info
   */
  static async getProductDetail(req, res) {
    const { slugOrId } = req.params;

    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(slugOrId);

      const where = isUUID
        ? { id: slugOrId }
        : { slug: slugOrId };

      const product = await Product.findOne({
        where,
        include: [
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug', 'iconName', 'parentId'] },
          { 
            model: VendorProfile, 
            as: 'vendor', 
            attributes: ['id', 'businessName', 'businessCategory', 'city', 'verificationStatus'] 
          },
          { 
            model: ProductImage, 
            as: 'images', 
            attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'displayOrder'],
            order: [['displayOrder', 'ASC']]
          },
          { 
            model: ProductSpecification, 
            as: 'specifications', 
            attributes: ['id', 'specKey', 'specValue'] 
          },
          { 
            model: Inventory, 
            as: 'inventory', 
            attributes: ['totalStock', 'availableStock', 'reservedStock', 'damagedStock'] 
          }
        ]
      });

      if (!product) {
        return ApiResponse.error(res, 'Product listing not found', null, 404);
      }

      // If product is not Approved/Active, verify owner or Admin
      if (product.status !== 'Active' || product.approvalStatus !== 'Approved') {
        const isSuperAdmin = req.roles && req.roles.includes('SUPER_ADMIN');
        const isOwner = req.vendorProfile && req.vendorProfile.id === product.vendorId;
        if (!isSuperAdmin && !isOwner) {
          return ApiResponse.error(res, 'This product listing is not currently available to the public', null, 404);
        }
      }

      const formatted = ProductController.formatProduct(product);

      return ApiResponse.success(res, 'Product detail retrieved successfully', formatted);

    } catch (error) {
      console.error('[Get Product Detail Error]:', error);
      return ApiResponse.error(res, 'Failed to fetch product detail', error.message, 500);
    }
  }

  /**
   * GET /api/v1/products/:id/availability
   * Public Date Range & Monthly Availability Check
   */
  static async checkAvailability(req, res) {
    const { id } = req.params;

    // Check if client requested monthly matrix or specific date range
    if (req.query.month && req.query.year) {
      const validation = validateMonthlyMatrixQuery(req.query);
      if (!validation.isValid) {
        return ApiResponse.error(res, 'Invalid monthly matrix query', validation.errors, 400);
      }
      try {
        const matrix = await AvailabilityService.getMonthlyMatrix(id, validation.sanitized.year, validation.sanitized.month);
        return ApiResponse.success(res, 'Monthly availability matrix retrieved successfully', matrix);
      } catch (error) {
        const status = error.statusCode || 500;
        return ApiResponse.error(res, error.message || 'Failed to check monthly availability', error.details || null, status);
      }
    }

    // Date Range Availability Query
    const validation = validateDateRangeQuery(req.query);
    if (!validation.isValid) {
      return ApiResponse.error(res, 'Invalid date range query', validation.errors, 400);
    }

    const { startDate, endDate, quantity } = validation.sanitized;

    try {
      const result = await AvailabilityService.checkAvailability(id, startDate, endDate, quantity);
      return ApiResponse.success(res, 'Date availability verified successfully', result);
    } catch (error) {
      const status = error.statusCode || 500;
      return ApiResponse.error(res, error.message || 'Failed to check date availability', error.details || null, status);
    }
  }
}

module.exports = ProductController;
