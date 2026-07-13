import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { API_BASE } from '../config/api';

const API = `${API_BASE}/user`;

const CartContext = createContext(null);

const CART_STORAGE_KEY = 'outfy_guest_cart';

function loadGuestCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveGuestCart(items) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const { user, authFetch } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen]   = useState(false);

  // ── Load cart on user change ─────────────────────────────────
  useEffect(() => {
    if (user) {
      authFetch(`${API}/cart`)
        .then(r => r.json())
        .then(items => setCartItems(Array.isArray(items) ? items : []))
        .catch(() => setCartItems([]));
    } else {
      setCartItems(loadGuestCart());
    }
  }, [user]);

  // ── Persist guest cart to localStorage ───────────────────────
  useEffect(() => {
    if (!user) saveGuestCart(cartItems);
  }, [cartItems, user]);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.qty || 1), 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);

  // ── Add to cart ─────────────────────────────────────────────
  const addToCart = useCallback(async (product, size = '') => {
    if (user) {
      const res  = await authFetch(`${API}/cart`, {
        method: 'POST',
        body:   JSON.stringify({ ...product, size }),
      });
      const data = await res.json();
      if (res.ok) setCartItems(data.cart);
    } else {
      setCartItems(prev => {
        const idx = prev.findIndex(i => i.productId === product.productId && i.size === size);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], qty: next[idx].qty + (product.qty || 1) };
          return next;
        }
        return [...prev, { ...product, size, _id: Date.now().toString() }];
      });
    }
    setCartOpen(true);
  }, [user, authFetch]);

  // ── Update qty ───────────────────────────────────────────────
  const updateQty = useCallback(async (itemId, qty) => {
    if (user) {
      const res  = await authFetch(`${API}/cart/${itemId}`, {
        method: 'PUT',
        body:   JSON.stringify({ qty }),
      });
      const data = await res.json();
      if (res.ok) setCartItems(data.cart);
    } else {
      setCartItems(prev =>
        qty < 1
          ? prev.filter(i => i._id !== itemId)
          : prev.map(i => i._id === itemId ? { ...i, qty } : i)
      );
    }
  }, [user, authFetch]);

  // ── Remove item ──────────────────────────────────────────────
  const removeFromCart = useCallback(async (itemId) => {
    if (user) {
      const res  = await authFetch(`${API}/cart/${itemId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) setCartItems(data.cart);
    } else {
      setCartItems(prev => prev.filter(i => i._id !== itemId));
    }
  }, [user, authFetch]);

  // ── Clear cart ───────────────────────────────────────────────
  const clearCart = useCallback(async () => {
    if (user) {
      await authFetch(`${API}/cart`, { method: 'DELETE' });
    }
    setCartItems([]);
  }, [user, authFetch]);

  return (
    <CartContext.Provider value={{
      cartItems, cartCount, cartTotal,
      addToCart, updateQty, removeFromCart, clearCart,
      cartOpen, setCartOpen,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
