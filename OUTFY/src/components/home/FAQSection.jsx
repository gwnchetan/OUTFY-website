import React, { useState } from 'react';
import '../../styles/home.css';
import './FAQSection.css';
import { useReveal } from '../../hooks/useReveal';

const PlusIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const MinusIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const FAQS = [
  { q: 'Sizes Available?',      a: 'We offer sizes XS through 3XL. Each product page includes a detailed size guide. Our styles are designed to be inclusive and flattering across all body types.' },
  { q: 'Ship Internationally?', a: 'Yes! We ship to 80+ countries. International shipping takes 7–14 business days. Free shipping on orders over $150 USD.' },
  { q: 'How to Track Order?',   a: "Once your order ships, you'll receive a tracking email. Track in real-time from your account dashboard." },
  { q: 'Products Sustainable?', a: 'Sustainability is core to us. We use ethically sourced materials, low-impact dyes, and certified manufacturers. Every purchase contributes to our reforestation program.' },
  { q: 'Can I Change or Cancel?', a: 'Orders can be modified within 2 hours of placement. After that, fulfillment begins. Contact support immediately if you need changes.' },
];

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-item ${open ? 'open' : ''}`}>
      <button id={`faq-btn-${index}`} className="faq-item__btn" onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className="faq-item__question">{faq.q}</span>
        <span className="faq-item__icon">{open ? <MinusIcon /> : <PlusIcon />}</span>
      </button>
      <div className="faq-item__body" aria-hidden={!open}>
        <p className="faq-item__answer">{faq.a}</p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const leftRef  = useReveal({ threshold: 0.2 });
  const rightRef = useReveal({ threshold: 0.1 });

  return (
    <section className="faq-sec section" id="about" aria-labelledby="faq-title">
      <div className="container faq-sec__inner">
        <div ref={leftRef} className="faq-sec__left reveal reveal-left">
          <p className="section-label">Support</p>
          <h2 id="faq-title" className="section-title">Let's Make Things<br />Easy For You</h2>
          <p className="section-subtitle">Everything you need to know about our products, shipping, and policies.</p>
          <a href="#contact" className="btn btn--primary faq-sec__cta" id="faq-contact-btn">Contact Support</a>
        </div>
        <div ref={rightRef} className="faq-sec__list reveal reveal-right" role="list">
          {FAQS.map((faq, i) => <FAQItem key={i} faq={faq} index={i} />)}
        </div>
      </div>
    </section>
  );
}
