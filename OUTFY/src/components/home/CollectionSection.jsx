import React, { useState, useEffect } from 'react';
import '../../styles/home.css';
import './CollectionSection.css';
import { useReveal } from '../../hooks/useReveal';
import { useWishlist } from '../../context/WishlistContext';

import { API_BASE } from '../../config/api';

const ChevronLeft = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const HeartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z"/>
  </svg>
);

const CATEGORIES = ['New Arrival', 'Dresses', 'Outerwear', 'Knitwear', 'Shoes & Sandal'];

const PRODUCTS = {
  'New Arrival': [
    { id: 1,  name: 'Tula Elegante Serenita', category: 'New Arrival', price: '$270.00', img: '/prod-dress.png',     badge: 'New' },
    { id: 2,  name: 'Camel Wool Overcoat',    category: 'Outerwear',   price: '$395.00', img: '/prod-outerwear.png', badge: 'New' },
    { id: 3,  name: 'Ivory Knit Ensemble',    category: 'Knitwear',    price: '$185.00', img: '/prod-knitwear.png',  badge: '' },
    { id: 4,  name: 'Linen Co-ord Set',       category: 'New Arrival', price: '$225.00', img: '/prod-casual.png',   badge: 'New' },
  ],
  'Dresses': [
    { id: 5,  name: 'Silk Evening Dress',     category: 'Dresses',     price: '$310.00', img: '/prod-dress.png',    badge: '' },
    { id: 6,  name: 'Wrap Midi Dress',        category: 'Dresses',     price: '$240.00', img: '/prod-casual.png',   badge: 'Sale' },
    { id: 7,  name: 'Linen Sun Dress',        category: 'Dresses',     price: '$175.00', img: '/featured-moment.png', badge: '' },
    { id: 8,  name: 'Knit Mini Dress',        category: 'Dresses',     price: '$195.00', img: '/prod-knitwear.png', badge: '' },
  ],
  'Outerwear': [
    { id: 9,  name: 'Camel Wool Coat',        category: 'Outerwear',   price: '$395.00', img: '/prod-outerwear.png', badge: '' },
    { id: 10, name: 'Trench Coat Classic',    category: 'Outerwear',   price: '$420.00', img: '/prod-casual.png',   badge: '' },
    { id: 11, name: 'Oversized Blazer',       category: 'Outerwear',   price: '$285.00', img: '/prod-knitwear.png', badge: 'New' },
    { id: 12, name: 'Puffer Vest',            category: 'Outerwear',   price: '$155.00', img: '/prod-dress.png',    badge: '' },
  ],
  'Knitwear': [
    { id: 13, name: 'Chunky Knit Sweater',    category: 'Knitwear',    price: '$185.00', img: '/prod-knitwear.png', badge: '' },
    { id: 14, name: 'Ribbed Cardigan',        category: 'Knitwear',    price: '$145.00', img: '/prod-dress.png',    badge: 'Sale' },
    { id: 15, name: 'Merino Turtleneck',      category: 'Knitwear',    price: '$165.00', img: '/prod-casual.png',   badge: '' },
    { id: 16, name: 'Cable Knit Vest',        category: 'Knitwear',    price: '$125.00', img: '/prod-outerwear.png',badge: 'New' },
  ],
  'Shoes & Sandal': [
    { id: 17, name: 'Leather Mule Sandals',   category: 'Shoes',       price: '$195.00', img: '/prod-casual.png',   badge: '' },
    { id: 18, name: 'Strappy Heeled Sandal',  category: 'Shoes',       price: '$220.00', img: '/prod-dress.png',    badge: 'New' },
    { id: 19, name: 'Block Heel Mule',        category: 'Shoes',       price: '$175.00', img: '/prod-knitwear.png', badge: '' },
    { id: 20, name: 'Leather Ballet Flat',    category: 'Shoes',       price: '$160.00', img: '/prod-outerwear.png',badge: '' },
  ],
};

