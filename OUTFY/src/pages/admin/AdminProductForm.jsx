import React, { useState, useEffect } from 'react';
import { API_BASE } from '../../config/api';
import { invalidateJson } from '../../lib/apiClient';
import './AdminProductForm.css';

export default function AdminProductForm({ product, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'New Arrival',
    price: '',
    comparePrice: '',
    stock: 0,
    isActive: true,
    isFeatured: false,
    badge: '',
    images: '' // we'll use comma-separated string for simple input
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        category: product.category || 'New Arrival',
        price: product.price || '',
        comparePrice: product.comparePrice || '',
        stock: product.stock || 0,
        isActive: product.isActive !== undefined ? product.isActive : true,
        isFeatured: product.isFeatured || false,
        badge: product.badge || '',
        images: product.images?.join(', ') || ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Process data
    const payload = { ...formData };
    payload.price = parseFloat(payload.price);
    if (payload.comparePrice) payload.comparePrice = parseFloat(payload.comparePrice);
    else payload.comparePrice = null;
    
    payload.stock = parseInt(payload.stock, 10);
    payload.images = payload.images.split(',').map(img => img.trim()).filter(Boolean);

    try {
      const url = product 
        ? `${API_BASE}/admin/products/${product._id}`
        : `${API_BASE}/admin/products`;
        
      const res = await fetch(url, {
        method: product ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Error saving product');
      }

      invalidateJson(`${API_BASE}/products`);
      onClose(true); // Close and refresh
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="close-btn" onClick={() => onClose(false)}>
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Product Name</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} />
              </div>
              
              <div className="form-group full-width">
                <label>Description</label>
                <textarea name="description" rows="3" value={formData.description} onChange={handleChange}></textarea>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select name="category" value={formData.category} onChange={handleChange}>
                  <option value="New Arrival">New Arrival</option>
                  <option value="Dresses">Dresses</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Knitwear">Knitwear</option>
                  <option value="Shoes">Shoes</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="form-group">
                <label>Badge</label>
                <select name="badge" value={formData.badge} onChange={handleChange}>
                  <option value="">None</option>
                  <option value="New">New</option>
                  <option value="Sale">Sale</option>
                  <option value="Hot">Hot</option>
                  <option value="Limited">Limited</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price ($)</label>
                <input type="number" step="0.01" name="price" required min="0" value={formData.price} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Compare Price ($)</label>
                <input type="number" step="0.01" name="comparePrice" min="0" value={formData.comparePrice} onChange={handleChange} />
              </div>

              <div className="form-group">
                <label>Stock Quantity</label>
                <input type="number" name="stock" required min="0" value={formData.stock} onChange={handleChange} />
              </div>

              <div className="form-group full-width">
                <label>Image URLs (comma separated)</label>
                <input type="text" name="images" placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg" value={formData.images} onChange={handleChange} />
              </div>

              <div className="checkbox-group">
                <input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} />
                <label htmlFor="isActive">Active (Visible in store)</label>
              </div>

              <div className="checkbox-group">
                <input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
                <label htmlFor="isFeatured">Featured Product</label>
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={() => onClose(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}
