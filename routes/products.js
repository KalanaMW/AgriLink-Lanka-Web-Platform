const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Product = require('../models/Product');
const User = require('../models/User');
const { 
  protect, 
  authorizeFarmer, 
  authorizeBuyer, 
  authorizeAdmin,
  requireVerification,
  checkOwnership,
  optionalAuth
} = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public (with optional auth for personalized results)
router.get('/', [
  optionalAuth,
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn(['leafy-greens', 'root-vegetables', 'fruits', 'herbs', 'exotic-vegetables', 'organic-vegetables', 'other']),
  query('district').optional().trim().notEmpty(),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be a positive number'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be a positive number'),
  query('quality').optional().isIn(['A', 'B', 'C', 'Premium', 'Export-Quality']),
  query('exportReady').optional().isBoolean().withMessage('Export ready must be a boolean'),
  query('verified').optional().isBoolean().withMessage('Verified must be a boolean'),
  query('sortBy').optional().isIn(['price', 'harvestDate', 'createdAt', 'views']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const {
      page = 1,
      limit = 20,
      category,
      district,
      minPrice,
      maxPrice,
      quality,
      exportReady,
      verified,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'available' };

    if (category) filter.category = category;
    if (district) filter['location.district'] = { $regex: district, $options: 'i' };
    if (minPrice || maxPrice) {
      filter['pricing.pricePerUnit'] = {};
      if (minPrice) filter['pricing.pricePerUnit'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['pricing.pricePerUnit'].$lte = parseFloat(maxPrice);
    }
    if (quality) filter['quality.grade'] = quality;
    if (exportReady !== undefined) filter['exportDetails.isExportReady'] = exportReady === 'true';
    if (verified !== undefined) filter.isVerified = verified === 'true';

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get products with pagination
    const products = await Product.find(filter)
      .populate('farmer', 'firstName lastName phone address district')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Update view count for authenticated users
    if (req.user) {
      const productIds = products.map(p => p._id);
      await Product.updateMany(
        { _id: { $in: productIds } },
        { $inc: { views: 1 } }
      );
    }

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit),
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error while fetching products' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmer', 'firstName lastName phone address district businessDetails farmDetails')
      .populate('inquiries.buyer', 'firstName lastName email phone companyDetails');

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment view count
    product.views += 1;
    await product.save();

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Server error while fetching product' });
  }
});

