const express       = require('express');
const productCtrl   = require('../controllers/productController');
const auth          = require('../middleware/authMiddleware');
const { cachePublicResponse } = require('../middleware/publicResponseCache');

const router = express.Router();

// ── Public routes ───────────────────────────────────────────
router.get('/',             cachePublicResponse(), productCtrl.getProducts);    // GET /api/products?category=&search=&sort=&page=&limit=
router.get('/featured',     cachePublicResponse(), productCtrl.getFeatured);    // GET /api/products/featured
router.get('/categories',   cachePublicResponse(), productCtrl.getCategories);  // GET /api/products/categories
router.get('/:id',          cachePublicResponse(), productCtrl.getProduct);     // GET /api/products/:id  (id or slug)

// ── Admin-only routes (protected) ──────────────────────────
router.post  ('/',     auth, productCtrl.createProduct);   // POST   /api/products
router.put   ('/:id',  auth, productCtrl.updateProduct);   // PUT    /api/products/:id
router.delete('/:id',  auth, productCtrl.deleteProduct);   // DELETE /api/products/:id  (soft delete)

module.exports = router;
