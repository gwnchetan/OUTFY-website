import React from 'react';
import '../../styles/home.css';
import './Footer.css';

const LINKS = {
  Shop:    ['New Arrivals', 'Dresses', 'Outerwear', 'Knitwear', 'Shoes'],
  Help:    ['FAQ', 'Shipping', 'Returns', 'Size Guide', 'Contact'],
  Company: ['About Us', 'Careers', 'Press', 'Sustainability', 'Blog'],
};

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
  </svg>
);
const PinterestIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.853 0 1.267.641 1.267 1.408 0 .858-.546 2.141-.828 3.329-.236.995.499 1.806 1.476 1.806 1.771 0 3.132-1.867 3.132-4.562 0-2.387-1.715-4.054-4.163-4.054-2.833 0-4.497 2.125-4.497 4.32 0 .856.33 1.773.741 2.273a.3.3 0 01.07.283 48 48 0 01-.207.852c-.033.131-.111.159-.255.096-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.967-.527-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.962.446 5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
  </svg>
);

export default function Footer() {
  return (
    <footer className="footer" aria-label="Site footer">
      <div className="container footer__top">
        {/* Brand */}
        <div className="footer__brand">
          <p className="footer__logo">OUTFY</p>
          <p className="footer__tagline">Premium fashion for the extraordinary.</p>
          <div className="footer__socials">
            <a href="#" className="footer__social-link" aria-label="Instagram" id="footer-instagram"><InstagramIcon /></a>
            <a href="#" className="footer__social-link" aria-label="Twitter" id="footer-twitter"><TwitterIcon /></a>
            <a href="#" className="footer__social-link" aria-label="Pinterest" id="footer-pinterest"><PinterestIcon /></a>
          </div>
        </div>

        {/* Links */}
        {Object.entries(LINKS).map(([title, items]) => {
          const getFooterLink = (item) => {
            if (item === 'About Us') return '/about';
            if (item === 'New Arrivals') return '/shop';
            if (item === 'Dresses') return '/shop?category=Dresses';
            if (item === 'Outerwear') return '/shop?category=Outerwear';
            if (item === 'Knitwear') return '/shop?category=Knitwear';
            if (item === 'Shoes') return '/shop?category=Shoes';
            return '#';
          };
          return (
            <div key={title} className="footer__col">
              <p className="footer__col-title">{title}</p>
              <ul>
                {items.map(item => (
                  <li key={item}>
                    <a href={getFooterLink(item)} className="footer__link">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Newsletter */}
        <div className="footer__newsletter">
          <p className="footer__col-title">Stay Inspired</p>
          <p className="footer__newsletter-desc">Get new arrivals and exclusive offers first.</p>
          <form className="footer__newsletter-form" onSubmit={e => e.preventDefault()}>
            <input
              id="footer-email-input"
              type="email"
              placeholder="your@email.com"
              className="footer__input"
              aria-label="Email for newsletter"
            />
            <button type="submit" className="btn btn--primary footer__sub-btn" id="footer-subscribe">
              Join
            </button>
          </form>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} OUTFY. All rights reserved.</p>
        <div className="footer__bottom-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