function ProductCard({ product }) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const id = product._id || product.id;
  const wished = isWishlisted(String(id));
  const image = product.images?.[0] || product.img || '/prod-dress.png';
  const price = typeof product.price === 'number' ? `₹${Number(product.price).toLocaleString()}` : String(product.price).replace('$', '₹');

  const handleWishToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(String(id));
  };

  return (
    <a href={`/product/${id}`} className="product-card" role="article" aria-label={product.name}>
      <div className="product-card__img-wrap">
        <img src={image} alt={product.name} loading="lazy" />
        {product.badge && <span className="product-card__badge">{product.badge}</span>}
        <button
          className={`product-card__wish ${wished ? 'wished' : ''}`}
          aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          onClick={handleWishToggle}
        >
          <HeartIcon />
        </button>
      </div>
      <div className="product-card__info">
        <p className="product-card__category">{product.category}</p>
        <p className="product-card__name">{product.name}</p>
        <p className="product-card__price">{price}</p>
      </div>
    </a>
  );
}

export default function CollectionSection() {
  const [activeTab, setActiveTab] = useState('New Arrival');
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const headerRef = useReveal({ threshold: 0.15 });

  // ── Fetch dynamic products ─────────────────────────────────
  useEffect(() => {
    let active = true;
    setLoading(true);

    let backendCategory = activeTab;
    if (activeTab === 'Shoes & Sandal') {
      backendCategory = 'Shoes';
    }

    const fetchCategoryProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/products?category=${encodeURIComponent(backendCategory)}&limit=4`);
        if (!res.ok) throw new Error('API error');
        const data = await res.json();
        if (active) {
          setDbProducts(data.products || []);
        }
      } catch (err) {
        console.warn('CollectionSection fetch failed, falling back to static products:', err);
        if (active) {
          setDbProducts([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCategoryProducts();
    return () => { active = false; };
  }, [activeTab]);

  const products = dbProducts.length > 0 ? dbProducts : (PRODUCTS[activeTab] || []);

  // ── Handle entrance animation on load/tab change ──────────
  useEffect(() => {
    if (!loading && products.length > 0) {
      setRevealed(false);
      const timer = setTimeout(() => setRevealed(true), 60);
      return () => clearTimeout(timer);
    }
  }, [loading, products, activeTab]);

  const handlePrevTab = () => {
    const idx = CATEGORIES.indexOf(activeTab);
    const prevIdx = idx === 0 ? CATEGORIES.length - 1 : idx - 1;
    setActiveTab(CATEGORIES[prevIdx]);
  };

  const handleNextTab = () => {
    const idx = CATEGORIES.indexOf(activeTab);
    const nextIdx = idx === CATEGORIES.length - 1 ? 0 : idx + 1;
    setActiveTab(CATEGORIES[nextIdx]);
  };

  const currentCategoryQuery = activeTab === 'Shoes & Sandal' ? 'Shoes' : activeTab;
  const viewAllLink = `/shop?category=${encodeURIComponent(currentCategoryQuery)}`;

  return (
    <section className="collection section--soft section" id="collections" aria-labelledby="collection-title">
      <div className="container">

        <div ref={headerRef} className="collection__header reveal">
          <div>
            <p className="section-label">La Nostra Fashion</p>
            <h2 id="collection-title" className="section-title">Our Collections</h2>
          </div>
          <div className="collection__nav-btns">
            <button className="collection__nav-btn" aria-label="Previous" id="collection-prev" onClick={handlePrevTab}><ChevronLeft /></button>
            <button className="collection__nav-btn" aria-label="Next"     id="collection-next" onClick={handleNextTab}><ChevronRight /></button>
          </div>
        </div>

        <div className="collection__tabs" role="tablist" aria-label="Product categories">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              id={`tab-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              role="tab"
              aria-selected={activeTab === cat}
              className={`collection__tab ${activeTab === cat ? 'active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Container */}
        <div className="collection__grid" role="tabpanel">
          {products.map((product, index) => {
            const cardId = product._id || product.id;
            return (
              <div
                key={cardId}
                className={`reveal ${revealed ? 'revealed' : ''}`}
                style={{ '--stagger': `${index * 80}ms` }}
              >
                <ProductCard product={product} />
              </div>
            );
          })}
        </div>

        <div className="collection__footer">
          <a href={viewAllLink} className="btn btn--outline" id="collection-view-all">View All Collection</a>
        </div>

      </div>
    </section>
  );
}
