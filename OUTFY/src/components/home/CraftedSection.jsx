import React from 'react';
import '../../styles/home.css';
import './CraftedSection.css';
import { useReveal } from '../../hooks/useReveal';

export default function CraftedSection() {
  const textRef   = useReveal({ threshold: 0.15 });
  const imagesRef = useReveal({ threshold: 0.1 });

  return (
    <section className="crafted section--dark section" aria-labelledby="crafted-title">
      <div className="container crafted__inner">
        <div ref={textRef} className="crafted__text reveal reveal-left">
          <p className="section-label crafted__label">About Us</p>
          <h2 id="crafted-title" className="section-title section-title--light">
            CRAFTED By<br />
            <em className="crafted__em">Alessia Collection</em>
          </h2>
          <p className="crafted__desc">
            Each garment is a dialogue between tradition and modernity. We believe in
            clothes that feel as extraordinary as they look — crafted with intention,
            worn with confidence.
          </p>
          <div className="crafted__actions">
            <a href="#about" className="btn btn--outline-light" id="crafted-our-story">Our Story</a>
            <a href="#collections" className="btn btn--ghost crafted__ghost" id="crafted-browse">Browse All</a>
          </div>
        </div>
        <div ref={imagesRef} className="crafted__images reveal reveal-right">
          <div className="crafted__img crafted__img--tall">
            <img src="/crafted-1.png" alt="Crafted fashion editorial" />
          </div>
          <div className="crafted__img-col">
            <div className="crafted__img crafted__img--short">
              <img src="/prod-outerwear.png" alt="Premium outerwear" />
            </div>
            <div className="crafted__img crafted__img--short">
              <img src="/featured-moment.png" alt="Fashion moment" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
