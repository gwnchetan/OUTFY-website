import React, { useState, useEffect, useRef } from 'react';
import '../../styles/home.css';
import './Navbar.css';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const NAV_LINKS = [
  { name: 'Shop',         path: '/shop' },
  { name: 'New Arrivals', path: '/#shop' },
  { name: 'Collections',  path: '/#collections' },
  { name: 'About',        path: '/about' },
];

const WishlistIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const _UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const ProfileIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const OrdersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { cartCount, setCartOpen } = useCart();
  const [scrolled,   setScrolled]  = useState(false);
  const [menuOpen,   setMenuOpen]   = useState(false);
  const [dropOpen,   setDropOpen]   = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    setDropOpen(false);
    await logout();
    window.location.href = '/';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="container navbar__inner">
        {/* Logo */}
        <a href="/" className="navbar__logo" aria-label="OUTFY Home">OUTFY</a>

        {/* Nav Links */}
        <nav className={`navbar__links ${menuOpen ? 'open' : ''}`} aria-label="Main navigation">
          {NAV_LINKS.map(link => (
            <a key={link.name} href={link.path} className="navbar__link">{link.name}</a>
          ))}
        </nav>

        {/* Actions */}
        <div className="navbar__actions">
          <a href="/profile?tab=wishlist" className="navbar__icon-btn" aria-label="Wishlist" id="navbar-wishlist">
            <WishlistIcon />
          </a>

          {/* Cart */}
          <button
            className="navbar__cart-btn"
            aria-label={`Cart, ${cartCount} items`}
            id="navbar-cart"
            onClick={() => setCartOpen(true)}
          >
            <CartIcon />
            {cartCount > 0 && <span className="navbar__cart-badge">{cartCount}</span>}
          </button>

          {/* Auth — don't flash during loading */}
          {!loading && (
            user ? (
              /* User Dropdown */
              <div className="navbar__user-wrap" ref={dropRef}>
                <button
                  className="navbar__avatar-btn"
                  id="navbar-account"
                  aria-label="Account menu"
                  aria-expanded={dropOpen}
                  onClick={() => setDropOpen(v => !v)}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="navbar__avatar-img" />
                  ) : (
                    <span className="navbar__avatar-initials">{getInitials(user.name)}</span>
                  )}
                </button>

                {dropOpen && (
                  <div className="navbar__dropdown" role="menu">
                    <div className="navbar__dropdown-user">
                      <p className="navbar__dropdown-name">{user.name}</p>
                      <p className="navbar__dropdown-email">{user.email}</p>
                    </div>
                    <div className="navbar__dropdown-divider" />
                    <a href="/profile" className="navbar__dropdown-item" role="menuitem" onClick={() => setDropOpen(false)}>
                      <ProfileIcon /> Profile
                    </a>
                    <a href="/profile?tab=orders" className="navbar__dropdown-item" role="menuitem" onClick={() => setDropOpen(false)}>
                      <OrdersIcon /> My Orders
                    </a>
                    <div className="navbar__dropdown-divider" />
                    <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout} role="menuitem" id="navbar-logout">
                      <LogoutIcon /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Sign In Button */
              <a href="/auth" className="navbar__signin-btn" id="navbar-signin">
                Sign In
              </a>
            )
          )}

          <button
            className="navbar__menu-btn"
            aria-label="Toggle menu"
            id="navbar-menu"
            onClick={() => setMenuOpen(v => !v)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>
    </header>
  );
}
