const Product = require('../models/Product');
const { invalidateProductCache } = require('../middleware/publicResponseCache');

const PRODUCT_CARD_FIELDS = 'name slug category price comparePrice images badge rating stock isFeatured createdAt';

function positiveInteger(value, fallback, max) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, max);
}

// ─── GET /api/products ────────────────────────────────────────────────────────
// Query params:
//   category  — filter by category
//   search    — full-text search
//   badge     — filter by badge (New, Sale, etc.)
//   featured  — "true" to get only featured products
//   sort      — "price_asc" | "price_desc" | "newest" | "popular"  (default: newest)
//   page      — page number (default: 1)
//   limit     — items per page (default: 20, max: 100)
exports.getProducts = async (req, res) => {
  try {
    const {
      category,
      search,
      badge,
      featured,
      sort    = 'newest',
      page    = 1,
      limit   = 20,
    } = req.query;

    const filter = { isActive: true };

    if (category && category !== 'All') filter.category = category;
    if (badge)    filter.badge    = badge;
    if (featured === 'true') filter.isFeatured = true;

    // Use the text index instead of collection-wide regular-expression scans.
    if (search?.trim()) {
      filter.$text = { $search: search.trim().replace(/\s+/g, ' ') };
    }

    // Sorting
    const sortMap = {
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      newest:     { createdAt: -1 },
      popular:    { 'rating.count': -1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const pageNum  = positiveInteger(page, 1, Number.MAX_SAFE_INTEGER);
    const limitNum = positiveInteger(limit, 20, 100);
    const skip     = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .select(PRODUCT_CARD_FIELDS)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page:       pageNum,
        limit:      limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasMore:    skip + products.length < total,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET /api/products/featured ──────────────────────────────────────────────
exports.getFeatured = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true, isFeatured: true })
      .select(PRODUCT_CARD_FIELDS)
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET /api/products/categories ────────────────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort:  { count: -1 } },
    ]);
    res.json(categories.map(c => ({ name: c._id, count: c.count })));
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── GET /api/products/:id ────────────────────────────────────────────────────
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [
        ...(req.params.id.match(/^[a-f\d]{24}$/i) ? [{ _id: req.params.id }] : []),
        { slug: req.params.id },
      ],
      isActive: true,
    }).lean();

    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── POST /api/products  (admin) ──────────────────────────────────────────────
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    invalidateProductCache();
    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── PUT /api/products/:id  (admin) ──────────────────────────────────────────
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    invalidateProductCache();
    res.json({ message: 'Product updated', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ─── DELETE /api/products/:id  (admin — soft delete) ─────────────────────────
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: false } },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    invalidateProductCache();
    res.json({ message: 'Product deactivated', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