// @route   POST /api/products
// @desc    Create a new product listing
// @access  Private (Farmers only)
router.post('/', [
  protect,
  authorizeFarmer,
  requireVerification,
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('category').isIn(['leafy-greens', 'root-vegetables', 'fruits', 'herbs', 'exotic-vegetables', 'organic-vegetables', 'other']).withMessage('Invalid category'),
  body('variety').trim().notEmpty().withMessage('Product variety is required'),
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
  body('quantity.available').isFloat({ min: 0 }).withMessage('Available quantity must be a positive number'),
  body('quantity.unit').isIn(['kg', 'tons', 'pieces', 'bundles', 'crates']).withMessage('Invalid quantity unit'),
  body('quantity.minimumOrder').isFloat({ min: 1 }).withMessage('Minimum order must be at least 1'),
  body('quality.grade').isIn(['A', 'B', 'C', 'Premium', 'Export-Quality']).withMessage('Invalid quality grade'),
  body('pricing.pricePerUnit').isFloat({ min: 0 }).withMessage('Price per unit must be a positive number'),
  body('pricing.currency').optional().isIn(['USD', 'EUR', 'LKR']).withMessage('Invalid currency'),
  body('harvest.harvestDate').isISO8601().withMessage('Invalid harvest date'),
  body('harvest.expiryDate').isISO8601().withMessage('Invalid expiry date'),
  body('harvest.storageConditions').trim().notEmpty().withMessage('Storage conditions are required'),
  body('location.farmLocation').trim().notEmpty().withMessage('Farm location is required'),
  body('location.district').trim().notEmpty().withMessage('District is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const productData = {
      ...req.body,
      farmer: req.user.id
    };

    // Set primary image if images are provided
    if (productData.images && productData.images.length > 0) {
      productData.images[0].isPrimary = true;
    }

    const product = new Product(productData);
    await product.save();

    // Populate farmer details for response
    await product.populate('farmer', 'firstName lastName phone address district');

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Server error while creating product' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Product owner or admin)
router.put('/:id', [
  protect,
  checkOwnership(Product, 'farmer'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }),
  body('category').optional().isIn(['leafy-greens', 'root-vegetables', 'fruits', 'herbs', 'exotic-vegetables', 'organic-vegetables', 'other']),
  body('variety').optional().trim().notEmpty(),
  body('description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('quantity.available').optional().isFloat({ min: 0 }),
  body('quantity.unit').optional().isIn(['kg', 'tons', 'pieces', 'bundles', 'crates']),
  body('quantity.minimumOrder').optional().isFloat({ min: 1 }),
  body('quality.grade').optional().isIn(['A', 'B', 'C', 'Premium', 'Export-Quality']),
  body('pricing.pricePerUnit').optional().isFloat({ min: 0 }),
  body('pricing.currency').optional().isIn(['USD', 'EUR', 'LKR']),
  body('harvest.harvestDate').optional().isISO8601(),
  body('harvest.expiryDate').optional().isISO8601(),
  body('harvest.storageConditions').optional().trim().notEmpty(),
  body('location.farmLocation').optional().trim().notEmpty(),
  body('location.district').optional().trim().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const product = req.resource;
    
    // Update product fields
    Object.keys(req.body).forEach(key => {
      if (key !== 'farmer' && key !== '_id') {
        product[key] = req.body[key];
      }
    });

    // Update primary image if images are modified
    if (req.body.images && req.body.images.length > 0) {
      product.images = req.body.images;
      product.images[0].isPrimary = true;
    }

    await product.save();

    // Populate farmer details for response
    await product.populate('farmer', 'firstName lastName phone address district');

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Server error while updating product' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Product owner or admin)
router.delete('/:id', [
  protect,
  checkOwnership(Product, 'farmer')
], async (req, res) => {
  try {
    const product = req.resource;
    
    // Soft delete - mark as removed
    product.status = 'removed';
    await product.save();

    res.json({
      success: true,
      message: 'Product removed successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Server error while removing product' });
  }
});

// @route   POST /api/products/:id/inquiry
// @desc    Send inquiry about a product
// @access  Private (Buyers only)
router.post('/:id/inquiry', [
  protect,
  authorizeBuyer,
  requireVerification,
  body('message').trim().isLength({ min: 10, max: 500 }).withMessage('Message must be between 10 and 500 characters'),
  body('quantity').isFloat({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { message, quantity } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.status !== 'available') {
      return res.status(400).json({ error: 'Product is not available for inquiry' });
    }

    // Check if quantity is available
    if (quantity > product.quantity.available) {
      return res.status(400).json({ error: 'Requested quantity exceeds available quantity' });
    }

    // Add inquiry
    product.inquiries.push({
      buyer: req.user.id,
      message,
      quantity
    });

    await product.save();

    // Populate buyer details for response
    await product.populate('inquiries.buyer', 'firstName lastName email phone companyDetails');

    res.json({
      success: true,
      message: 'Inquiry sent successfully',
      data: product.inquiries[product.inquiries.length - 1]
    });

  } catch (error) {
    console.error('Send inquiry error:', error);
    res.status(500).json({ error: 'Server error while sending inquiry' });
  }
});

// @route   GET /api/products/farmer/:farmerId
// @desc    Get products by specific farmer
// @access  Public
router.get('/farmer/:farmerId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find({
      farmer: req.params.farmerId,
      status: 'available'
    })
    .populate('farmer', 'firstName lastName phone address district businessDetails farmDetails')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

    const total = await Product.countDocuments({
      farmer: req.params.farmerId,
      status: 'available'
    });

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get farmer products error:', error);
    res.status(500).json({ error: 'Server error while fetching farmer products' });
  }
});

// @route   GET /api/products/categories
// @desc    Get all product categories with counts
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { status: 'available' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricing.pricePerUnit' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Server error while fetching categories' });
  }
});

// @route   GET /api/products/districts
// @desc    Get all districts with product counts
// @access  Public
router.get('/districts', async (req, res) => {
  try {
    const districts = await Product.aggregate([
      { $match: { status: 'available' } },
      {
        $group: {
          _id: '$location.district',
          count: { $sum: 1 },
          avgPrice: { $avg: '$pricing.pricePerUnit' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: districts
    });

  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({ error: 'Server error while fetching districts' });
  }
});

module.exports = router;
