import React from 'react';
import { useCart } from '../../context/CartContext';
import './CartDrawer.css';

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const BagIcon = () => (
  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

export default function CartDrawer() {
  const { cartItems, cartCount, cartTotal, cartOpen, setCartOpen, updateQty, removeFromCart, clearCart } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={`cart-overlay ${cartOpen ? 'cart-overlay--visible' : ''}`}
        onClick={() => setCartOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside className={`cart-drawer ${cartOpen ? 'cart-drawer--open' : ''}`} aria-label="Shopping cart">
        {/* Header */}
        <div className="cart-drawer__header">
          <div className="cart-drawer__title-wrap">
            <h2 className="cart-drawer__title">Your Bag</h2>
            {cartCount > 0 && (
              <span className="cart-drawer__count">{cartCount} {cartCount === 1 ? 'item' : 'items'}</span>
            )}
          </div>
          <button className="cart-drawer__close" onClick={() => setCartOpen(false)} aria-label="Close cart" id="cart-close-btn">
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        {cartItems.length === 0 ? (
          <div className="cart-drawer__empty">
            <div className="cart-drawer__empty-icon"><BagIcon /></div>
            <p className="cart-drawer__empty-title">Your bag is empty</p>
            <p className="cart-drawer__empty-sub">Add some pieces you love</p>
            <button
              className="cart-drawer__shop-btn"
              onClick={() => setCartOpen(false)}
              id="cart-continue-shopping"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="cart-drawer__items">
              {cartItems.map(item => (
                <div key={item._id} className="cart-item">
                  <div className="cart-item__img-wrap">
                    {item.img
                      ? <img src={item.img} alt={item.name} className="cart-item__img" />
                      : <div className="cart-item__img-placeholder" />
                    }
                  </div>
                  <div className="cart-item__details">
                    <p className="cart-item__name">{item.name}</p>
                    {item.size && <p className="cart-item__size">Size: {item.size}</p>}
                    <p className="cart-item__price">₹{(item.price * item.qty).toLocaleString()}</p>
                    <div className="cart-item__controls">
                      <div className="cart-item__qty">
                        <button
                          className="cart-item__qty-btn"
                          onClick={() => updateQty(item._id, item.qty - 1)}
                          aria-label="Decrease quantity"
                        >−</button>
                        <span className="cart-item__qty-num">{item.qty}</span>
                        <button
                          className="cart-item__qty-btn"
                          onClick={() => updateQty(item._id, item.qty + 1)}
                          aria-label="Increase quantity"
                        >+</button>
                      </div>
                      <button
                        className="cart-item__remove"
                        onClick={() => removeFromCart(item._id)}
                        aria-label="Remove item"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="cart-drawer__footer">
              <div className="cart-drawer__subtotal">
                <span>Subtotal</span>
                <span className="cart-drawer__total-amount">₹{cartTotal.toLocaleString()}</span>
              </div>
              <p className="cart-drawer__tax-note">Taxes and shipping calculated at checkout</p>
              <button
                className="cart-drawer__checkout-btn"
                onClick={() => {
                  setCartOpen(false);
                  window.location.href = '/checkout';
                }}
                id="cart-checkout-btn"
              >
                Proceed to Checkout →
              </button>
              <button className="cart-drawer__clear-btn" onClick={clearCart} id="cart-clear-btn">
                Clear bag
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
