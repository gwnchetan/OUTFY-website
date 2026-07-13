import { useState, useEffect, useCallback, useRef } from 'react';

import { API_BASE } from '../config/api';

const API = `${API_BASE}/products`;

/**
 * useProducts — Fetch products from the backend API
 *
 * @param {object} params
 * @param {string}  params.category  — category filter ('All' or specific)
 * @param {string}  params.search    — search query string
 * @param {string}  params.sort      — 'newest' | 'price_asc' | 'price_desc' | 'popular'
 * @param {number}  params.page      — page number (1-indexed)
 * @param {number}  params.limit     — items per page
 */
export function useProducts({ category = 'All', search = '', sort = 'newest', page = 1, limit = 20 } = {}) {
  const [products,   setProducts]   = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const abortRef = useRef(null);

  const fetchProducts = useCallback(async () => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (category && category !== 'All') params.set('category', category);
      if (search.trim()) params.set('search', search.trim());
      if (sort)  params.set('sort',  sort);
      if (page)  params.set('page',  page);
      if (limit) params.set('limit', limit);

      const res  = await fetch(`${API}?${params.toString()}`, { signal: abortRef.current.signal });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Failed to fetch products');

      setProducts(data.products || []);
      setPagination(data.pagination || null);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Something went wrong');
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  }, [category, search, sort, page, limit]);

  useEffect(() => {
    fetchProducts();
    return () => { if (abortRef.current) abortRef.current.abort(); };
  }, [fetchProducts]);

  return { products, pagination, loading, error, refetch: fetchProducts };
}

/**
 * useFeaturedProducts — Fetch featured products
 */
export function useFeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`${API}/featured`, { signal: controller.signal })
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { if (err.name !== 'AbortError') { setError(err.message); setLoading(false); } });
    return () => controller.abort();
  }, []);

  return { products, loading, error };
}

/**
 * useCategories — Fetch product categories with counts
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(data => { setCategories(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return { categories, loading };
}
