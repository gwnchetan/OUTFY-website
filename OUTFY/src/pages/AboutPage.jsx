import React, { useState } from 'react';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import { useReveal } from '../hooks/useReveal';
import './AboutPage.css';

// ── Icons ────────────────────────────────────────────────────
const ArrowDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="about-hero__scroll-icon">
    <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
  </svg>
);
const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
  </svg>
);

const PILLARS = [
  {
    num: '01',
    title: 'Honest Craft',
    desc: 'We select fabrics that breathe and last—pure Mongolian cashmere, organic linen, and heavy bias-cut silk. No synthetics, no shortcuts.',
  },
  {
    num: '02',
    title: 'Quiet Tailoring',
    desc: 'Garments crafted by hand in family-run ateliers. We produce in micro-batches to eliminate deadstock and ensure ethical, living-wage standards.',
  },
  {
    num: '03',
    title: 'Direct Value',
    desc: 'By cutting out traditional retail markups and middle-men overheads, we invest directly in premium materials and pass the honest value to you.',
  },
];

const TIMELINE_STEPS = [
  {
    year: 'Chapter I',
    title: 'The Concept & Milano Atelier',
    desc: 'Drafted in Milan with a single vision: to revive the editorial design system—where weight, texture, and silhouette define personality.',
  },
  {
    year: 'Chapter II',
    title: 'Sartorial Alliances',
    desc: 'Forged partnerships with certified sustainable mills in northern Italy and local artisans specializing in double-faced wool weaving.',
  },
  {
    year: 'Chapter III',
    title: 'Zero-Waste Launch',
    desc: 'Unveiled our first collection under a strict zero-waste model, crafting each piece strictly to demand, protecting local environments.',
  },
  {
    year: 'Chapter IV',
    title: 'Digital Wardrobe Era',
    desc: 'Expanding our atelier globally, making high-end quiet luxury tailoring accessible online without the premium designer price tag.',
  },
];

