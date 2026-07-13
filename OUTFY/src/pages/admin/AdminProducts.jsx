import React, { useState, useEffect } from 'react';
import AdminProductForm from './AdminProductForm';
import { API_BASE } from '../../config/api';
import './AdminProducts.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
        }
      });
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts(products.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleFormClose = (shouldRefresh) => {
    setIsFormOpen(false);
    setEditingProduct(null);
    if (shouldRefresh) {
      fetchProducts();
    }
  };

  if (loading) return <div className="loading-spinner">Loading products...</div>;
  if (error) return <div className="admin-unauthorized"><h2>Error</h2><p>{error}</p></div>;

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <div>
          <h1>Products</h1>
          <p>Manage your store's inventory and product details.</p>
        </div>
        <button className="add-product-btn" onClick={handleAddNew}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"></path></svg>
          Add Product
        </button>
      </div>

      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product._id}>
                <td>
                  <div className="product-cell">
                    <img src={product.images[0] || 'https://via.placeholder.com/48'} alt={product.name} />
                    <div className="product-name-col">
                      <p>{product.name}</p>
                      <span>{product.colors?.join(', ') || 'No Colors'}</span>
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>
                  <span style={{ color: product.stock <= 5 ? (product.stock === 0 ? '#f87171' : '#facc15') : '#f8fafc' }}>
                    {product.stock}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${product.isActive ? 'active' : 'inactive'}`}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="action-btn edit" onClick={() => handleEdit(product)} title="Edit">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(product._id)} title="Delete">
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px' }}>No products found. Add one!</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isFormOpen && (
        <AdminProductForm 
          product={editingProduct} 
          onClose={handleFormClose} 
        />
      )}
    </div>
  );
}
