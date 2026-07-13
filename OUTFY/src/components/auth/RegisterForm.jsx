import React, { useState } from 'react';
import './AuthForms.css';

import { API_BASE } from '../../config/api';

const API_BASE_AUTH = `${API_BASE}/auth`;

const EyeIcon = ({ visible }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {visible ? (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const passwordRules = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One number', test: (p) => /[0-9]/.test(p) },
];

export default function RegisterForm({ onSwitchToLogin, onRegistered }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldFocus, setFieldFocus] = useState({});
  const [showStrength, setShowStrength] = useState(false);

  const passStrength = passwordRules.filter(r => r.test(form.password)).length;

  const handleChange = (e) => {
    setError('');
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'password') setShowStrength(value.length > 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_AUTH}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Registration failed. Please try again.');
      } else {
        // Pass email to OTP screen
        onRegistered(form.email);
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_AUTH}/google`;
  };

  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];
  const strengthColors = ['', '#e74c3c', '#f39c12', '#C9A84C'];

  return (
    <div className="auth-form-container">
      <div className="auth-brand-badge">
        <span className="auth-brand-dot" />
        OUTFY
      </div>

      <div className="auth-header">
        <h1 className="auth-title">Create Account</h1>
        <p className="auth-subtitle">Join the world of premium fashion</p>
      </div>

      <button
        id="google-register-btn"
        className="auth-google-btn"
        onClick={handleGoogleLogin}
        type="button"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>

      <div className="auth-divider">
        <span className="auth-divider-line" />
        <span className="auth-divider-text">or register with email</span>
        <span className="auth-divider-line" />
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className={`auth-field ${fieldFocus.name ? 'focused' : ''} ${form.name ? 'filled' : ''}`}>
          <label className="auth-label" htmlFor="register-name">Full Name</label>
          <input
            id="register-name"
            className="auth-input"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            onFocus={() => setFieldFocus(f => ({ ...f, name: true }))}
            onBlur={() => setFieldFocus(f => ({ ...f, name: false }))}
            placeholder="John Doe"
            autoComplete="name"
          />
          <span className="auth-field-line" />
        </div>

        <div className={`auth-field ${fieldFocus.email ? 'focused' : ''} ${form.email ? 'filled' : ''}`}>
          <label className="auth-label" htmlFor="register-email">Email Address</label>
          <input
            id="register-email"
            className="auth-input"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onFocus={() => setFieldFocus(f => ({ ...f, email: true }))}
            onBlur={() => setFieldFocus(f => ({ ...f, email: false }))}
            placeholder="your@email.com"
            autoComplete="email"
          />
          <span className="auth-field-line" />
        </div>

        <div className={`auth-field ${fieldFocus.password ? 'focused' : ''} ${form.password ? 'filled' : ''}`}>
          <label className="auth-label" htmlFor="register-password">Password</label>
          <div className="auth-input-wrapper">
            <input
              id="register-password"
              className="auth-input"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setFieldFocus(f => ({ ...f, password: true }))}
              onBlur={() => setFieldFocus(f => ({ ...f, password: false }))}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              id="register-toggle-password"
              className="auth-eye-btn"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <EyeIcon visible={showPassword} />
            </button>
          </div>
          <span className="auth-field-line" />
        </div>

        {showStrength && (
          <div className="auth-password-strength">
            <div className="auth-strength-bars">
              {[1, 2, 3].map(i => (
                <span
                  key={i}
                  className="auth-strength-bar"
                  style={{
                    background: passStrength >= i ? strengthColors[passStrength] : 'rgba(255,255,255,0.1)',
                    transition: 'background 0.3s ease'
                  }}
                />
              ))}
            </div>
            <span className="auth-strength-label" style={{ color: strengthColors[passStrength] || 'rgba(255,255,255,0.4)' }}>
              {strengthLabels[passStrength] || 'Too short'}
            </span>

            <div className="auth-pass-rules">
              {passwordRules.map((rule, i) => (
                <div key={i} className={`auth-pass-rule ${rule.test(form.password) ? 'pass' : ''}`}>
                  <span className="auth-pass-rule-icon">
                    {rule.test(form.password) ? <CheckIcon /> : <span className="auth-pass-dot" />}
                  </span>
                  <span>{rule.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="auth-error" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        <button
          id="register-submit-btn"
          type="submit"
          className={`auth-submit-btn ${loading ? 'loading' : ''}`}
          disabled={loading}
        >
          {loading ? (
            <span className="auth-spinner" />
          ) : (
            <>
              <span>Create Account</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </>
          )}
        </button>
      </form>

      <p className="auth-switch-text">
        Already have an account?{' '}
        <button
          id="switch-to-login-btn"
          type="button"
          className="auth-switch-link"
          onClick={onSwitchToLogin}
        >
          Sign in
        </button>
      </p>
    </div>
  );
}
