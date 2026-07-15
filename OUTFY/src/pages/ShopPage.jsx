import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { Poster } from '../components/store/Posters';
import Item from '../components/store/Item';
import { useProducts, useCategories } from '../hooks/useProducts';
import './ShopPage.css';

// ── Icons ────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const ClearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);
const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);
const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="9 6 15 12 9 18" />
  </svg>
);
const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

// ── Sort options ─────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'popular',    label: 'Most Popular' },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
];

const ITEMS_PER_PAGE = 12;

export default function ShopPage() {
  // ── State ─────────────────────────────────────────────────
  const [category, setCategory] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('category') || 'All';
  });
  const [search, setSearch]     = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort]         = useState('newest');
  const [page, setPage]         = useState(1);
  const [sortOpen, setSortOpen] = useState(false);
  const [gridCols, setGridCols] = useState(4); // 4 = grid, 3 = large cards
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const sortRef = useRef(null);
  const searchTimer = useRef(null);
  const resultsRef = useRef(null);

  // ── Data hooks ────────────────────────────────────────────
  const { categories } = useCategories();
  const { products, pagination, loading, error } = useProducts({
    category, search, sort, page, limit: ITEMS_PER_PAGE,
  });

  // ── Sync category back to URL query parameters ────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (category && category !== 'All') {
      params.set('category', category);
    } else {
      params.delete('category');
    }
    const newPath = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState(null, '', newPath);
  }, [category]);

  // ── Reset page when filters change ────────────────────────
  useEffect(() => { setPage(1); }, [category, search, sort]);

  // ── Debounced search ──────────────────────────────────────
  const handleSearchInput = useCallback((value) => {
    setSearchInput(value);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setSearch(value), 400);
  }, []);

  // ── Close sort dropdown on outside click ──────────────────
  useEffect(() => {
    const handleClick = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ── Scroll to results on page change ──────────────────────
  useEffect(() => {
    if (page > 1 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page]);

  // ── Clear all filters ─────────────────────────────────────
  const clearFilters = () => {
    setCategory('All');
    setSearch('');
    setSearchInput('');
    setSort('newest');
    setPage(1);
  };

  const hasActiveFilters = category !== 'All' || search || sort !== 'newest';
  const currentSortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || 'Sort';

  // ── Category list with "All" prepended ────────────────────
  const allCategories = [{ name: 'All', count: pagination?.total || 0 }, ...categories];

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: '80px' }}>
        {/* ── Hero Poster ──────────────────────────────────── */}
        <div className="shop-page__container">
          <Poster id={2} />
        </div>

        {/* ── Toolbar ──────────────────────────────────────── */}
        <div className="shop-page__container" ref={resultsRef}>
          <div className="shop-toolbar">
            {/* Left: title + result count */}
            <div className="shop-toolbar__left">
              <h1 className="shop-toolbar__title">Shop</h1>
              {pagination && !loading && (
                <span className="shop-toolbar__count">
                  {pagination.total} product{pagination.total !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* Right: search + sort + grid toggle */}
            <div className="shop-toolbar__right">
              {/* Search */}
              <div className="shop-search" id="shop-search">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search products…"
                  value={searchInput}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="shop-search__input"
                  id="shop-search-input"
                />
                {searchInput && (
                  <button
                    className="shop-search__clear"
                    onClick={() => { setSearchInput(''); setSearch(''); }}
                    aria-label="Clear search"
                    id="shop-search-clear"
                  >
                    <ClearIcon />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="shop-sort" ref={sortRef} id="shop-sort">
                <button
                  className="shop-sort__btn"
                  onClick={() => setSortOpen(v => !v)}
                  aria-expanded={sortOpen}
                  id="shop-sort-btn"
                >
                  <span>{currentSortLabel}</span>
                  <ChevronDown />
                </button>
                {sortOpen && (
                  <div className="shop-sort__dropdown" role="listbox">
                    {SORT_OPTIONS.map(opt => (
                      <button
                        key={opt.value}
                        className={`shop-sort__option ${sort === opt.value ? 'active' : ''}`}
                        onClick={() => { setSort(opt.value); setSortOpen(false); }}
                        role="option"
                        aria-selected={sort === opt.value}
                        id={`shop-sort-${opt.value}`}
                      >
                        {opt.label}
                        {sort === opt.value && <span className="shop-sort__check">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Grid toggle */}
              <div className="shop-grid-toggle" id="shop-grid-toggle">
                <button
                  className={`shop-grid-toggle__btn ${gridCols === 4 ? 'active' : ''}`}
                  onClick={() => setGridCols(4)}
                  aria-label="4-column grid"
                  id="shop-grid-4"
                >
                  <GridIcon />
                </button>
                <button
                  className={`shop-grid-toggle__btn ${gridCols === 3 ? 'active' : ''}`}
                  onClick={() => setGridCols(3)}
                  aria-label="3-column grid"
                  id="shop-grid-3"
                >
                  <ListIcon />
                </button>
              </div>

              {/* Mobile filter toggle */}
              <button
                className="shop-mobile-filter-btn"
                onClick={() => setMobileFiltersOpen(v => !v)}
                aria-label="Toggle filters"
                id="shop-mobile-filter-btn"
              >
                <FilterIcon />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* ── Active filters pill bar ─────────────────────── */}
          {hasActiveFilters && (
            <div className="shop-active-filters">
              {category !== 'All' && (
                <button className="shop-filter-pill" onClick={() => setCategory('All')}>
                  {category} <ClearIcon />
                </button>
              )}
              {search && (
                <button className="shop-filter-pill" onClick={() => { setSearch(''); setSearchInput(''); }}>
                  "{search}" <ClearIcon />
                </button>
              )}
              {sort !== 'newest' && (
                <button className="shop-filter-pill" onClick={() => setSort('newest')}>
                  {currentSortLabel} <ClearIcon />
                </button>
              )}
              <button className="shop-filter-pill shop-filter-pill--clear" onClick={clearFilters}>
                Clear All
              </button>
            </div>
          )}

          {/* ── Main layout: sidebar + grid ─────────────────── */}
          <div className="shop-layout">
            {/* Sidebar — categories */}
            <aside className={`shop-sidebar ${mobileFiltersOpen ? 'shop-sidebar--open' : ''}`} id="shop-sidebar">
              <div className="shop-sidebar__header">
                <h3 className="shop-sidebar__title">Categories</h3>
                <button
                  className="shop-sidebar__close"
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Close filters"
                >
                  <ClearIcon />
                </button>
              </div>

              <div className="shop-sidebar__list">
                {allCategories.map(cat => (
                  <button
                    key={cat.name}
                    className={`shop-sidebar__item ${category === cat.name ? 'active' : ''}`}
                    onClick={() => { setCategory(cat.name); setMobileFiltersOpen(false); }}
                    id={`shop-category-${cat.name.replace(/\s+/g, '-').toLowerCase()}`}
                  >
                    <span className="shop-sidebar__item-name">{cat.name}</span>
                    <span className="shop-sidebar__item-count">{cat.count}</span>
                  </button>
                ))}
              </div>
            </aside>

            {/* Mobile overlay */}
            {mobileFiltersOpen && (
              <div
                className="shop-sidebar-overlay"
                onClick={() => setMobileFiltersOpen(false)}
              />
            )}

            {/* Product Grid */}
            <div className="shop-grid-area">
              {/* Loading state */}
              {loading && (
                <div className="shop-loading">
                  <div className="shop-loading__grid">
                    {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                      <div key={i} className="shop-skeleton">
                        <div className="shop-skeleton__img" />
                        <div className="shop-skeleton__text" />
                        <div className="shop-skeleton__text shop-skeleton__text--short" />
                        <div className="shop-skeleton__text shop-skeleton__text--price" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error state */}
              {!loading && error && (
                <div className="shop-empty">
                  <div className="shop-empty__icon">⚠️</div>
                  <h3 className="shop-empty__title">Something went wrong</h3>
                  <p className="shop-empty__desc">{error}</p>
                  <button className="shop-empty__btn" onClick={clearFilters}>Reset Filters</button>
                </div>
              )}

              {/* Empty state */}
              {!loading && !error && products.length === 0 && (
                <div className="shop-empty">
                  <div className="shop-empty__icon">🔍</div>
                  <h3 className="shop-empty__title">No products found</h3>
                  <p className="shop-empty__desc">
                    {search
                      ? `No results for "${search}". Try a different search term.`
                      : 'No products in this category yet.'}
                  </p>
                  <button className="shop-empty__btn" onClick={clearFilters}>Clear Filters</button>
                </div>
              )}

              {/* Product grid */}
              {!loading && !error && products.length > 0 && (
                <div
                  className="shop-products-grid"
                  style={{ '--shop-cols': gridCols }}
                  id="shop-products-grid"
                >
                  {products.map(product => (
                    <Item key={product._id} product={product} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && pagination && pagination.totalPages > 1 && (
                <div className="shop-pagination" id="shop-pagination">
                  <button
                    className="shop-pagination__btn"
                    disabled={page <= 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    aria-label="Previous page"
                    id="shop-page-prev"
                  >
                    <ChevronLeft />
                    <span>Prev</span>
                  </button>

                  <div className="shop-pagination__pages">
                    {generatePageNumbers(page, pagination.totalPages).map((p, i) =>
                      p === '...' ? (
                        <span key={`dots-${i}`} className="shop-pagination__dots">…</span>
                      ) : (
                        <button
                          key={p}
                          className={`shop-pagination__page ${page === p ? 'active' : ''}`}
                          onClick={() => setPage(p)}
                          aria-label={`Page ${p}`}
                          aria-current={page === p ? 'page' : undefined}
                          id={`shop-page-${p}`}
                        >
                          {p}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    className="shop-pagination__btn"
                    disabled={page >= pagination.totalPages}
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    aria-label="Next page"
                    id="shop-page-next"
                  >
                    <span>Next</span>
                    <ChevronRight />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ── Helper: generate page number array with ellipsis ────────
function generatePageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [];
  pages.push(1);

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');

  pages.push(total);
  return pages;
}
