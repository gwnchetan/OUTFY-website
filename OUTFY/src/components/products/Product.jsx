import React, { useState } from 'react';
import './Product.css';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Items from '../store/Items';

// ── Icons ──────────────────────────────────────────────────
const HeartIcon = ({ filled }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" />
    </svg>
);
const ChevronIcon = ({ open }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s' }}>
        <polyline points="6 9 12 15 18 9" />
    </svg>
);
const ClockIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
);
const StarIcon = ({ filled, half }) => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled || half ? '#f59e0b' : 'none'} stroke="#f59e0b" strokeWidth="2">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

// ── Accordion row ──────────────────────────────────────────
function Accordion({ title, children, defaultOpen = false }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="product__accordion">
            <button className="product__accordion-head" onClick={() => setOpen(v => !v)}>
                <span>{title}</span>
                <ChevronIcon open={open} />
            </button>
            {open && <div className="product__accordion-body">{children}</div>}
        </div>
    );
}

// ── Star rating display ────────────────────────────────────
function Stars({ value, size: _size = 14 }) {
    return (
        <div className="product__stars">
            {[1, 2, 3, 4, 5].map(i => (
                <StarIcon key={i} filled={i <= Math.floor(value)} half={i === Math.ceil(value) && value % 1 >= 0.5} />
            ))}
        </div>
    );
}

