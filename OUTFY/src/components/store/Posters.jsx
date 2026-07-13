import React from 'react';
import './Posters.css';

// ── Poster data — add or edit posters here ─────────────────
export const POSTERS = [
  {
    id: 1,
    tag:         'New Season',
    heading:     'Spring / Summer\nCollection',
    description: 'Elevate your style with the latest trends and timeless essentials.',
    cta:         'Shop Now',
    link:        '/shop',
    image:       '/poster-spring.png',
    theme:       'light',
  },
  {
    id: 2,
    tag:         'Limited Time',
    heading:     'Up to 40% Off\nSelected Styles',
    description: "Shop our end-of-season sale before it's gone — exclusive pieces at unbeatable prices.",
    cta:         'View Offers',
    link:        '/shop',
    image:       '/poster-sale.png',
    theme:       'dark',
  },
  {
    id: 3,
    tag:         'Just Landed',
    heading:     'Winter\nEssentials',
    description: 'New outerwear drops — crafted for warmth without compromising on style.',
    cta:         'Explore Arrivals',
    link:        '/shop',
    image:       '/poster-arrivals.png',
    theme:       'white',
  },
];

// ── Single Poster — use this on individual pages ───────────
// Usage: <Poster id={1} />   or   <Poster id={2} />
export const Poster = ({ id }) => {
  const poster = POSTERS.find(p => p.id === id);
  if (!poster) return null;

  return (
    <div className={`poster poster--${poster.theme}`}>
      <div className="poster__content">
        <span className="poster__tag">{poster.tag}</span>
        <h2 className="poster__heading">
          {poster.heading.split('\n').map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
        </h2>
        <div className="poster__divider" />
        <p className="poster__desc">{poster.description}</p>
        <a href={poster.link} className="poster__cta">{poster.cta}</a>
      </div>
      <div className="poster__img-wrap">
        <img src={poster.image} alt={poster.tag} />
      </div>
    </div>
  );
};

// ── All Posters — renders every poster stacked ─────────────
// Usage: <Posters />
const Posters = () => (
  <div className="posters">
    {POSTERS.map(p => <Poster key={p.id} id={p.id} />)}
  </div>
);

export default Posters;
