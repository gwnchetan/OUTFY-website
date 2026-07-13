const express    = require('express');
const auth       = require('../middleware/authMiddleware');
const userCtrl   = require('../controllers/userController');

const router = express.Router();

// All routes require authentication
router.use(auth);

// ─── Profile ───────────────────────────────────────────────────
router.get('/me',       userCtrl.getMe);
router.put('/profile',  userCtrl.updateProfile);
router.put('/password', userCtrl.changePassword);

// ─── Cart ──────────────────────────────────────────────────────
router.get   ('/cart',           userCtrl.getCart);
router.post  ('/cart',           userCtrl.addToCart);
router.put   ('/cart/:itemId',   userCtrl.updateCartItem);
router.delete('/cart/:itemId',   userCtrl.removeCartItem);
router.delete('/cart',           userCtrl.clearCart);

// ─── Wishlist ──────────────────────────────────────────────────
router.get ('/wishlist',              userCtrl.getWishlist);
router.post('/wishlist/:productId',   userCtrl.toggleWishlist);

// ─── Addresses ─────────────────────────────────────────────────
router.get   ('/addresses',           userCtrl.getAddresses);
router.post  ('/addresses',           userCtrl.addAddress);
router.put   ('/addresses/:addrId',   userCtrl.updateAddress);
router.delete('/addresses/:addrId',   userCtrl.deleteAddress);

// ─── Orders ────────────────────────────────────────────────────
router.get   ('/orders',               userCtrl.getOrders);
router.post  ('/orders',               userCtrl.createOrder);
router.post  ('/orders/verify',        userCtrl.verifyPayment);
router.get   ('/orders/:orderId/track', userCtrl.trackOrder);

module.exports = router;
