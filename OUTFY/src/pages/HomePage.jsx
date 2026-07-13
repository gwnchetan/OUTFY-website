import React from 'react';
import Navbar from '../components/home/Navbar';
import HeroSection from '../components/home/HeroSection';
import BrandStrip from '../components/home/BrandStrip';
import FeaturedSection from '../components/home/FeaturedSection';
import CollectionSection from '../components/home/CollectionSection';
import StatsSection from '../components/home/StatsSection';
import CraftedSection from '../components/home/CraftedSection';
import FAQSection from '../components/home/FAQSection';
import Footer from '../components/home/Footer';
import { Poster } from '../components/store/Posters';
/**
 * HomePage — OUTFY E-Commerce Home
 * Assembles all section components in order.
 * All data lives inside each component (or can be passed as props
 * once connected to an API/context).
 */
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <BrandStrip />
        <FeaturedSection />
        <CollectionSection />
        <StatsSection />
        <CraftedSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
