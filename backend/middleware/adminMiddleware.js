const User = require('../models/User');

/**
 * isAdmin — verifies the authenticated user has the 'admin' role.
 *
 * Fast-path: checks req.user.role (set by authMiddleware from JWT payload).
 * Fallback DB check: if role is missing from token (old tokens), queries DB.
 */
const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Fast path — role embedded in token by authMiddleware
    if (req.user.role) {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }
      return next();
    }

    // Fallback — look up role from DB (covers old tokens without role claim)
    const user = await User.findById(req.user.id).select('role').lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin role required.' });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: 'Server error in admin authorization' });
  }
};

module.exports = isAdmin;
