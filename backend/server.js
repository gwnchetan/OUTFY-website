require('dotenv').config();

// ── Environment variable validation (fail fast) ──────────────────────────────
const REQUIRED_ENV = [
  'MONGO_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'PASSWORD_PEPPER',
  'FRONTEND_URL',
];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`[STARTUP ERROR] Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const passport     = require('./config/passport');
const authRoutes    = require('./routes/auth');
const userRoutes    = require('./routes/user');
const productRoutes = require('./routes/products');
const adminRoutes   = require('./routes/admin');
const connectDB     = require('./db.config');

const app = express();

// ── CORS — supports multiple comma-separated origins in FRONTEND_URL ─────────
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Log the mismatch for debugging
    console.error(`[CORS] Blocked origin: "${origin}" | Allowed: [${allowedOrigins.join(', ')}]`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

// ── Body parsing / cookies / OAuth ───────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));   // prevent oversized payloads
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());

// ── DB ────────────────────────────────────────────────────────────────────────
connectDB();

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/user',     userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin',    adminRoutes);

// Health-check — returns 200 OK, safe to expose
app.get('/', (_req, res) => res.json({ status: 'ok' }));

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

// ── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  // Don't leak stack traces in production
  const isProd = process.env.NODE_ENV === 'production';
  console.error('[Server Error]', err);
  res.status(err.status || err.statusCode || 500).json({
    error: isProd ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
  });
});

// ── Process-level guards ──────────────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[Uncaught Exception]', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Unhandled Rejection]', reason);
  process.exit(1);
});

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Running on port ${PORT} | ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`[CORS]   Allowed origins: ${allowedOrigins.join(', ')}`);
});
