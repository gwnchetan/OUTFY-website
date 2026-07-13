import React from 'react';
import '../../styles/home.css';
import './HeroSection.css';
import { useReveal } from '../../hooks/useReveal';

const ArrowIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const AVATARS = [
  { id: 1, color: '#E8C97A' },
  { id: 2, color: '#C4B5A5' },
  { id: 3, color: '#A09080' },
  { id: 4, color: '#7A6F62' },
];

export default function HeroSection() {
  const leftRef  = useReveal({ threshold: 0.1 });
  const imgRef   = useReveal({ threshold: 0.1, rootMargin: '0px' });
  const rightRef = useReveal({ threshold: 0.1 });

  return (
    <section className="hero" aria-label="Hero">
      <div className="hero__bg-text" aria-hidden="true">#FASHION</div>

      <div className="container hero__inner">
        {/* Left text */}
        <div ref={leftRef} className="hero__left reveal reveal-left">
          <div className="tag hero__tag">NEW ARRIVALS ©{new Date().getFullYear()}</div>
          <h1 className="hero__heading">
            <span className="hero__heading-main">Always</span>
          </h1>
          <p className="hero__desc">
            Step into a world where less is truly more. Our collection is a celebration
            of clean lines, neutral tones.
          </p>
          <a href="#shop" className="btn btn--primary hero__cta" id="hero-shop-btn">
            Shop Now <ArrowIcon />
          </a>
          <div className="hero__stats">
            <div className="hero__stat">
              <span className="hero__stat-num">320K</span>
              <span className="hero__stat-label">Happy Customers</span>
            </div>
            <div className="hero__stat-div" />
            <div className="hero__stat">
              <div className="hero__avatars">
                {AVATARS.map(a => (
                  <div key={a.id} className="hero__avatar" style={{ background: a.color }} />
                ))}
              </div>
              <span className="hero__stat-label">Trusted Worldwide</span>
            </div>
          </div>
        </div>

        {/* Center image */}
        <div ref={imgRef} className="hero__image-wrap reveal reveal-scale">
          <div className="hero__image-tag" aria-hidden="true">
            <span className="hero__image-tag-dot" />
            Premium Collection
          </div>
          <img src="/hero-model.png" alt="OUTFY hero model in vibrant fashion" className="hero__image" />
          <div className="hero__image-glow" aria-hidden="true" />
        </div>

        {/* Right text */}
        <div ref={rightRef} className="hero__right reveal reveal-right" aria-hidden="true">
          <span className="hero__right-text">— Style</span>
          <span className="hero__right-text hero__right-text--em">Elegance</span>
        </div>
      </div>

      <div className="hero__scroll" aria-label="Scroll down">
        <span className="hero__scroll-line" />
        <span className="hero__scroll-text">Scroll</span>
      </div>
    </section>
  );
}
