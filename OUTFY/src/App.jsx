import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import CartDrawer from './components/cart/CartDrawer';
import ErrorBoundary from './components/ErrorBoundary';

// Route-level loading keeps the initial home-page JavaScript focused on the
// storefront instead of downloading checkout, account, and admin code up front.
const HomePage = React.lazy(() => import('./pages/HomePage'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const ShopPage = React.lazy(() => import('./pages/ShopPage'));
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const AdminLayout = React.lazy(() => import('./pages/admin/AdminLayout'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const OrderTracking = React.lazy(() => import('./pages/OrderTracking'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));
const DiscoverPage = React.lazy(() => import('./pages/DiscoverPage'));

// ── Auth Success handler — Google OAuth redirect lands here ─
function AuthSuccessPage() {
  React.useEffect(() => {
    // Extract token from URL query params
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (token) {
      localStorage.setItem('accessToken', token);
    }
    
    // Navigate home and AuthContext will use the new token
    window.location.replace('/');
  }, []);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100dvh', fontFamily: 'sans-serif', color: '#666' }}>
      Signing you in…
    </div>
  );
}

function PageLoader() {
  return <div className="route-loader" role="status" aria-label="Loading page" />;
}

function AppRoutes() {
  const path = window.location.pathname;
  let Page = NotFoundPage;

  if (path === '/auth' || path === '/login' || path === '/register') Page = AuthPage;
  else if (path === '/shop') Page = ShopPage;
  else if (path === '/about') Page = AboutPage;
  else if (path === '/checkout') Page = CheckoutPage;
  else if (path === '/new-arrivals' || path === '/collections' || path === '/journal') Page = DiscoverPage;
  else if (path.startsWith('/orders/') && path.endsWith('/track')) Page = OrderTracking;
  else if (path.startsWith('/product/')) Page = ProductPage;
  else if (path === '/profile') Page = ProfilePage;
  else if (path.startsWith('/admin')) Page = AdminLayout;
  else if (path === '/') Page = HomePage;

  if (path === '/auth-success') return <AuthSuccessPage />;
  return <React.Suspense fallback={<PageLoader />}><Page /></React.Suspense>;
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
