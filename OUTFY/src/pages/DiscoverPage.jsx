import React from 'react';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import Item from '../components/store/Item';
import { useProducts } from '../hooks/useProducts';
import './DiscoverPage.css';

const COLLECTIONS = [
  { name: 'Dresses', note: 'Fluid silhouettes for every invitation.', image: '/prod-dress.png' },
  { name: 'Outerwear', note: 'Considered layers with enduring structure.', image: '/prod-outerwear.png' },
  { name: 'Knitwear', note: 'Soft texture, refined for daily wear.', image: '/prod-knitwear.png' },
  { name: 'Shoes', note: 'The finishing touch, made to move.', image: '/prod-casual.png' },
];

const STORIES = [
  { type: 'Style Notes', title: 'The art of building a slower wardrobe', date: '6 min read', image: '/crafted-1.png' },
  { type: 'Atelier', title: 'Why fabric weight changes everything', date: '4 min read', image: '/featured-moment.png' },
  { type: 'Journal', title: 'Five ways to wear quiet colour', date: '5 min read', image: '/poster-spring.png' },
];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function Arrivals() {
  const { products, loading, error } = useProducts({ category: 'New Arrival', sort: 'newest', limit: 8 });

  return (
    <>
      <section className="discover-hero discover-hero--arrivals">
        <div className="container discover-hero__inner">
          <p className="discover-eyebrow">The latest edit</p>
          <h1>New pieces,<br /><em>made to stay.</em></h1>
          <p>Fresh arrivals chosen for their silhouette, texture, and effortless versatility.</p>
          <a href="#arrival-grid" className="discover-link">Explore the edit <Arrow /></a>
        </div>
      </section>
      <section className="container discover-section" id="arrival-grid">
        <div className="discover-section__heading">
          <div><p className="discover-eyebrow">Just landed</p><h2>The arrival edit</h2></div>
          <a href="/shop?category=New%20Arrival" className="discover-text-link">Shop all <Arrow /></a>
        </div>
        {loading && <div className="discover-loading">Curating the latest pieces…</div>}
        {!loading && error && <p className="discover-loading">We could not load the latest arrivals right now.</p>}
        {!loading && !error && products.length === 0 && <p className="discover-loading">New arrivals will appear here soon.</p>}
        {!loading && !error && products.length > 0 && (
          <div className="discover-product-grid">
            {products.map((product) => <Item key={product._id} product={product} />)}
          </div>
        )}
      </section>
      <section className="discover-promise">
        <div className="container discover-promise__grid">
          <p><span>01</span> Small-batch collections</p>
          <p><span>02</span> Thoughtful materials</p>
          <p><span>03</span> Designed for years, not seasons</p>
        </div>
      </section>
    </>
  );
}

function Collections() {
  return (
    <>
      <section className="discover-hero discover-hero--collections">
        <div className="container discover-hero__inner">
          <p className="discover-eyebrow">The OUTFY wardrobe</p>
          <h1>Find your<br /><em>next forever piece.</em></h1>
          <p>Explore a wardrobe built around easy layers, intentional colour, and modern tailoring.</p>
        </div>
      </section>
      <section className="container discover-section">
        <div className="discover-section__heading">
          <div><p className="discover-eyebrow">Shop by mood</p><h2>Made for your rhythm</h2></div>
          <a href="/shop" className="discover-text-link">View all pieces <Arrow /></a>
        </div>
        <div className="collection-tiles">
          {COLLECTIONS.map((collection) => (
            <a key={collection.name} href={`/shop?category=${encodeURIComponent(collection.name)}`} className="collection-tile">
              <img src={collection.image} alt="" loading="lazy" decoding="async" />
              <div className="collection-tile__veil" />
              <div className="collection-tile__content">
                <p>{collection.name}</p>
                <span>{collection.note}</span>
                <b>Explore <Arrow /></b>
              </div>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

function Journal() {
  return (
    <>
      <section className="discover-hero discover-hero--journal">
        <div className="container discover-hero__inner">
          <p className="discover-eyebrow">The OUTFY journal</p>
          <h1>Considered style,<br /><em>lived beautifully.</em></h1>
          <p>Ideas, inspiration, and behind-the-scenes notes from the world of OUTFY.</p>
        </div>
      </section>
      <section className="container discover-section">
        <div className="discover-section__heading"><div><p className="discover-eyebrow">Latest stories</p><h2>Read slowly</h2></div></div>
        <div className="journal-grid">
          {STORIES.map((story, index) => (
            <article key={story.title} className={`journal-card ${index === 0 ? 'journal-card--featured' : ''}`}>
              <img src={story.image} alt="" loading={index === 0 ? 'eager' : 'lazy'} decoding="async" />
              <div className="journal-card__content">
                <p>{story.type} <span>•</span> {story.date}</p>
                <h2>{story.title}</h2>
                <a href="/shop">Read story <Arrow /></a>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="journal-signup">
        <div className="container journal-signup__inner">
          <p className="discover-eyebrow">A thoughtful note, occasionally</p>
          <h2>Fresh arrivals and styling notes, delivered with care.</h2>
          <a href="/shop" className="discover-link">Shop the newest edit <Arrow /></a>
        </div>
      </section>
    </>
  );
}

export default function DiscoverPage() {
  const path = window.location.pathname;
  const content = path === '/collections' ? <Collections /> : path === '/journal' ? <Journal /> : <Arrivals />;

  return <><Navbar /><main className="discover-page">{content}</main><Footer /></>;
}
