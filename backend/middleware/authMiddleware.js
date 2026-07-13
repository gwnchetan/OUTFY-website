const jwt = require('jsonwebtoken');

/**
 * authMiddleware — verifies Bearer JWT and attaches { id, role } to req.user.
 * The role is embedded in the token so admin routes don't need an extra DB hit.
 */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded contains { id, role } — both embedded at sign time
    req.user = { id: decoded.id, role: decoded.role || 'user' };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = auth;