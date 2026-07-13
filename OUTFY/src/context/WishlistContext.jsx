import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

import { API_BASE } from '../config/api';

const API = `${API_BASE}/user`;

const WishlistContext = createContext(null);

const WISH_STORAGE_KEY = 'outfy_guest_wishlist';

function loadGuestWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISH_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const { user, authFetch } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);

  // ── Load wishlist on user change ─────────────────────────────
  useEffect(() => {
    if (user) {
      authFetch(`${API}/wishlist`)
        .then(r => r.json())
        .then(ids => setWishlistIds(Array.isArray(ids) ? ids : []))
        .catch(() => setWishlistIds([]));
    } else {
      setWishlistIds(loadGuestWishlist());
    }
  }, [user]);

  // ── Persist guest wishlist ────────────────────────────────────
  useEffect(() => {
    if (!user) localStorage.setItem(WISH_STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds, user]);

  const isWishlisted = useCallback((productId) => wishlistIds.includes(String(productId)), [wishlistIds]);

  const toggleWishlist = useCallback(async (productId) => {
    const id = String(productId);
    if (user) {
      const res  = await authFetch(`${API}/wishlist/${id}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) setWishlistIds(data.wishlist);
    } else {
      setWishlistIds(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      );
    }
  }, [user, authFetch]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside <WishlistProvider>');
  return ctx;
}
