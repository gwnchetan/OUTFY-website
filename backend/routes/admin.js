const express         = require('express');
const rateLimit       = require('express-rate-limit');
const router          = express.Router();
const auth            = require('../middleware/authMiddleware');
const isAdmin         = require('../middleware/adminMiddleware');
const adminController = require('../controllers/adminController');

// ── Admin-specific rate limiter — stricter than public routes ─────────────────
const adminLimiter = rateLimit({
  windowMs:            15 * 60 * 1000, // 15 minutes
  max:                 200,            // max 200 admin requests per 15 min per IP
  message:             { message: 'Too many admin requests. Please slow down.' },
  standardHeaders:     true,
  legacyHeaders:       false,
  skipSuccessfulRequests: false,
});

// ── All admin routes require: rate limit + valid JWT + admin role ──────────────
router.use(adminLimiter);
router.use(auth);
router.use(isAdmin);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', adminController.getDashboardStats);

// ── Product Management ────────────────────────────────────────────────────────
router.get   ('/products',     adminController.getProducts);
router.post  ('/products',     adminController.createProduct);
router.put   ('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// ── Order Management ──────────────────────────────────────────────────────────
router.get  ('/orders',                   adminController.getOrders);
router.get  ('/orders/:orderId',          adminController.getOrderDetail);
router.patch('/orders/:orderId/status',   adminController.updateOrderStatus);

module.exports = router;
