const express       = require('express');
const productCtrl   = require('../controllers/productController');
const auth          = require('../middleware/authMiddleware');

const router = express.Router();

// ── Public routes ───────────────────────────────────────────
router.get('/',             productCtrl.getProducts);    // GET /api/products?category=&search=&sort=&page=&limit=
router.get('/featured',     productCtrl.getFeatured);    // GET /api/products/featured
router.get('/categories',   productCtrl.getCategories);  // GET /api/products/categories
router.get('/:id',          productCtrl.getProduct);     // GET /api/products/:id  (id or slug)

// ── Admin-only routes (protected) ──────────────────────────
router.post  ('/',     auth, productCtrl.createProduct);   // POST   /api/products
router.put   ('/:id',  auth, productCtrl.updateProduct);   // PUT    /api/products/:id
router.delete('/:id',  auth, productCtrl.deleteProduct);   // DELETE /api/products/:id  (soft delete)

module.exports = router;
