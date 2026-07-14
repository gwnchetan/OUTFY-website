const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../utils/sendEmail');

const generateTokens = (userId, role = 'user') => {
  const accessToken  = jwt.sign({ id: userId, role }, process.env.JWT_SECRET,         { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

const setRefreshTokenCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure:   isProd,               // HTTPS only in prod
    sameSite: isProd ? 'none' : 'strict', // 'none' required for cross-origin (Vercel + Render)
    maxAge:   7 * 24 * 60 * 60 * 1000,
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email, and password are required' });

    if (password.length < 8)
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'Email already registered' });

    const pepper = process.env.PASSWORD_PEPPER;
    const hashedPassword = await bcrypt.hash(password + pepper, 12);

    const user = await User.create({
      name,
      email,
      password:        hashedPassword,
      authProvider:    'local',
      isEmailVerified: true
    });

    await sendWelcomeEmail(email, user.name);

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    if (user.isLocked())
      return res.status(429).json({ message: 'Account temporarily locked. Try again later.' });

    if (user.authProvider !== 'local')
      return res.status(400).json({ message: `This account uses ${user.authProvider} login. Please use that.` });

    const pepper = process.env.PASSWORD_PEPPER;
    const isMatch = await bcrypt.compare(password + pepper, user.password);

    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.loginAttempts = 0;
      }
      await user.save();
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    user.loginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);
    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      accessToken,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.refresh = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(200).json({ accessToken: null, message: 'No session' });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select('role').lean();
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    const accessToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.status(200).json({ accessToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid refresh token' });
  }
};

exports.logout = (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'strict',
  });
  res.status(200).json({ message: 'Logged out' });
};

// OAuth Callbacks
exports.googleCallback = (req, res) => {
  const user = req.user;
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);
  setRefreshTokenCookie(res, refreshToken);

  // Redirect to frontend auth-success handler
  res.redirect(`${process.env.FRONTEND_URL}/auth-success`);
};


