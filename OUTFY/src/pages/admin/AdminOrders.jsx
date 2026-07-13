import React, { useState, useEffect } from 'react';
import './AdminOrders.css';

import { API_BASE } from '../../config/api';

const STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const PAYMENT_STATUS_COLORS = {
  pending: '#f59e0b',
  paid: '#10b981',
  failed: '#ef4444',
  refunded: '#6b7280'
};

const validTransitions = {
  pending:          ['processing', 'cancelled'],
  processing:       ['shipped', 'cancelled'],
  shipped:          ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered:        [],
  cancelled:        [],
};

export default function AdminOrders({ onViewOrder }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  
  // Status update state
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [filterStatus]); // Re-fetch on filter change

  const fetchOrders = async (searchQuery = search) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('accessToken') || '';
      const params = new URLSearchParams({ status: filterStatus });
      if (searchQuery) params.append('search', searchQuery);
      
      const res = await fetch(`${API_BASE}/admin/orders?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders(search);
  };

  const handleStatusChange = async (orderId, currentStatus, newStatus) => {
    if (newStatus === currentStatus) return;
    if (!window.confirm(`Are you sure you want to change order #${orderId} to ${STATUS_LABELS[newStatus]}?`)) return;

    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newStatus })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      // Update local state to reflect change without full reload
      setOrders(orders.map(o => {
        if (o.order.orderId === orderId) {
          return { ...o, order: { ...o.order, status: newStatus } };
        }
        return o;
      }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="admin-orders-page">
      <div className="admin-orders-header">
        <div>
          <h1>Order Management</h1>
          <p>Track and manage customer orders.</p>
        </div>
      </div>

      <div className="admin-orders-controls">
        <div className="admin-orders-filters">
          {['all', 'pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
            <button
              key={status}
              className={`admin-filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'All Orders' : STATUS_LABELS[status]}
            </button>
          ))}
        </div>
        
        <form onSubmit={handleSearchSubmit} className="admin-orders-search">
          <input 
            type="text" 
            placeholder="Search Order ID, Name, Email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>
      </div>

      {error && <div className="admin-error-banner">{error}</div>}

      <div className="admin-orders-table-container">
        {loading ? (
          <div className="admin-loading-spinner">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="admin-empty-state">No orders found.</div>
        ) : (
          <table className="admin-orders-table">
            <thead>
              <tr>
                <th>Order ID & Date</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((row) => {
                const { order, customerName, customerEmail } = row;
                const nextStates = validTransitions[order.status] || [];
                
                return (
                  <tr key={order.orderId}>
                    <td>
                      <div className="admin-order-id-col">
                        <span className="order-id">#{order.orderId ? order.orderId.substring(0, 15) : 'N/A'}</span>
                        <span className="order-date">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className="admin-order-customer-col">
                        <span className="customer-name">{customerName}</span>
                        <span className="customer-email">{customerEmail}</span>
                      </div>
                    </td>
                    <td>{order.items?.length || 0} items</td>
                    <td>₹{order.total?.toLocaleString() || 0}</td>
                    <td>
                      <div className="admin-payment-status">
                        <span className="payment-method">{order.paymentMethod}</span>
                        <span className="payment-badge" style={{ color: PAYMENT_STATUS_COLORS[order.paymentStatus || 'pending'] }}>
                          {(order.paymentStatus || 'pending').toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`admin-status-badge status-${order.status || 'pending'}`}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td>
                      <div className="admin-order-actions">
                        <button className="view-btn" onClick={() => onViewOrder(order.orderId)}>
                          View
                        </button>
                        
                        {nextStates.length > 0 && (
                          <select 
                            className="status-dropdown"
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.orderId, order.status, e.target.value)}
                            disabled={updatingId === order.orderId}
                          >
                            <option value={order.status} disabled>{STATUS_LABELS[order.status]}</option>
                            {nextStates.map(state => (
                              <option key={state} value={state}>
                                Mark as {STATUS_LABELS[state]}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
