const Product = require('../models/Product');

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

    // Full-text search OR regex fallback
    if (search) {
      filter.$or = [
        { name:        { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags:        { $regex: search, $options: 'i' } },
        { category:    { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting
    const sortMap = {
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      newest:     { createdAt: -1 },
      popular:    { 'rating.count': -1 },
    };
    const sortObj = sortMap[sort] || { createdAt: -1 };

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
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
    res.json({ message: 'Product deactivated', product });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
