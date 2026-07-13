import React, { useState, useEffect } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import OTPScreen from '../components/auth/OTPScreen';
import './AuthPage.css';

/**
 * AuthPage — OUTFY Auth Hub
 * Manages: login | register | otp
 *
 * URL query param ?mode=register opens register tab on load.
 * URL query param ?error=... (from Google OAuth) shows error banner.
 */
export default function AuthPage() {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'otp'
  const [pendingEmail, setPendingEmail] = useState('');
  const [oauthError, setOauthError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'register') setView('register');
    const err = params.get('error');
    if (err) setOauthError(decodeURIComponent(err));
  }, []);

  useEffect(() => {
    if (!oauthError) return;
    const t = setTimeout(() => setOauthError(''), 6000);
    return () => clearTimeout(t);
  }, [oauthError]);

  const handleRegistered = (email) => {
    setPendingEmail(email);
    setView('otp');
  };

  return (
    <div className="auth-page">
      {/* ── Left Panel ── */}
      <div className="auth-left-panel">
        {/* Editorial photo */}
        <img
          src="/auth-editorial.png"
          alt="OUTFY editorial"
          className="auth-left-photo"
        />
        <div className="auth-left-overlay" />

        {/* Decorative orbs */}
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />

        {/* Brand name top-left */}
        <div className="auth-logo-word">
          <span className="auth-logo-o">O</span>UTFY
        </div>

        {/* Bottom copy */}
        <div className="auth-left-content">
          <div className="auth-left-tagline">
            <h2 className="auth-tagline-heading">
              Wear the<br />
              <em>extraordinary.</em>
            </h2>
            <p className="auth-tagline-sub">
              Premium fashion curated for those who refuse to settle for ordinary.
            </p>
          </div>

          <div className="auth-left-features">
            {[
              { icon: '✦', label: 'Exclusive collections' },
              { icon: '◈', label: 'Premium materials' },
              { icon: '❋', label: 'Personalized style' },
            ].map((f, i) => (
              <div className="auth-left-feature" key={i}>
                <span className="auth-feature-icon">{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="auth-right-panel">
        <div className="auth-right-inner">

          {/* Mobile brand header */}
          <div className="auth-mobile-brand">OUTFY</div>

          {/* OAuth Error */}
          {oauthError && (
            <div className="auth-page-error" role="alert">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {oauthError}
            </div>
          )}

          {/* Tab Switcher */}
          {view !== 'otp' && (
            <div className="auth-tabs" role="tablist" aria-label="Authentication tabs">
              <button
                id="tab-login"
                role="tab"
                aria-selected={view === 'login'}
                className={`auth-tab ${view === 'login' ? 'active' : ''}`}
                onClick={() => setView('login')}
                type="button"
              >
                Sign In
              </button>
              <button
                id="tab-register"
                role="tab"
                aria-selected={view === 'register'}
                className={`auth-tab ${view === 'register' ? 'active' : ''}`}
                onClick={() => setView('register')}
                type="button"
              >
                Register
              </button>
              <span
                className="auth-tab-indicator"
                style={{ transform: view === 'register' ? 'translateX(100%)' : 'translateX(0)' }}
              />
            </div>
          )}

          {/* Form Views */}
          <div className="auth-view-wrapper" key={view}>
            {view === 'login' && (
              <LoginForm onSwitchToRegister={() => setView('register')} />
            )}
            {view === 'register' && (
              <RegisterForm
                onSwitchToLogin={() => setView('login')}
                onRegistered={handleRegistered}
              />
            )}
            {view === 'otp' && (
              <OTPScreen
                email={pendingEmail}
                onBack={() => setView('register')}
                onVerified={() => { window.location.href = '/'; }}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
