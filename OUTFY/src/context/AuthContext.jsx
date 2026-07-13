import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../config/api';

const API = API_BASE;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]               = useState(null);       // { id, name, email, avatar, phone, authProvider }
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('accessToken'));
  const [loading, setLoading]         = useState(true);       // true while restoring session

  // ── Silent refresh on mount ─────────────────────────────────
  useEffect(() => {
    const restore = async () => {
      try {
        const res = await fetch(`${API}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
            setAccessToken(data.accessToken);
            // Fetch user profile with the new token
            const meRes = await fetch(`${API}/user/me`, {
              headers: { Authorization: `Bearer ${data.accessToken}` },
            });
            if (meRes.ok) {
              const me = await meRes.json();
              setUser({ id: me._id, name: me.name, email: me.email, avatar: me.avatar, phone: me.phone, authProvider: me.authProvider, role: me.role });
            }
          }
        }
      } catch {
        // No valid session — stay logged out
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // ── Login — called after successful auth ────────────────────
  const login = useCallback((data) => {
    // data: { accessToken, user: { id, name, email, avatar } }
    localStorage.setItem('accessToken', data.accessToken);
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  // ── Update user fields locally (after profile edit) ─────────
  const updateUser = useCallback((fields) => {
    setUser(prev => prev ? { ...prev, ...fields } : prev);
  }, []);

  // ── Logout ──────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch { /* ignore */ }
    localStorage.removeItem('accessToken');
    setAccessToken(null);
    setUser(null);
  }, []);

  // ── Authenticated fetch helper ───────────────────────────────
  const authFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('accessToken');
    const res = await fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    // If token expired, try refresh once
    if (res.status === 401) {
      const refreshRes = await fetch(`${API}/auth/refresh`, { method: 'POST', credentials: 'include' });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.accessToken) {
          localStorage.setItem('accessToken', refreshData.accessToken);
          setAccessToken(refreshData.accessToken);
          return fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              ...(options.headers || {}),
              Authorization: `Bearer ${refreshData.accessToken}`,
            },
          });
        }
      }
      // Refresh failed — logout
      logout();
    }
    return res;
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, logout, updateUser, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
