import React, { useState, useEffect } from 'react';
import Item from './Item';
import './Items.css';
import { API_BASE } from '../../config/api';
import { fetchJson } from '../../lib/apiClient';

const Items = ({ limit = 40 }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    fetchJson(`${API_BASE}/products?limit=${limit}`, { signal: controller.signal })
      .then(data => setProducts(data.products ?? []))
      .catch(() => {});
    return () => controller.abort();
  }, [limit]);

  return (
    <div id="products" className="items-grid">
      {products.map(product => (
        <Item key={product._id} product={product} />
      ))}
    </div>
  );
};

export default Items;
