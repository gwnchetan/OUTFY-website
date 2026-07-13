import React, { useState, useEffect } from 'react';
import './AdminOrders.css';

import { API_BASE } from '../../config/api';

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.round((now - date) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function AdminOrderDetail({ orderId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [orderId]);

  const fetchDetail = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${API_BASE}/admin/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch order details');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Update order status to ${data.statusLabels[newStatus]}?`)) return;
    setUpdating(true);
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
      
      if (!res.ok) throw new Error('Failed to update status');
      
      // Refresh to get the new status history
      fetchDetail();
    } catch (err) {
      alert(err.message);
      setUpdating(false); // only false on err, fetchDetail handles success loading state
    }
  };

  if (loading && !data) return <div className="admin-loading-spinner">Loading order details...</div>;
  if (error) return <div className="admin-error-banner">{error} <button onClick={onBack}>Go Back</button></div>;
  if (!data) return null;

  const { order, customerName, customerEmail, customerPhone, validNextStates, statusLabels } = data;

  return (
    <div className="admin-order-detail-page">
      <button className="admin-back-btn" onClick={onBack}>
        &larr; Back to Orders
      </button>

      <div className="admin-order-detail-grid">
        <div className="admin-order-left">
          {/* Header Info */}
          <div className="admin-detail-card header-card">
            <div className="header-top">
              <h2>Order #{order.orderId}</h2>
              <span className={`admin-status-badge status-${order.status}`}>
                {statusLabels[order.status]}
              </span>
            </div>
            <p className="order-date-full">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            
            <div className="header-stats">
              <div className="stat-box">
                <span className="label">Customer</span>
                <span className="value">{customerName}</span>
                <span className="sub-value">{customerEmail}</span>
                {customerPhone && <span className="sub-value">{customerPhone}</span>}
              </div>
              <div className="stat-box">
                <span className="label">Payment</span>
                <span className="value">{order.paymentMethod}</span>
                <span className={`sub-value badge payment-${order.paymentStatus || 'pending'}`}>
                  {(order.paymentStatus || 'pending').toUpperCase()}
                </span>
              </div>
              <div className="stat-box">
                <span className="label">Total Amount</span>
                <span className="value">₹{order.total?.toLocaleString() || 0}</span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="admin-detail-card">
            <h3>Order Items ({order.items.length})</h3>
            <div className="admin-order-items">
              {order.items.map((item, idx) => (
                <div key={idx} className="admin-order-item">
                  <img src={item.img || 'https://via.placeholder.com/80'} alt={item.name} />
                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.qty} {item.size ? `| Size: ${item.size}` : ''}</p>
                  </div>
                  <div className="item-price">
                    ₹{(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address */}
          <div className="admin-detail-card">
            <h3>Shipping Address</h3>
            {order.address ? (
              <div className="admin-shipping-address">
                <p><strong>{order.address.label}</strong></p>
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p>{order.address.city}, {order.address.state} - {order.address.zip}</p>
                <p>{order.address.country}</p>
              </div>
            ) : (
              <p>No address provided.</p>
            )}
          </div>
        </div>

        <div className="admin-order-right">
          {/* Actions */}
          <div className="admin-detail-card actions-card">
            <h3>Update Status</h3>
            {validNextStates.length === 0 ? (
              <p className="no-actions">This order is {statusLabels[order.status]}. No further status updates available.</p>
            ) : (
              <div className="status-actions">
                {validNextStates.map(state => (
                  <button 
                    key={state}
                    className="admin-btn-primary"
                    disabled={updating}
                    onClick={() => handleStatusChange(state)}
                  >
                    Mark as {statusLabels[state]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="admin-detail-card timeline-card">
            <h3>Status Timeline</h3>
            <div className="admin-timeline">
              {order.statusHistory && [...order.statusHistory].reverse().map((hist, idx) => (
                <div key={idx} className={`timeline-item ${idx === 0 ? 'current' : ''}`}>
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <h4>{statusLabels[hist.status] || hist.status}</h4>
                    <span className="timeline-time">{timeAgo(hist.timestamp)}</span>
                    <span className="timeline-user">by {hist.updatedBy}</span>
                  </div>
                </div>
              ))}
              {!order.statusHistory?.length && (
                <p>No history recorded for this order.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