export default function AboutPage() {
  const [activeStep, setActiveStep] = useState(0);

  // ── Scroll Reveal Refs ──────────────────────────────────────
  const heroTextRef = useReveal({ threshold: 0.1 });
  const genesisRef  = useReveal({ threshold: 0.15 });
  const pillarsTitleRef = useReveal({ threshold: 0.15 });
  const timelineRef = useReveal({ threshold: 0.12 });
  const galleryRef  = useReveal({ threshold: 0.12 });
  const ctaRef      = useReveal({ threshold: 0.15 });

  return (
    <>
      <Navbar />
      <main className="about-page">
        {/* ── Hero Section (Manifesto) ───────────────────────── */}
        <section className="about-hero" aria-label="Our Manifesto">
          <div className="about-hero__bg">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80" alt="Conscious premium fashion" />
            <div className="about-hero__overlay" />
          </div>
          <div ref={heroTextRef} className="container about-hero__content reveal">
            <p className="about-hero__subtitle">About OUTFY</p>
            <h1 className="about-hero__title">
              Quiet luxury.<br />
              Conscious crafting.
            </h1>
            <p className="about-hero__manifesto">
              We reject the rush of seasonal collections. OUTFY is an editorial response to fast fashion—creating a timeless wardrobe designed to be lived in, loved, and passed down.
            </p>
            <button 
              className="about-hero__scroll-btn" 
              onClick={() => document.getElementById('genesis').scrollIntoView({ behavior: 'smooth' })}
              aria-label="Scroll down"
            >
              <span>Explore Our Story</span>
              <ArrowDown />
            </button>
          </div>
        </section>

        {/* ── Section: Genesis (Our Origin) ──────────────────── */}
        <section className="about-section genesis-section" id="genesis" aria-labelledby="genesis-title">
          <div ref={genesisRef} className="container grid-split reveal">
            <div className="genesis-text">
              <p className="section-label">The Genesis</p>
              <h2 id="genesis-title" className="section-title">Born from a return to shape and weight</h2>
              <p className="section-paragraph">
                OUTFY was born in 2024 out of frustration with the decline of garment longevity. We watched fashion speed up while materials collapsed. Our response was simple: go backward.
              </p>
              <p className="section-paragraph">
                We returned to classic tailoring design systems, working directly with master weavers and family-run ateliers. We believe that a coat or a dress should carry weight, hold its structure, and remain relevant in your wardrobe ten years from today.
              </p>
            </div>
            <div className="genesis-image">
              <img src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80" alt="Atelier drafting table and materials" />
              <div className="caption">OUTFY Atelier, Milano Studio</div>
            </div>
          </div>
        </section>

        {/* ── Section: Pillars (Philosophy) ──────────────────── */}
        <section className="about-section pillars-section" aria-labelledby="pillars-title">
          <div className="container">
            <div ref={pillarsTitleRef} className="section-header-center reveal">
              <p className="section-label">Our Philosophy</p>
              <h2 id="pillars-title" className="section-title">The Three Pillars of OUTFY</h2>
            </div>
            <div className="pillars-grid">
              {PILLARS.map((p, idx) => (
                <div key={idx} className="pillar-card animate-up" style={{ animationDelay: `${idx * 0.15}s` }}>
                  <span className="pillar-card__num">{p.num}</span>
                  <h3 className="pillar-card__title">{p.title}</h3>
                  <p className="pillar-card__desc">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section: Interactive Timeline ──────────────────── */}
        <section className="about-section timeline-section" aria-labelledby="timeline-title">
          <div ref={timelineRef} className="container grid-split reveal">
            <div className="timeline-left">
              <p className="section-label">Atelier Journey</p>
              <h2 id="timeline-title" className="section-title">The Chapters of Our Growth</h2>
              <div className="timeline-nav">
                {TIMELINE_STEPS.map((step, idx) => (
                  <button
                    key={idx}
                    className={`timeline-nav-btn ${activeStep === idx ? 'active' : ''}`}
                    onClick={() => setActiveStep(idx)}
                  >
                    <span className="timeline-nav-year">{step.year}</span>
                    <span className="timeline-nav-title">{step.title}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="timeline-right">
              <div className="timeline-content-card" key={activeStep}>
                <span className="timeline-card-chapter">{TIMELINE_STEPS[activeStep].year}</span>
                <h3 className="timeline-card-title">{TIMELINE_STEPS[activeStep].title}</h3>
                <p className="timeline-card-desc">{TIMELINE_STEPS[activeStep].desc}</p>
                <div className="timeline-card-line" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Section: Behind the Scenes Gallery ─────────────── */}
        <section className="about-section gallery-section" aria-labelledby="gallery-title">
          <div className="container">
            <div ref={galleryRef} className="gallery-header reveal">
              <div>
                <p className="section-label">Behind The Scenes</p>
                <h2 id="gallery-title" className="section-title">Crafting the Details</h2>
              </div>
              <p className="gallery-header-desc">
                From yarn selection to final press, every stitch is monitored for precision. Quiet luxury lies in what you don’t see—the interior seams, the lining drape, and the pocket reinforcement.
              </p>
            </div>
            <div className="about-gallery">
              <div className="about-gallery__item about-gallery__item--large">
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80" alt="Atelier workshop hangers" />
              </div>
              <div className="about-gallery__item">
                <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80" alt="Selecting textiles and threads" />
              </div>
              <div className="about-gallery__item">
                <img src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80" alt="Tailoring a silk bias cut" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Section: CTA Invitation ────────────────────────── */}
        <section ref={ctaRef} className="about-cta reveal" aria-labelledby="cta-title">
          <div className="container about-cta__inner">
            <h2 id="cta-title" className="about-cta__title">
              Crafted for the conscious.<br />
              Designed for you.
            </h2>
            <p className="about-cta__desc">
              Experience the weight, drape, and texture of modern editorial tailoring.
            </p>
            <a href="/shop" className="btn btn--outline about-cta__btn">
              <span>Enter The Wardrobe</span>
              <ArrowRight />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
