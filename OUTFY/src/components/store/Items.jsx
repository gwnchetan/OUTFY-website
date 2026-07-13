import React, { useState, useEffect } from 'react';
import Item from './item';
import './items.css';
import { API_BASE } from '../../config/api';

const Items = ({ limit = 40 }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/products?limit=${limit}`)
      .then(r => r.json())
      .then(data => setProducts(data.products ?? []))
      .catch(() => {});
  }, []);

  return (
    <div id="products" className="items-grid">
      {products.map(product => (
        <Item key={product._id} product={product} />
      ))}
    </div>
  );
};

export default Items;
