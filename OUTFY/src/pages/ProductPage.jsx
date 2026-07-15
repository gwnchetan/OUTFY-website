import React, { useState, useEffect } from 'react';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import Product from '../components/products/Product';
import { API_BASE } from '../config/api';
import { fetchJson, peekJson } from '../lib/apiClient';

export default function ProductPage() {
  // Get product id from URL: /product/SOME_ID
  const id = window.location.pathname.split('/product/')[1];
  const requestUrl = id ? `${API_BASE}/products/${encodeURIComponent(id)}` : null;
  const cached = requestUrl ? peekJson(requestUrl) : null;
  const [product, setProduct] = useState(() => cached);
  const [loading, setLoading] = useState(() => !cached);

  useEffect(() => {
    if (!requestUrl) return undefined;
    const controller = new AbortController();
    const cachedProduct = peekJson(requestUrl);
    if (cachedProduct) setProduct(cachedProduct);
    setLoading(!cachedProduct);

    fetchJson(requestUrl, { signal: controller.signal, ttl: 5 * 60_000 })
      .then(setProduct)
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [requestUrl]);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px', minHeight: '60vh' }}>
        {loading && (
          <p style={{ textAlign: 'center', padding: '4rem', color: '#999', fontSize: '14px' }}>
            Loading…
          </p>
        )}
        {!loading && product && <Product product={product} />}
        {!loading && !product && (
          <p style={{ textAlign: 'center', padding: '4rem', color: '#999', fontSize: '14px' }}>
            Product not found.
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}
