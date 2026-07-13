import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import './CheckoutPage.css';

import { API_BASE } from '../config/api';

const API = API_BASE;

// ── Icons ────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const _BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, authFetch, loading: authLoading } = useAuth();

  const shippingCharge = 40;
  const gstRate = 0.18;
  const gstAmount = Math.round(cartTotal * gstRate);
  const grandTotal = cartTotal + shippingCharge + gstAmount;

  // ── States ────────────────────────────────────────────────
  const [addresses, setAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Online'); // 'Online', 'UPI', or 'COD'
  const [orderStep, setOrderStep] = useState(1); // 1 = Address/Review, 2 = Payment Simulation / Thank You
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Address Form State ────────────────────────────────────
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'India',
    isDefault: false
  });

  // ── Redirect guest users ──────────────────────────────────
  useEffect(() => {
    if (!authLoading && !user) {
      alert('Please sign in to proceed with checkout');
      window.location.href = '/auth?redirect=/checkout';
    }
  }, [user, authLoading]);

  // ── Fetch user addresses ──────────────────────────────────
  useEffect(() => {
    if (user) {
      const fetchAddresses = async () => {
        try {
          const rawRes = await authFetch(`${API}/user/addresses`);
          const res = await rawRes.json();
          setAddresses(res || []);
          const def = res?.find(a => a.isDefault);
          if (def) {
            setSelectedAddrId(def._id);
          } else if (res?.length > 0) {
            setSelectedAddrId(res[0]._id);
          }
        } catch (err) {
          console.error('Failed to load addresses:', err);
        }
      };
      fetchAddresses();
    }
  }, [user]);

  // ── Handle Address Submission ─────────────────────────────
  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddr.line1 || !newAddr.city || !newAddr.state || !newAddr.zip) {
      alert('Please fill in all required address fields');
      return;
    }
    const finalLabel = newAddr.label === 'Other' ? (customLabel.trim() || 'Other') : newAddr.label;
    setLoading(true);
    try {
      const rawRes = await authFetch(`${API}/user/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newAddr, label: finalLabel })
      });
      const res = await rawRes.json();
      if (res && res.addresses) {
        setAddresses(res.addresses);
        // Select newly added address
        const added = res.addresses.find(a => a.line1 === newAddr.line1);
        if (added) setSelectedAddrId(added._id);
        setShowAddForm(false);
        // Reset form
        setNewAddr({ label: 'Home', line1: '', line2: '', city: '', state: '', zip: '', country: 'India', isDefault: false });
        setCustomLabel('');
      }
    } catch (err) {
      alert(err.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  // ── Delete Address ────────────────────────────────────────
  const handleDeleteAddress = async (addrId) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      const rawRes = await authFetch(`${API}/user/addresses/${addrId}`, { method: 'DELETE' });
      const res = await rawRes.json();
      if (res && res.addresses) {
        setAddresses(res.addresses);
        if (selectedAddrId === addrId) {
          setSelectedAddrId(res.addresses[0]?._id || null);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to delete address');
    }
  };

  // ── Initialize Payment / Place Order ──────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddrId) {
      alert('Please select a shipping address');
      return;
    }
    const chosenAddress = addresses.find(a => a._id === selectedAddrId);
    if (!chosenAddress) return;


    setLoading(true);
    setError('');

    try {
      // 1. Create order on backend (receives Razorpay Order Object or Mock details)
      const rawRes = await authFetch(`${API}/user/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(i => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            img: i.img,
            qty: i.qty,
            size: i.size
          })),
          total: grandTotal,
          address: chosenAddress,
          paymentMethod
        })
      });
      const res = await rawRes.json();

      if (!res || !res.orderId) {
        throw new Error('Failed to create order on server');
      }

      if (paymentMethod === 'COD') {
        clearCart();
        setOrderStep(2);
        setLoading(false);
        return;
      }

      const { orderId, razorpayOrder, amount: _amount, keyId } = res;

      // 2. Open Razorpay Checkouts (if Key is configured and not mock)
      if (razorpayOrder && window.Razorpay) {
        const options = {
          key: keyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: 'OUTFY Atelier',
          description: 'Timeless Luxury Editorial Order',
          order_id: razorpayOrder.id,
          handler: async function (response) {
            setLoading(true);
            try {
              // 3. Verify Razorpay signature on backend
              const rawVerifyRes = await authFetch(`${API}/user/orders/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  orderId: razorpayOrder.id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature
                })
              });
              const verifyRes = await rawVerifyRes.json();
              if (verifyRes && verifyRes.success) {
                clearCart();
                setOrderStep(2); // Show success screen
              } else {
                throw new Error('Signature verification failed');
              }
            } catch (err) {
              setError(err.message || 'Payment verification failed');
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: user.name || '',
            email: user.email || '',
            contact: user.phone || ''
          },
          theme: { color: '#111111' },
          modal: {
            ondismiss: function () {
              setLoading(false);
              alert('Payment process was cancelled.');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Fallback Simulation Mode
        console.log('Simulating payment checkout flow (mock checkout)...');
        // Simulate a minor API timeout
        setTimeout(async () => {
          try {
            const rawVerifyRes = await authFetch(`${API}/user/orders/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderId })
            });
            const verifyRes = await rawVerifyRes.json();
            if (verifyRes && verifyRes.success) {
              clearCart();
              setOrderStep(2); // Go to success screen
            } else {
              throw new Error('Simulation validation failed');
            }
          } catch (err) {
            setError(err.message || 'Mock Verification failed');
          } finally {
            setLoading(false);
          }
        }, 1500);
      }

    } catch (err) {
      setError(err.message || 'Failed to initialize payment.');
      setLoading(false);
    }
  };

  // Add Razorpay standard script tag dynamically on mount
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="checkout-page" style={{ paddingTop: '80px' }}>
        <div className="container">
          {orderStep === 1 ? (
            <div className="checkout-layout">
              {/* Left Column: Form & Address Details */}
              <div className="checkout-left">
                <div className="checkout-header-step">
                  <h1 className="checkout-title">Checkout</h1>
                  <span className="checkout-subtitle">Shipping & Billing Information</span>
                </div>

                {error && <div className="checkout-error">{error}</div>}

                {/* 1. Address Selection Panel */}
                <div className="checkout-section">
                  <div className="checkout-section__header">
                    <h2 className="checkout-section__title">1. Shipping Address</h2>
                    {!showAddForm && (
                      <button
                        className="checkout-add-btn"
                        onClick={() => setShowAddForm(true)}
                        id="checkout-new-address-btn"
                      >
                        <PlusIcon /> Add New
                      </button>
                    )}
                  </div>

                  {showAddForm ? (
                    <form className="address-form" onSubmit={handleAddAddress} id="checkout-address-form">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Address Label</label>
                          <select
                            value={newAddr.label}
                            onChange={e => setNewAddr({ ...newAddr, label: e.target.value })}
                          >
                            <option value="Home">Home</option>
                            <option value="Office">Office</option>
                            <option value="Other">Other</option>
                          </select>
                          {newAddr.label === 'Other' && (
                            <input
                              type="text"
                              style={{ marginTop: '8px' }}
                              required
                              placeholder="Specify Label (e.g. Hotel, Friend's House)"
                              value={customLabel}
                              onChange={e => setCustomLabel(e.target.value)}
                            />
                          )}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Address Line 1*</label>
                        <input
                          type="text"
                          required
                          placeholder="House No, Apartment, Street Name"
                          value={newAddr.line1}
                          onChange={e => setNewAddr({ ...newAddr, line1: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label>Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          placeholder="Landmark, Area Details"
                          value={newAddr.line2}
                          onChange={e => setNewAddr({ ...newAddr, line2: e.target.value })}
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>City*</label>
                          <input
                            type="text"
                            required
                            placeholder="City"
                            value={newAddr.city}
                            onChange={e => setNewAddr({ ...newAddr, city: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>State*</label>
                          <input
                            type="text"
                            required
                            placeholder="State"
                            value={newAddr.state}
                            onChange={e => setNewAddr({ ...newAddr, state: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Zip Code*</label>
                          <input
                            type="text"
                            required
                            placeholder="6-digit Zip Code"
                            value={newAddr.zip}
                            onChange={e => setNewAddr({ ...newAddr, zip: e.target.value })}
                          />
                        </div>
                        <div className="form-group">
                          <label>Country</label>
                          <input type="text" readOnly value="India" />
                        </div>
                      </div>

                      <div className="form-actions">
                        <button
                          type="button"
                          className="btn btn--ghost"
                          onClick={() => setShowAddForm(false)}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn--outline"
                          disabled={loading}
                        >
                          {loading ? 'Saving…' : 'Save Address'}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="address-list">
                      {addresses.length === 0 ? (
                        <div className="address-empty">
                          <p>No saved addresses found. Please add a shipping address to proceed.</p>
                          <button
                            className="btn btn--outline"
                            onClick={() => setShowAddForm(true)}
                          >
                            Add Address
                          </button>
                        </div>
                      ) : (
                        <div className="address-grid">
                          {addresses.map(addr => (
                            <div
                              key={addr._id}
                              className={`address-card ${selectedAddrId === addr._id ? 'active' : ''}`}
                              onClick={() => setSelectedAddrId(addr._id)}
                            >
                              <div className="address-card__header">
                                <span className="address-card__label">{addr.label}</span>
                                {selectedAddrId === addr._id && (
                                  <span className="address-card__check"><CheckIcon /></span>
                                )}
                              </div>
                              <p className="address-card__lines">
                                {addr.line1}<br />
                                {addr.line2 && <>{addr.line2}<br /></>}
                                {addr.city}, {addr.state} - {addr.zip}<br />
                                {addr.country}
                              </p>
                              <button
                                className="address-card__delete"
                                onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr._id); }}
                                aria-label="Delete address"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                 {/* 2. Review and Payment Actions */}
                <div className="checkout-section">
                  <h2 className="checkout-section__title">2. Settlement & Payment Method</h2>
                  <p className="checkout-section__desc">
                    Choose your preferred payment method below to complete the settlement.
                  </p>

                  <div className="payment-method-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '8px 0 16px' }}>
                    <div
                      className={`payment-method-card ${paymentMethod === 'Online' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('Online')}
                      style={{
                        border: '1px solid var(--col-border)',
                        borderRadius: '8px',
                        padding: '12px 8px',
                        cursor: 'pointer',
                        background: paymentMethod === 'Online' ? 'var(--col-bg-stone)' : '#fff',
                        borderColor: paymentMethod === 'Online' ? 'var(--col-dark)' : 'var(--col-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        gap: '4px'
                      }}
                    >
                      <span className="payment-method-title" style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Online Pay</span>
                      <span className="payment-method-desc" style={{ fontSize: '10px', color: 'var(--col-muted)' }}>Cards & Netbanking</span>
                    </div>


                    <div
                      className={`payment-method-card ${paymentMethod === 'COD' ? 'active' : ''}`}
                      onClick={() => setPaymentMethod('COD')}
                      style={{
                        border: '1px solid var(--col-border)',
                        borderRadius: '8px',
                        padding: '12px 8px',
                        cursor: 'pointer',
                        background: paymentMethod === 'COD' ? 'var(--col-bg-stone)' : '#fff',
                        borderColor: paymentMethod === 'COD' ? 'var(--col-dark)' : 'var(--col-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        gap: '4px'
                      }}
                    >
                      <span className="payment-method-title" style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>COD</span>
                      <span className="payment-method-desc" style={{ fontSize: '10px', color: 'var(--col-muted)' }}>Cash on Delivery</span>
                    </div>
                  </div>


                  <p className="checkout-section__desc" style={{ fontSize: '12px', color: 'var(--col-muted)' }}>
                    {paymentMethod === 'Online' && 'Secure transaction hosted via Razorpay gateway. Cards, Netbanking, UPI & Wallets.'}
                    {paymentMethod === 'COD' && 'You will pay ₹' + grandTotal.toLocaleString() + ' in cash to the courier representative upon delivery.'}
                  </p>

                  <button
                    className="checkout-place-btn"
                    onClick={handlePlaceOrder}
                    disabled={loading || cartItems.length === 0}
                    id="checkout-place-order-btn"
                  >
                    {loading ? 'Processing Order…' : (paymentMethod === 'COD' ? 'Confirm COD Order' : `Pay ₹${grandTotal.toLocaleString()} & Complete Order`)}
                  </button>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="checkout-right">
                <div className="summary-sticky">
                  <h3 className="summary-title">Order Summary</h3>
                  <div className="summary-items">
                    {cartItems.map((item, idx) => (
                      <div key={`${item._id}-${idx}`} className="summary-item">
                        <div className="summary-item__img-wrap">
                          <img src={item.img || '/prod-dress.png'} alt={item.name} />
                          <span className="summary-item__qty">{item.qty}</span>
                        </div>
                        <div className="summary-item__details">
                          <p className="summary-item__name">{item.name}</p>
                          {item.size && <span className="summary-item__size">Size: {item.size}</span>}
                          <span className="summary-item__price">₹{(item.price * item.qty).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="summary-breakdown">
                    <div className="summary-row">
                      <span>Subtotal</span>
                      <span>₹{cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping</span>
                      <span>₹{shippingCharge.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                      <span>GST (18%)</span>
                      <span>₹{gstAmount.toLocaleString()}</span>
                    </div>
                    <div className="summary-divider" />
                    <div className="summary-row total">
                      <span>Total Due</span>
                      <span>₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Thank You Success Screen */
            <div className="checkout-success">
              <div className="success-badge">✓</div>
              <h1 className="success-title">Thank you for your purchase</h1>
              <p className="success-desc">
                Your payment has been successfully processed and verified. We are compiling your order in our atelier.
              </p>
              <div className="success-actions">
                <a href="/shop" className="btn btn--outline">Continue Shopping</a>
                <a href="/profile" className="btn btn--ghost">View My Orders →</a>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
