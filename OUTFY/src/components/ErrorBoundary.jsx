import React from 'react';

/**
 * ErrorBoundary — catches render errors anywhere in the tree
 * and shows a friendly crash screen instead of a blank page.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console (swap for Sentry/logging service in production)
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
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
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '0.75rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#888', maxWidth: '400px', lineHeight: '1.6', marginBottom: '2rem' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.85rem 2rem',
              background: 'linear-gradient(135deg, #e8c97a, #d4a843)',
              color: '#0a0a0a',
              fontWeight: '700',
              fontSize: '0.9rem',
              borderRadius: '50px',
              border: 'none',
              cursor: 'pointer',
              letterSpacing: '0.5px',
            }}
          >
            Refresh Page
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: '#f87171',
              fontSize: '0.75rem',
              textAlign: 'left',
              maxWidth: '90vw',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
