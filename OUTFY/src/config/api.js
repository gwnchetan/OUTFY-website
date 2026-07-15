/**
 * api.js — Single source of truth for the API base URL.
 *
 * In development: falls back to http://localhost:5000/api
 * In production:  uses the VITE_API_URL environment variable set in Vercel
 *
 * Usage:
 *   import { API_BASE } from '../config/api';
 *   fetch(`${API_BASE}/products`)
 */

const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Normalise: strip any trailing slash
export const API_BASE = raw.endsWith('/') ? raw.slice(0, -1) : raw;

// Start the cross-origin connection while application modules load. On a cold
// Render instance this cannot remove the wake-up time, but it does remove a
// separate DNS/TLS round trip from the first catalogue request.
if (typeof document !== 'undefined') {
  try {
    const origin = new URL(API_BASE).origin;
    if (!document.head.querySelector(`link[data-api-origin="${origin}"]`)) {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.dataset.apiOrigin = origin;
      document.head.appendChild(link);
    }
  } catch {
    // A malformed local variable should not prevent the UI from rendering.
  }
}
