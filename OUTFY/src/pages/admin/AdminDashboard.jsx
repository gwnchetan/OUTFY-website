import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../config/api';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth(); // assuming token might be needed if using fetch directly

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // If we need token: 
      // We assume cookies handle auth, but in this setup maybe we need to pass token or it's handled by credentials
      const res = await fetch(`${API_BASE}/admin/dashboard`, {
        credentials: 'omit', // or 'include' depending on how auth is set up. Let's use fetch with token.
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to fetch stats');
      
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading dashboard data...</div>;
  if (error) return <div className="admin-unauthorized"><h2>Error</h2><p>{error}</p></div>;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, {user?.name}. Here's what's happening with your store today.</p>
      </div>

      <div className="dashboard-stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">📦</div>
          <div className="stat-content">
            <h3>Total Orders</h3>
            <p>{stats?.totalOrders || 0}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon red">⏳</div>
          <div className="stat-content">
            <h3>Pending Orders</h3>
            <p>{stats?.ordersByStatus?.pending || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">₹</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p>₹{(stats?.totalRevenue || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue">👕</div>
          <div className="stat-content">
            <h3>Total Products</h3>
            <p>{stats?.totalProducts || 0}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon blue">💰</div>
          <div className="stat-content">
            <h3>Total Stock Value</h3>
            <p>₹{(stats?.totalStockValue || 0).toLocaleString()}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">⚠️</div>
          <div className="stat-content">
            <h3>Low Stock Items</h3>
            <p>{stats?.lowStockProducts || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">❌</div>
          <div className="stat-content">
            <h3>Out of Stock</h3>
            <p>{stats?.outOfStockProducts || 0}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Category Distribution</h3>
          {stats?.categoryStats?.length > 0 ? (
            <div className="category-list">
              {stats.categoryStats.map(cat => (
                <div key={cat._id} className="category-item">
                  <span>{cat._id}</span>
                  <span>{cat.count} Products</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#94a3b8' }}>No category data available.</p>
          )}
        </div>
        
        <div className="chart-card" style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(129,140,248,0.1))' }}>
          <h3>Quick Actions</h3>
          <div className="category-list">
            <button className="admin-btn-primary" onClick={() => window.history.pushState({}, '', '/admin/orders')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#38bdf8', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', marginBottom: '8px' }}>
              Manage Orders
            </button>
            <button className="admin-btn-primary" onClick={() => window.history.pushState({}, '', '/admin/products')} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer' }}>
              Manage Products
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
