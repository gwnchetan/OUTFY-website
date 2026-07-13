import React from 'react';

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      color: '#fff',
      fontFamily: "'Outfit', 'Inter', sans-serif",
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{
        fontSize: 'clamp(80px, 20vw, 160px)',
        fontWeight: '800',
        lineHeight: 1,
        background: 'linear-gradient(135deg, #e8c97a 0%, #d4a843 50%, #b8860b 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        marginBottom: '1rem',
        letterSpacing: '-4px',
      }}>
        404
      </div>
      <h1 style={{
        fontSize: 'clamp(1.2rem, 4vw, 2rem)',
        fontWeight: '600',
        color: '#fff',
        marginBottom: '0.75rem',
      }}>
        Page Not Found
      </h1>
      <p style={{
        color: '#888',
        fontSize: '1rem',
        maxWidth: '420px',
        lineHeight: '1.6',
        marginBottom: '2.5rem',
      }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.85rem 2rem',
          background: 'linear-gradient(135deg, #e8c97a, #d4a843)',
          color: '#0a0a0a',
          fontWeight: '700',
          fontSize: '0.9rem',
          borderRadius: '50px',
          textDecoration: 'none',
          letterSpacing: '0.5px',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(212,168,67,0.35)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
      >
        ← Back to Home
      </a>
    </div>
  );
}
