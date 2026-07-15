import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { API_BASE } from '../config/api';
import { fetchJson, peekJson } from '../lib/apiClient';

const API = `${API_BASE}/products`;

export function buildProductsUrl({ category = 'All', search = '', sort = 'newest', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'All') params.set('category', category);
  if (search.trim()) params.set('search', search.trim());
  if (sort) params.set('sort', sort);
  if (page) params.set('page', page);
  if (limit) params.set('limit', limit);
  return `${API}?${params.toString()}`;
}

/** Loads catalog pages with a short session cache and automatic request de-duplication. */
export function useProducts({ category = 'All', search = '', sort = 'newest', page = 1, limit = 20 } = {}) {
  const requestUrl = useMemo(
    () => buildProductsUrl({ category, search, sort, page, limit }),
    [category, search, sort, page, limit],
  );
  const initial = peekJson(requestUrl);
  const [products, setProducts] = useState(() => initial?.products || []);
  const [pagination, setPagination] = useState(() => initial?.pagination || null);
  const [loading, setLoading] = useState(() => !initial);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const fetchProducts = useCallback(async (force = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const cached = !force && peekJson(requestUrl);
    setLoading(!cached);
    setError(null);
    if (cached) {
      setProducts(cached.products || []);
      setPagination(cached.pagination || null);
    }

    try {
      const data = await fetchJson(requestUrl, {
        signal: controller.signal,
        ttl: 90_000,
        force,
      });
      if (!controller.signal.aborted) {
        setProducts(data.products || []);
        setPagination(data.pagination || null);
      }
    } catch (err) {
      if (err.name !== 'AbortError' && !controller.signal.aborted) {
        setError(err.message || 'Something went wrong');
        if (!cached) {
          setProducts([]);
          setPagination(null);
        }
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [requestUrl]);

  useEffect(() => {
    void fetchProducts();
    return () => abortRef.current?.abort();
  }, [fetchProducts]);

  return { products, pagination, loading, error, refetch: () => fetchProducts(true) };
}

export function useFeaturedProducts() {
  const requestUrl = `${API}/featured`;
  const initial = peekJson(requestUrl);
  const [products, setProducts] = useState(() => initial || []);
  const [loading, setLoading] = useState(() => !initial);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const cached = peekJson(requestUrl);
    if (cached) setProducts(cached);
    setLoading(!cached);

    fetchJson(requestUrl, { signal: controller.signal, ttl: 5 * 60_000 })
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch((err) => {
        if (err.name !== 'AbortError' && !cached) setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [requestUrl]);

  return { products, loading, error };
}

export function useCategories() {
  const requestUrl = `${API}/categories`;
  const initial = peekJson(requestUrl);
  const [categories, setCategories] = useState(() => initial || []);
  const [loading, setLoading] = useState(() => !initial);

  useEffect(() => {
    const controller = new AbortController();
    const cached = peekJson(requestUrl);
    if (cached) setCategories(cached);
    setLoading(!cached);

    fetchJson(requestUrl, { signal: controller.signal, ttl: 5 * 60_000 })
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [requestUrl]);

  return { categories, loading };
}
