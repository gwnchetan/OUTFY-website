import React from 'react';
import '../../styles/home.css';
import './StatsSection.css';
import { useReveal } from '../../hooks/useReveal';

const STATS = [
  { num: '320K', label: 'Happy Customers' },
  { num: '400+', label: 'Premium Styles' },
  { num: '12+',  label: 'Years in Fashion' },
  { num: '98%',  label: 'Satisfaction Rate' },
];

export default function StatsSection() {
  const quoteRef = useReveal({ threshold: 0.2 });
  const gridRef  = useReveal({ threshold: 0.15 });

  return (
    <section className="stats-sec section--stone section--tight" aria-label="Brand statistics">
      <div className="container stats-sec__inner">
        <div ref={quoteRef} className="stats-sec__quote reveal reveal-left">
          <p className="section-label">Our Impact</p>
          <blockquote className="stats-sec__blockquote">
            "The designs are bold, unique, and always get compliments. Love how they
            push boundaries without compromising comfort."
          </blockquote>
          <cite className="stats-sec__cite">— Alessia Collection</cite>
        </div>
        <div ref={gridRef} className="stats-sec__grid reveal reveal-right">
          {STATS.map((s, i) => (
            <div key={i} className="stats-sec__item">
              <span className="stats-sec__num">{s.num}</span>
              <span className="stats-sec__label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
