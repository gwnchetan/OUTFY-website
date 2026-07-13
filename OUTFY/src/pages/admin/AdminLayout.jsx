import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminDashboard from './AdminDashboard';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminOrderDetail from './AdminOrderDetail';
import './AdminLayout.css';

export default function AdminLayout() {
  const { user, loading: authLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Basic path parsing in case someone lands directly on /admin/products or /admin/orders
  React.useEffect(() => {
    if (window.location.pathname === '/admin/products') {
      setCurrentTab('products');
    } else if (window.location.pathname === '/admin/orders') {
      setCurrentTab('orders');
    } else {
      setCurrentTab('dashboard');
    }
  }, []);

  const navigateTab = (tab) => {
    setCurrentTab(tab);
    if (tab !== 'order-detail') {
      window.history.pushState({}, '', `/admin/${tab}`);
    }
  };

  // ── Wait for auth to finish loading before rendering anything ─────────────
  if (authLoading) {
    return (
      <div className="admin-unauthorized">
        <p>Checking authentication…</p>
      </div>
    );
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="admin-unauthorized">
        <h2>Authentication Required</h2>
        <p>You must be logged in to access the admin panel.</p>
        <button onClick={() => { window.location.href = '/auth'; }}>Go to Login</button>
      </div>
    );
  }

  // ── Logged in but not admin ────────────────────────────────────────────────
  if (user.role !== 'admin') {
    return (
      <div className="admin-unauthorized">
        <h2>Access Denied</h2>
        <p>You do not have the necessary permissions to view this page.</p>
        <button onClick={() => { window.location.href = '/'; }}>Return Home</button>
      </div>
    );
  }

  return (
    <div className="admin-layout-container">
      <aside className="admin-sidebar">
        <div className="admin-logo">OUTFY ADMIN</div>
        <nav className="admin-nav">
          <div
            className={`admin-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => navigateTab('dashboard')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Dashboard
          </div>
          <div
            className={`admin-nav-item ${(currentTab === 'orders' || currentTab === 'order-detail') ? 'active' : ''}`}
            onClick={() => navigateTab('orders')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            Orders
          </div>
          <div
            className={`admin-nav-item ${currentTab === 'products' ? 'active' : ''}`}
            onClick={() => navigateTab('products')}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
            Products
          </div>
          <div
            className="admin-nav-item"
            style={{ marginTop: 'auto', color: '#ef4444' }}
            onClick={() => { window.location.href = '/'; }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Exit Admin
          </div>
        </nav>
      </aside>

      <main className="admin-main-content">
        {currentTab === 'dashboard' && <AdminDashboard />}
        {currentTab === 'products' && <AdminProducts />}
        {currentTab === 'orders' && (
          <AdminOrders onViewOrder={(id) => {
            setSelectedOrderId(id);
            setCurrentTab('order-detail');
          }} />
        )}
        {currentTab === 'order-detail' && (
          <AdminOrderDetail
            orderId={selectedOrderId}
            onBack={() => navigateTab('orders')}
          />
        )}
      </main>
    </div>
  );
}
