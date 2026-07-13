import React, { useState, useEffect } from 'react';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import './OrderTracking.css';

import { API_BASE } from '../config/api';

const STATUS_STAGES = ['processing', 'shipped', 'out_for_delivery', 'delivered'];

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

export default function OrderTracking() {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Extract orderId from URL manually since we are using simple routing
  const orderId = window.location.pathname.split('/')[2];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          window.location.href = '/login';
          return;
        }

        const res = await fetch(`${API_BASE}/user/orders/${orderId}/track`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Order not found or access denied');
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) return <div className="tracking-loading">Loading order details...</div>;
  
  if (error || !order) return (
    <div className="tracking-error-page">
      <Navbar />
      <div className="tracking-error">
        <h2>Order Not Found</h2>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/profile?tab=orders'}>Back to My Orders</button>
      </div>
      <Footer />
    </div>
  );

  const isCancelled = order.status === 'cancelled';
  const currentStageIndex = STATUS_STAGES.indexOf(order.status);
  
  // If status is pending (before processing), index is -1
  const progressIndex = isCancelled ? -1 : currentStageIndex;

  return (
    <div className="order-tracking-page">
      <Navbar />
      
      <main className="tracking-container">
        <div className="tracking-header">
          <button className="back-link" onClick={() => window.location.href = '/profile?tab=orders'}>
            &larr; Back to My Orders
          </button>
          <div className="tracking-header-title">
            <h1>Track Order <span>#{order.orderId}</span></h1>
            <p>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>

        {isCancelled ? (
          <div className="tracking-cancelled-banner">
            <h3>⚠️ This order was cancelled</h3>
            <p>If you have already paid, your refund will be processed within 5-7 business days.</p>
          </div>
        ) : (
          <div className="tracking-progress-section">
            <div className="progress-bar-container">
              {STATUS_STAGES.map((stage, idx) => {
                const isCompleted = idx <= progressIndex;
                const isCurrent = idx === progressIndex;
                return (
                  <div key={stage} className={`progress-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                    <div className="step-icon">
                      {isCompleted ? '✓' : idx + 1}
                    </div>
                    <div className="step-label">
                      {stage.replace(/_/g, ' ').toUpperCase()}
                    </div>
                    {idx < STATUS_STAGES.length - 1 && (
                      <div className={`step-line ${idx < progressIndex ? 'filled' : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="tracking-grid">
          {/* Timeline */}
          <div className="tracking-card">
            <h3>Tracking History</h3>
            <div className="customer-timeline">
              {order.statusHistory && [...order.statusHistory].reverse().map((hist, idx) => (
                <div key={idx} className={`c-timeline-item ${idx === 0 ? 'active' : ''}`}>
                  <div className="c-timeline-dot"></div>
                  <div className="c-timeline-content">
                    <h4>{hist.status.replace(/_/g, ' ').toUpperCase()}</h4>
                    <span className="c-timeline-time">
                      {new Date(hist.timestamp).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      {' • '}
                      <span className="relative-time">{timeAgo(hist.timestamp)}</span>
                    </span>
                  </div>
                </div>
              ))}
              {!order.statusHistory?.length && (
                <p className="no-history">No tracking updates yet. Check back soon!</p>
              )}
            </div>
          </div>

          {/* Order Details Mini */}
          <div className="tracking-sidebar">
            <div className="tracking-card">
              <h3>Order Details</h3>
              <div className="t-order-items">
                {order.items.map((item, idx) => (
                  <div key={idx} className="t-item-row">
                    <div className="t-item-info">
                      <span className="t-qty">{item.qty}x</span>
                      <span className="t-name">{item.name} {item.size && `(${item.size})`}</span>
                    </div>
                    <span className="t-price">₹{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="t-order-total">
                <span>Total Amount</span>
                <span>₹{order.total.toLocaleString()}</span>
              </div>
              
              <div className="t-payment-status">
                <span className="label">Payment Status</span>
                <span className={`badge ${order.paymentStatus}`}>{order.paymentStatus.toUpperCase()}</span>
              </div>
            </div>

            <div className="tracking-card">
              <h3>Delivery Address</h3>
              {order.address && (
                <div className="t-address">
                  <strong>{order.address.label}</strong>
                  <p>{order.address.line1}</p>
                  {order.address.line2 && <p>{order.address.line2}</p>}
                  <p>{order.address.city}, {order.address.state} {order.address.zip}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