// ── Rating bars ────────────────────────────────────────────
function RatingBars({ distribution = { 5: 60, 4: 20, 3: 10, 2: 5, 1: 5 } }) {
    return (
        <div className="product__rating-bars">
            {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="product__rating-bar-row">
                    <span className="product__rating-bar-label">{star}</span>
                    <div className="product__rating-bar-track">
                        <div className="product__rating-bar-fill" style={{ width: `${distribution[star] || 0}%` }} />
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Main Product Component ─────────────────────────────────
const Product = ({ product }) => {
    const { addToCart } = useCart();
    const { isWishlisted, toggleWishlist } = useWishlist();

    const [activeImg, setActiveImg] = useState(0);
    const [activeSize, setActiveSize] = useState(null);
    const [adding, setAdding] = useState(false);

    if (!product) return null;

    const id = product._id;
    const images = product.images?.length ? product.images : ['/prod-dress.png'];
    const sizes = product.sizes?.length ? product.sizes : ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    const price = `₹${Number(product.price).toLocaleString()}`;
    const wished = isWishlisted(id);

    // Reviews — use product.rating or mock data
    const rating = product.rating?.average || 4.5;
    const ratingCnt = product.rating?.count || 50;

    // Sample reviews (replace with real API data later)
    const reviews = [
        { id: 1, name: 'Alex Mathie', avatar: null, rating: 5, date: '13 Oct 2024', text: `"Outfy's dedication to sustainability and ethical practices resonates strongly with today's consumers, positioning the brand as a responsible choice in the fashion world."` },
        { id: 2, name: 'Priya Sharma', avatar: null, rating: 4, date: '02 Nov 2024', text: `"Beautiful quality fabric and the fit is exactly as described. Would definitely buy again from OUTFY."` },
    ];

    const handleAddToCart = async () => {
        if (!activeSize) return alert('Please select a size');
        setAdding(true);
        await addToCart({ productId: id, name: product.name, price: product.price, img: images[0], qty: 1, size: activeSize });
        setTimeout(() => setAdding(false), 700);
    };

    return (
        <div className="product">

            {/* ── Left: Image Gallery ── */}
            <div className="product__gallery">
                <div className="product__main-img">
                    <img src={images[activeImg]} alt={product.name} />
                </div>
                {images.length > 1 && (
                    <div className="product__thumbs">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                className={`product__thumb ${i === activeImg ? 'active' : ''}`}
                                onClick={() => setActiveImg(i)}
                            >
                                <img src={img} alt={`View ${i + 1}`} />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Right: Info ── */}
            <div className="product__info">

                {/* Breadcrumb */}
                <nav className="product__breadcrumb" aria-label="Breadcrumb">
                    <a href="/">Home</a>
                    <span>/</span>
                    <span>Product Details</span>
                </nav>

                {/* Category + Title */}
                <p className="product__category-label">{product.category}</p>
                <h1 className="product__title">{product.name}</h1>

                {/* Price */}
                <div className="product__price-row">
                    <span className="product__price">{price}</span>
                    {product.comparePrice && (
                        <span className="product__compare">${Number(product.comparePrice).toFixed(2)}</span>
                    )}
                    {product.badge === 'Sale' && product.comparePrice && (
                        <span className="product__discount-badge">
                            -{Math.round((1 - product.price / product.comparePrice) * 100)}% OFF
                        </span>
                    )}
                </div>

                {/* Delivery note */}
                <p className="product__delivery">
                    <ClockIcon /> Order before midnight for next-day delivery
                </p>

                {/* Size selector */}
                <div className="product__sizes">
                    <p className="product__sizes-label">Select Size</p>
                    <div className="product__size-options">
                        {sizes.map(size => (
                            <button
                                key={size}
                                className={`product__size-btn ${activeSize === size ? 'active' : ''}`}
                                onClick={() => setActiveSize(size)}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Add to Cart + Wishlist */}
                <div className="product__actions">
                    <button
                        className={`product__add-btn ${adding ? 'adding' : ''}`}
                        onClick={handleAddToCart}
                        disabled={adding}
                        id="product-add-to-cart"
                    >
                        {adding ? 'Added to Bag ✓' : 'Add to Cart'}
                    </button>
                    <button
                        className={`product__wish-btn ${wished ? 'wished' : ''}`}
                        onClick={() => toggleWishlist(id)}
                        aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <HeartIcon filled={wished} />
                    </button>
                </div>

                {/* Accordions */}
                <div className="product__accordions">
                    <Accordion title="Description & Fit" defaultOpen={true}>
                        <p className="product__desc-text">
                            {product.description || 'Premium quality piece crafted with care. Designed to fit effortlessly and look great in any setting.'}
                        </p>
                    </Accordion>

                    <Accordion title="Shipping">
                        <div className="product__shipping-grid">
                            <div className="product__shipping-item">
                                <span className="product__shipping-icon">🚚</span>
                                <div>
                                    <p className="product__shipping-key">Free Shipping</p>
                                    <p className="product__shipping-val">On orders above ₹999</p>
                                </div>
                            </div>
                            <div className="product__shipping-item">
                                <span className="product__shipping-icon">📦</span>
                                <div>
                                    <p className="product__shipping-key">Secure Packaging</p>
                                    <p className="product__shipping-val">Damage-free delivery</p>
                                </div>
                            </div>
                            <div className="product__shipping-item">
                                <span className="product__shipping-icon">📅</span>
                                <div>
                                    <p className="product__shipping-key">Dispatch Time</p>
                                    <p className="product__shipping-val">2–4 Working Days</p>
                                </div>
                            </div>
                            <div className="product__shipping-item">
                                <span className="product__shipping-icon">🔄</span>
                                <div>
                                    <p className="product__shipping-key">Easy Returns</p>
                                    <p className="product__shipping-val">Within 14 days</p>
                                </div>
                            </div>
                        </div>
                    </Accordion>
                </div>
            </div>

            {/* ── Rating & Reviews — full width below ── */}
            <div className="product__reviews">
                <h2 className="product__reviews-title">Rating &amp; Reviews</h2>

                <div className="product__reviews-top">
                    {/* Big score */}
                    <div className="product__score">
                        <span className="product__score-num">{rating.toFixed(1).replace('.', ',')}</span>
                        <span className="product__score-denom">/5</span>
                        <p className="product__score-count">({ratingCnt} Reviews)</p>
                    </div>

                    {/* Rating bars */}
                    <RatingBars />
                </div>

                {/* Review cards */}
                <div className="product__review-list">
                    {reviews.map(r => (
                        <div key={r.id} className="product__review-card">
                            <div className="product__review-head">
                                <div className="product__reviewer-avatar">
                                    {r.name.split(' ').map(n => n[0]).join('')}
                                </div>
                                <div>
                                    <p className="product__reviewer-name">{r.name}</p>
                                    <Stars value={r.rating} />
                                </div>
                                <span className="product__review-date">{r.date}</span>
                            </div>
                            <p className="product__review-text">{r.text}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── You Might Also Like ── */}
            <div className="product__related">
                <h2 className="product__related-title">You Might Also Like</h2>
                <Items />
            </div>

        </div>
    );
};

export default Product;
