import React, { useState, useEffect } from 'react';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import Product from '../components/products/Product';
import { API_BASE } from '../config/api';

export default function ProductPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get product id from URL: /product/SOME_ID
  const id = window.location.pathname.split('/product/')[1];

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/products/${id}`)
      .then(r => r.json())
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

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
