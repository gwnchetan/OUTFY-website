const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');
const { authLimiter, loginLimiter, registerLimiter } = require('../middleware/rateLimiter');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Apply general rate limit to all auth routes
router.use(authLimiter);

router.post('/register', registerLimiter, authController.register);
router.post('/login', loginLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user, info) => {
    if (err) {
      console.error("OAuth Error in authenticate:", err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=OAuthFailed`);
    }
    if (!user) {
      const message = (info && info.message) ? info.message : 'Google login cancelled or failed.';
      console.log("OAuth Failed without user:", message);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(message)}`);
    }
    req.user = user;
    next();
  })(req, res, next);
}, authController.googleCallback);

// Protected route example
router.get('/me', auth, (req, res) => {
  res.status(200).json({ message: "Protected route accessed", userId: req.user.id });
});

module.exports = router;
