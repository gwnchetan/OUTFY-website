import React from 'react';
import '../../styles/home.css';
import './FeaturedSection.css';
import { useReveal } from '../../hooks/useReveal';

const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function FeaturedSection() {
  const textRef = useReveal({ threshold: 0.15 });
  const gridRef = useReveal({ threshold: 0.12, rootMargin: '0px 0px -20px 0px' });

  return (
    <section className="featured section" id="editorial" aria-labelledby="featured-title">
      <div className="container featured__inner">

        <div ref={textRef} className="featured__text reveal reveal-left">
          <p className="section-label">Featured</p>
          <h2 id="featured-title" className="section-title">
            It's About<br />
            <em>Moments</em> ©{new Date().getFullYear()}
          </h2>
          <p className="section-subtitle">
            Every piece in our collection tells a story. Designed for life's most
            beautiful moments — effortless, intentional, and unmistakably you.
          </p>
          <a href="#collections" className="btn btn--ghost featured__cta" id="featured-learn-more">
            Learn more <ArrowIcon />
          </a>
          <div className="featured__stat">
            <span className="featured__stat-num">(45%)</span>
            <span className="featured__stat-text">Off on selected styles this season</span>
          </div>
        </div>

        <div ref={gridRef} className="featured__grid reveal reveal-right">
          <div className="featured__img-main">
            <img src="/featured-moment.png" alt="Fashion moment editorial" />
            <div className="featured__img-caption">Tula Elegante Serenita</div>
          </div>
          <div className="featured__img-side">
            <img src="/prod-dress.png" alt="Premium dress collection" />
            <div className="featured__img-label">Being Part Of Our Journey</div>
          </div>
        </div>

      </div>
    </section>
  );
}
