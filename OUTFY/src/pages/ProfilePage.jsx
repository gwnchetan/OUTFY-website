import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { PRODUCTS_ALL } from '../data/products';
import Navbar from '../components/home/Navbar';
import './ProfilePage.css';

import { API_BASE } from '../config/api';

const API = `${API_BASE}/user`;

// ── Icons ────────────────────────────────────────────────────────────────────
const PersonIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const PackageIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>;
const MapPinIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>;
const HeartIcon   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/></svg>;
const CameraIcon  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const EditIcon    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const TrashIcon   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6M9 6V4h6v2"/></svg>;
const PlusIcon    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;

const TABS = [
  { id: 'profile',   label: 'Profile',    Icon: PersonIcon  },
  { id: 'orders',    label: 'Orders',     Icon: PackageIcon },
  { id: 'addresses', label: 'Addresses',  Icon: MapPinIcon  },
  { id: 'wishlist',  label: 'Wishlist',   Icon: HeartIcon   },
];

// ── Profile Tab ───────────────────────────────────────────────────────────────
function ProfileTab({ user, authFetch, updateUser }) {
  const [form, setForm]     = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [msg,  setMsg]      = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg]   = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const showMsg = (setter, type, text) => {
    setter({ type, text });
    setTimeout(() => setter({ type: '', text: '' }), 3500);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res  = await authFetch(`${API}/profile`, { method: 'PUT', body: JSON.stringify(form) });
      const data = await res.json();
      if (res.ok) {
        updateUser({ name: data.user.name, phone: data.user.phone });
        showMsg(setMsg, 'success', 'Profile updated successfully!');
      } else {
        showMsg(setMsg, 'error', data.message || 'Update failed');
      }
    } catch { showMsg(setMsg, 'error', 'Network error'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword)
      return showMsg(setPwMsg, 'error', 'Passwords do not match');
    if (pwForm.newPassword.length < 8)
      return showMsg(setPwMsg, 'error', 'Password must be at least 8 characters');
    setSavingPw(true);
    try {
      const res  = await authFetch(`${API}/password`, { method: 'PUT', body: JSON.stringify(pwForm) });
      const data = await res.json();
      if (res.ok) {
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        showMsg(setPwMsg, 'success', 'Password changed successfully!');
      } else {
        showMsg(setPwMsg, 'error', data.message || 'Failed to change password');
      }
    } catch { showMsg(setPwMsg, 'error', 'Network error'); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="profile-tab">
      {/* Avatar */}
      <div className="profile-avatar-section">
        <div className="profile-avatar-wrap">
          {user?.avatar
            ? <img src={user.avatar} alt={user.name} className="profile-avatar-img" />
            : <div className="profile-avatar-initials">{user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div>
          }
          <button className="profile-avatar-edit" aria-label="Change avatar">
            <CameraIcon />
          </button>
        </div>
        <div className="profile-avatar-info">
          <h2 className="profile-avatar-name">{user?.name}</h2>
          <p className="profile-avatar-email">{user?.email}</p>
          {user?.authProvider !== 'local' && (
            <span className="profile-oauth-badge">{user.authProvider === 'google' ? '🌐 Google Account' : user.authProvider}</span>
          )}
        </div>
      </div>

      {/* Personal Info */}
      <div className="profile-card">
        <h3 className="profile-card__title">Personal Information</h3>
        <form onSubmit={handleSaveProfile} className="profile-form">
          <div className="profile-form__row">
            <div className="profile-form__field">
              <label htmlFor="profile-name">Full Name</label>
              <input id="profile-name" type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="Your name" />
            </div>
            <div className="profile-form__field">
              <label htmlFor="profile-email">Email Address</label>
              <input id="profile-email" type="email" value={user?.email || ''} disabled className="profile-input--disabled" />
            </div>
          </div>
          <div className="profile-form__row">
            <div className="profile-form__field">
              <label htmlFor="profile-phone">Phone Number</label>
              <input id="profile-phone" type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
          {msg.text && <div className={`profile-msg profile-msg--${msg.type}`}>{msg.text}</div>}
          <button type="submit" className="profile-save-btn" disabled={saving} id="profile-save-btn">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change Password — only for local accounts */}
      {user?.authProvider === 'local' && (
        <div className="profile-card">
          <h3 className="profile-card__title">Change Password</h3>
          <form onSubmit={handleChangePassword} className="profile-form">
            <div className="profile-form__field">
              <label htmlFor="current-password">Current Password</label>
              <input id="current-password" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({...f, currentPassword: e.target.value}))} placeholder="••••••••" autoComplete="current-password" />
            </div>
            <div className="profile-form__row">
              <div className="profile-form__field">
                <label htmlFor="new-password">New Password</label>
                <input id="new-password" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({...f, newPassword: e.target.value}))} placeholder="Min. 8 characters" autoComplete="new-password" />
              </div>
              <div className="profile-form__field">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input id="confirm-password" type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({...f, confirmPassword: e.target.value}))} placeholder="Repeat new password" autoComplete="new-password" />
              </div>
            </div>
            {pwMsg.text && <div className={`profile-msg profile-msg--${pwMsg.type}`}>{pwMsg.text}</div>}
            <button type="submit" className="profile-save-btn" disabled={savingPw} id="profile-save-pw-btn">
              {savingPw ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

// ── Orders Tab ────────────────────────────────────────────────────────────────
function OrdersTab({ authFetch }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${API}/orders`)
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const STATUS_COLOR = { pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6', out_for_delivery: '#ec4899', delivered: '#22c55e', cancelled: '#ef4444' };

  if (loading) return <div className="profile-loading">Loading orders...</div>;

  return (
    <div className="profile-tab">
      <div className="profile-card">
        <h3 className="profile-card__title">Order History</h3>
        {orders.length === 0 ? (
          <div className="profile-empty">
            <span className="profile-empty-icon">📦</span>
            <p>No orders yet.</p>
            <a href="/shop" className="profile-shop-link">Start Shopping</a>
          </div>
        ) : (
          <div className="orders-list" style={{ gap: '24px', display: 'flex', flexDirection: 'column' }}>
            {orders.map(order => (
              <div key={order._id} className="order-card-wrapper">
                <div className="order-card-header">
                  <div className="order-card-meta">
                    <span className="order-card-id">#{order.orderId || order._id.slice(-8).toUpperCase()}</span>
                    <span className="order-card-date">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="order-card-stats">
                    <div className="order-card-total-box">
                      <span className="order-card-total-label">Total Amount</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="order-card-total-val">₹{order.total?.toLocaleString()}</span>
                        {order.paymentStatus && (
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', background: order.paymentStatus === 'paid' ? '#dcfce7' : '#ffedd5', color: order.paymentStatus === 'paid' ? '#166534' : '#9a3412', fontWeight: 600 }}>
                            {order.paymentStatus.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span className={`status-badge status-badge--${order.status || 'pending'}`} style={{ backgroundColor: STATUS_COLOR[order.status || 'pending'] + '20', color: STATUS_COLOR[order.status || 'pending'], border: `1px solid ${STATUS_COLOR[order.status || 'pending']}50` }}>
                        {(order.status || 'pending').replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <button 
                        onClick={() => window.location.href = `/orders/${order.orderId}/track`}
                        style={{ padding: '6px 12px', background: '#111827', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Track Order
                      </button>
                    </div>
                  </div>
                </div>

                <div className="order-card-products">
                  {order.items && order.items.map((item, idx) => (
                    <div key={`${item.productId}-${idx}`} className="order-product-row">
                      <div className="order-product-img-wrap">
                        <img src={item.img || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=80&q=80'} alt={item.name} />
                      </div>
                      <div className="order-product-info">
                        <p className="order-product-name">{item.name}</p>
                        <div style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
                          {item.size && <span className="order-product-size">Size: {item.size}</span>}
                          <span className="order-product-qty">Qty: {item.qty}</span>
                        </div>
                      </div>
                      <div className="order-product-price">
                        ₹{(item.price * item.qty).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Addresses Tab ─────────────────────────────────────────────────────────────
function AddressesTab({ authFetch }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm] = useState({ label: 'Home', line1: '', line2: '', city: '', state: '', zip: '', country: 'India', isDefault: false });
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState('');

  const load = () => {
    authFetch(`${API}/addresses`)
      .then(r => r.json())
      .then(data => { setAddresses(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url    = editing ? `${API}/addresses/${editing}` : `${API}/addresses`;
      const method = editing ? 'PUT' : 'POST';
      const res    = await authFetch(url, { method, body: JSON.stringify(form) });
      const data   = await res.json();
      if (res.ok) {
        setAddresses(data.addresses);
        setShowForm(false);
        setEditing(null);
        setForm({ label: 'Home', line1: '', line2: '', city: '', state: '', zip: '', country: 'India', isDefault: false });
        setMsg('Address saved!');
        setTimeout(() => setMsg(''), 2500);
      }
    } catch { setMsg('Error saving address'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    const res = await authFetch(`${API}/addresses/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (res.ok) setAddresses(data.addresses);
  };

  const startEdit = (addr) => {
    setEditing(addr._id);
    setForm({ label: addr.label, line1: addr.line1, line2: addr.line2 || '', city: addr.city, state: addr.state, zip: addr.zip, country: addr.country, isDefault: addr.isDefault });
    setShowForm(true);
  };

  if (loading) return <div className="profile-loading">Loading addresses...</div>;

  return (
    <div className="profile-tab">
      <div className="profile-card">
        <div className="profile-card__header">
          <h3 className="profile-card__title">Saved Addresses</h3>
          <button className="profile-add-btn" onClick={() => { setShowForm(v => !v); setEditing(null); setForm({ label: 'Home', line1: '', line2: '', city: '', state: '', zip: '', country: 'India', isDefault: false }); }} id="add-address-btn">
            <PlusIcon /> Add New
          </button>
        </div>

        {msg && <div className="profile-msg profile-msg--success">{msg}</div>}

        {showForm && (
          <form onSubmit={handleSave} className="address-form">
            <div className="profile-form__row">
              <div className="profile-form__field">
                <label>Label</label>
                <input type="text" value={form.label} onChange={e => setForm(f => ({...f, label: e.target.value}))} placeholder="Home / Work / Other" />
              </div>
              <div className="profile-form__field profile-form__field--check">
                <label className="profile-check-label">
                  <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({...f, isDefault: e.target.checked}))} />
                  Set as default
                </label>
              </div>
            </div>
            <div className="profile-form__field">
              <label>Address Line 1 *</label>
              <input type="text" value={form.line1} onChange={e => setForm(f => ({...f, line1: e.target.value}))} placeholder="Flat, House no., Building, Company, Apartment" required />
            </div>
            <div className="profile-form__field">
              <label>Address Line 2</label>
              <input type="text" value={form.line2} onChange={e => setForm(f => ({...f, line2: e.target.value}))} placeholder="Area, Colony, Street, Sector, Village" />
            </div>
            <div className="profile-form__row">
              <div className="profile-form__field">
                <label>City *</label>
                <input type="text" value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))} placeholder="City" required />
              </div>
              <div className="profile-form__field">
                <label>State *</label>
                <input type="text" value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))} placeholder="State" required />
              </div>
              <div className="profile-form__field">
                <label>PIN Code *</label>
                <input type="text" value={form.zip} onChange={e => setForm(f => ({...f, zip: e.target.value}))} placeholder="6-digit PIN" required />
              </div>
            </div>
            <div className="address-form__actions">
              <button type="submit" className="profile-save-btn" disabled={saving}>{saving ? 'Saving...' : editing ? 'Update Address' : 'Save Address'}</button>
              <button type="button" className="profile-cancel-btn" onClick={() => { setShowForm(false); setEditing(null); }}>Cancel</button>
            </div>
          </form>
        )}

        {addresses.length === 0 && !showForm ? (
          <div className="profile-empty">
            <span className="profile-empty-icon">📍</span>
            <p>No saved addresses yet.</p>
          </div>
        ) : (
          <div className="addresses-list">
            {addresses.map(addr => (
              <div key={addr._id} className={`address-card ${addr.isDefault ? 'address-card--default' : ''}`}>
                <div className="address-card__top">
                  <span className="address-card__label">{addr.label}</span>
                  {addr.isDefault && <span className="address-card__default-badge">Default</span>}
                </div>
                <p className="address-card__text">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p className="address-card__text">{addr.city}, {addr.state} – {addr.zip}</p>
                <p className="address-card__text">{addr.country}</p>
                <div className="address-card__actions">
                  <button className="address-card__btn" onClick={() => startEdit(addr)}><EditIcon /> Edit</button>
                  <button className="address-card__btn address-card__btn--danger" onClick={() => handleDelete(addr._id)}><TrashIcon /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Wishlist Tab ──────────────────────────────────────────────────────────────
function WishlistTab() {
  const { wishlistIds, toggleWishlist } = useWishlist();

  const wishedProducts = PRODUCTS_ALL.filter(p => wishlistIds.includes(String(p.id)));

  return (
    <div className="profile-tab">
      <div className="profile-card">
        <h3 className="profile-card__title">My Wishlist ({wishedProducts.length})</h3>
        {wishedProducts.length === 0 ? (
          <div className="profile-empty">
            <span className="profile-empty-icon">🤍</span>
            <p>Your wishlist is empty.</p>
            <a href="/shop" className="profile-shop-link">Discover Pieces</a>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishedProducts.map(product => (
              <div key={product.id} className="wishlist-card">
                <div className="wishlist-card__img-wrap">
                  <img src={product.img} alt={product.name} />
                  <button
                    className="wishlist-card__remove"
                    onClick={() => toggleWishlist(product.id)}
                    aria-label="Remove from wishlist"
                  >
                    ✕
                  </button>
                </div>
                <div className="wishlist-card__info">
                  <p className="wishlist-card__name">{product.name}</p>
                  <p className="wishlist-card__price">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, loading, authFetch, updateUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'profile';
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = '/auth';
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <div className="profile-page-loading">
        <div className="profile-page-spinner" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="profile-page">
        <div className="profile-page__inner">

          {/* Sidebar */}
          <aside className="profile-sidebar">
            <div className="profile-sidebar__avatar">
              {user.avatar
                ? <img src={user.avatar} alt={user.name} className="profile-sidebar__avatar-img" />
                : <div className="profile-sidebar__initials">{user.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}</div>
              }
            </div>
            <p className="profile-sidebar__name">{user.name}</p>
            <p className="profile-sidebar__email">{user.email}</p>

            <nav className="profile-sidebar__nav">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  id={`profile-tab-${tab.id}`}
                  className={`profile-sidebar__nav-item ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <tab.Icon />
                  {tab.label}
                </button>
              ))}
            </nav>

            <button
              className="profile-sidebar__logout"
              onClick={async () => { await logout(); window.location.href = '/'; }}
              id="profile-logout-btn"
            >
              Sign Out
            </button>
          </aside>

          {/* Main Content */}
          <main className="profile-main">
            <div className="profile-main__header">
              <h1 className="profile-main__title">
                {TABS.find(t => t.id === activeTab)?.label}
              </h1>
            </div>

            {activeTab === 'profile'   && <ProfileTab   user={user} authFetch={authFetch} updateUser={updateUser} />}
            {activeTab === 'orders'    && <OrdersTab    authFetch={authFetch} />}
            {activeTab === 'addresses' && <AddressesTab authFetch={authFetch} />}
            {activeTab === 'wishlist'  && <WishlistTab  />}
          </main>
        </div>
      </div>
    </>
  );
}
