const Product = require('../models/Product');
const User = require('../models/User');
const { invalidateProductCache } = require('../middleware/publicResponseCache');
const { canTransition, getNextStates, STATUS_LABELS } = require('../utils/orderStateMachine');

// ─── Dashboard Stats ─────────────────────────────────────────────────────────

exports.getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const lowStockProducts = await Product.countDocuments({ stock: { $gt: 0, $lte: 5 } });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });
    const totalUsers = await User.countDocuments();

    // Category distribution
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Stock value
    const stockValueAgg = await Product.aggregate([
      { $group: { _id: null, totalValue: { $sum: { $multiply: ['$price', '$stock'] } } } }
    ]);
    const totalStockValue = stockValueAgg.length > 0 ? stockValueAgg[0].totalValue : 0;

    // Order stats — aggregate across all users
    const orderStats = await User.aggregate([
      { $unwind: '$orders' },
      {
        $group: {
          _id: '$orders.status',
          count: { $sum: 1 },
          revenue: { $sum: '$orders.total' },
        },
      },
    ]);

    const totalOrders = orderStats.reduce((sum, s) => sum + s.count, 0);
    const totalRevenue = orderStats.reduce((sum, s) => sum + s.revenue, 0);
    const ordersByStatus = {};
    orderStats.forEach(s => { ordersByStatus[s._id] = s.count; });

    res.json({
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalUsers,
      totalStockValue,
      categoryStats,
      totalOrders,
      totalRevenue,
      ordersByStatus,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
};

// ─── Product Management ──────────────────────────────────────────────────────

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    invalidateProductCache();
    res.status(201).json({ message: 'Product created successfully', product: savedProduct });
  } catch (error) {
    res.status(400).json({ message: 'Error creating product', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    invalidateProductCache();
    res.json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    res.status(400).json({ message: 'Error updating product', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    invalidateProductCache();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// ─── Order Management (Admin) ────────────────────────────────────────────────

/**
 * GET /api/admin/orders?status=&search=&page=&limit=
 * List all orders across all users using $unwind aggregation
 */
exports.getOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
      { $unwind: '$orders' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          customerName: '$name',
          customerEmail: '$email',
          order: '$orders',
        },
      },
    ];

    // Filter by status
    if (status && status !== 'all') {
      pipeline.push({ $match: { 'order.status': status } });
    }

    // Search by orderId or customer name/email
    if (search && search.trim()) {
      const searchRegex = { $regex: search.trim(), $options: 'i' };
      pipeline.push({
        $match: {
          $or: [
            { 'order.orderId': searchRegex },
            { customerName: searchRegex },
            { customerEmail: searchRegex },
          ],
        },
      });
    }

    // Count total before pagination
    const countPipeline = [...pipeline, { $count: 'total' }];
    const countResult = await User.aggregate(countPipeline);
    const total = countResult.length > 0 ? countResult[0].total : 0;

    // Sort and paginate
    pipeline.push({ $sort: { 'order.createdAt': -1 } });
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limitNum });

    const orders = await User.aggregate(pipeline);

    res.json({
      orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
};

/**
 * GET /api/admin/orders/:orderId
 * Get single order detail with full statusHistory and customer info
 */
exports.getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    const result = await User.aggregate([
      { $unwind: '$orders' },
      { $match: { 'orders.orderId': orderId } },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          customerName: '$name',
          customerEmail: '$email',
          customerPhone: '$phone',
          order: '$orders',
        },
      },
    ]);

    if (!result.length) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const data = result[0];
    // Include valid next states for the UI
    data.validNextStates = getNextStates(data.order.status);
    data.statusLabels = STATUS_LABELS;

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order detail', error: error.message });
  }
};

/**
 * PATCH /api/admin/orders/:orderId/status
 * Update order status with state machine validation
 * Body: { newStatus: 'shipped' }
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { newStatus } = req.body;

    if (!newStatus) {
      return res.status(400).json({ message: 'newStatus is required' });
    }

    // Find the user who owns this order
    const user = await User.findOne({ 'orders.orderId': orderId });
    if (!user) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = user.orders.find(o => o.orderId === orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found in user records' });
    }

    // Validate transition
    if (!canTransition(order.status, newStatus)) {
      return res.status(400).json({
        message: `Invalid transition: cannot move from "${order.status}" to "${newStatus}"`,
        currentStatus: order.status,
        validNextStates: getNextStates(order.status),
      });
    }

    // Apply transition
    const adminName = req.adminUser?.name || 'Admin';
    order.status = newStatus;
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      updatedBy: adminName,
    });

    await user.save();

    // Mock notification
    console.log(`[NOTIFICATION] Order #${orderId} status changed to "${newStatus}" — customer: ${user.email}`);

    res.json({
      message: `Order status updated to "${STATUS_LABELS[newStatus] || newStatus}"`,
      order,
      validNextStates: getNextStates(newStatus),
    });
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error: error.message });
  }
};
