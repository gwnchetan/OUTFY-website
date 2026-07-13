# ✦ OUTFY — Premium E-Commerce Platform

OUTFY is a state-of-the-art, visually striking, and secure e-commerce application designed for modern fashion retailers. Built with a premium, sleek dark-gold aesthetic, it features a complete user shopping pipeline, secure payments, and a fully featured administrative dashboard.

---

## 🚀 Key Features

### 🛍️ Client Shopping Experience
- **Interactive Shopfront:** Filter products by custom categories, search dynamically, and explore structured collection showcases with smooth animations.
- **Dynamic Shopping Cart:** Persists locally for guest users, and merges/synchronizes securely with MongoDB upon logging in.
- **Wishlist Support:** Save items to a personalized wishlist, fully saved to the database for authenticated users.
- **Real-Time Order Tracking:** Visual progress workflow tracing orders from processing to shipped, out for delivery, and delivered.
- **Responsive Premium UI:** Designed using vanilla CSS for optimal control, clean modern fonts (Inter & Playfair Display), sleek glassmorphic components, and micro-animations.

### 🔐 Robust Authentication & Security
- **Email OTP Verification:** Registers accounts securely using nodemailer-based OTP verification, including brute-force prevention and lockouts.
- **Google OAuth Integration:** Instant sign-on powered by Passport.js OAuth 2.0 logic.
- **JWT Authorization Model:** Dual tokens (Access + Refresh JWT) with HTTP-only cookies configured with cross-site capabilities (`sameSite: 'none'`) to work perfectly when deployed across different hosting platforms (e.g., Vercel + Render).
- **Embedded Roles:** Auth tokens contain user roles for fast-path admin clearance without querying the database for every protected request.
- **Stricter Access Protections:** Production guards to prevent payload attacks, custom admin rate limiters, and clean SPA route fallbacks.

### 📊 Management Dashboard (Admin Panel)
- **Interactive Stats:** Instant insights on total sales, orders processed, product count, and average order values.
- **Product Catalog Management:** Fully operational CRUD (Create, Read, Update, Delete) product portal with comparing prices.
- **Controlled Order Flow:** Strict transition checks to prevent administrative errors (e.g., preventing shipped orders from being reverted to pending).

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| **Frontend** | React, Vite, Vanilla CSS |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Authentication** | Passport.js, JWT, bcryptjs |
| **Payments** | Razorpay SDK |
| **Deployment Configuration** | Vercel (Frontend), Render/Railway (Backend) |

---

## 📦 Project Structure

```
temp website/
├── OUTFY/                 # React Frontend Application
│   ├── src/
│   │   ├── components/    # Reusable UI & Layout Components
│   │   ├── context/       # Auth, Cart, and Wishlist contexts
│   │   ├── pages/         # Page components (Shop, Checkout, Admin, etc.)
│   │   └── config/        # Centralized configurations (API routing)
│   ├── public/
│   └── vercel.json        # Production SPA Rewrite rules
└── backend/               # Express.js REST API
    ├── config/            # Strategy setups (Passport OAuth)
    ├── controllers/       # Controller handling business logic
    ├── middleware/        # JWT Authentication, Rate Limiting, & Roles
    ├── models/            # Mongoose MongoDB schemas
    ├── routes/            # Main server routers
    └── server.js          # Hardened entry point
```

---

## 🚀 Setting Up Locally

### Prerequisites
- Node.js installed (v18+ recommended)
- A running MongoDB instance (or Atlas URI)
- A Razorpay developer account (for payments testing)

### 1. Backend Setup
1. Navigate into the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file copying the keys from `.env.example`:
   ```env
   MONGO_URI=your_mongodb_connection_uri
   JWT_SECRET=any_random_32_character_string
   JWT_REFRESH_SECRET=another_random_32_character_string
   PASSWORD_PEPPER=random_pepper_string
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate into the `OUTFY/` directory:
   ```bash
   cd ../OUTFY
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file mapping the backend endpoint:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite client application:
   ```bash
   npm run dev
   ```

---

## 🌐 Production Deployment Steps

### 1. Backend (e.g., Render)
- Select Render's **Web Service** dashboard.
- Connect your repository and configure the Root Directory as `backend/`.
- Build Command: `npm install`
- Start Command: `node server.js`
- Set `NODE_ENV=production` and add all variables listed in `backend/.env.example`.

### 2. Frontend (e.g., Vercel)
- Set up a new project pointing to your repository with the Root Directory as `OUTFY/`.
- Add environment variable `VITE_API_URL` pointing to your deployed backend URL (ending with `/api`).
- Deploy. Vercel will automatically read `vercel.json` to configure correct client-side SPA routing rewrites.
