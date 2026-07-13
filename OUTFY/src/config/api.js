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
