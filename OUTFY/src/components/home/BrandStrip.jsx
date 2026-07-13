import React from 'react';
import '../../styles/home.css';
import './BrandStrip.css';

const BRANDS = ['Goodwell', 'FocalPoint', 'Segment', 'Screen', 'Shutter', 'Arcadia', 'Lumiere', 'Mercer'];

export default function BrandStrip() {
  // Duplicate 3x for a seamless, smooth loop on all screen widths
  const allBrands = [...BRANDS, ...BRANDS, ...BRANDS];

  return (
    <div className="brand-strip">
      <span className="brand-strip__label">Trusted by leading brands</span>
      <div className="brand-strip__row" aria-label="Brand partners" aria-hidden="true">
        <div className="brand-strip__track">
          {allBrands.map((name, i) => (
            <React.Fragment key={i}>
              <span className="brand-strip__name">{name}</span>
              <span className="brand-strip__dot" aria-hidden="true" />
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
