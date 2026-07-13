import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import CartDrawer from './components/cart/CartDrawer';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import AdminLayout from './pages/admin/AdminLayout';
import AboutPage from './pages/AboutPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTracking from './pages/OrderTracking';
import NotFoundPage from './pages/NotFoundPage';

// ── Auth Success handler — Google OAuth redirect lands here ─
function AuthSuccessPage() {
  React.useEffect(() => {
    // The accessToken is in localStorage if set, otherwise session cookie is sufficient.
    // Just navigate home and AuthContext will restore session via /refresh.
    window.location.replace('/');
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', fontFamily: 'sans-serif', color: '#666' }}>
      Signing you in…
    </div>
  );
}

// ── Simple path-based routing ───────────────────────────────
const path = window.location.pathname;

function AppRoutes() {
  if (path === '/auth' || path === '/login' || path === '/register') return <AuthPage />;
  if (path === '/auth-success') return <AuthSuccessPage />;
  if (path === '/shop')    return <ShopPage />;
  if (path === '/about')   return <AboutPage />;
  if (path === '/checkout') return <CheckoutPage />;
  if (path.startsWith('/orders/') && path.endsWith('/track')) return <OrderTracking />;
  if (path.startsWith('/product/')) return <ProductPage />;
  if (path === '/profile') return <ProfilePage />;
  if (path.startsWith('/admin')) return <AdminLayout />;
  if (path === '/') return <HomePage />;
  return <NotFoundPage />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <AppRoutes />
            <CartDrawer />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
