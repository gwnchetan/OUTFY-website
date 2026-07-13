import React, { useState, useRef, useEffect } from 'react';
import './AuthForms.css';
import { useAuth } from '../../context/AuthContext';

import { API_BASE } from '../../config/api';

const API_BASE_AUTH = `${API_BASE}/auth`;
const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 120; // 2 minutes per backend

export default function OTPScreen({ email, onBack, onVerified }) {
  const { login } = useAuth();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(OTP_EXPIRY_SECONDS);
  const [resendsLeft, setResendsLeft] = useState(3);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTimer(OTP_EXPIRY_SECONDS);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const maskedEmail = email
    ? email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.max(b.length, 3)) + c)
    : '';

  const handleOtpChange = (index, value) => {
    setError('');
    // Allow only digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next field
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (digit && index === OTP_LENGTH - 1 && newOtp.every(d => d !== '')) {
      submitOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newOtp = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((c, i) => { newOtp[i] = c; });
    setOtp(newOtp);
    const nextEmpty = newOtp.findIndex(d => !d);
    const focusIdx = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIdx]?.focus();

    if (newOtp.every(d => d !== '')) {
      submitOtp(newOtp.join(''));
    }
  };

  const submitOtp = async (otpString) => {
    if (timer === 0) {
      setError('OTP has expired. Please request a new one.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_AUTH}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp: otpString }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Invalid OTP. Please try again.');
        // Shake the inputs on error
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
      } else {
        login({ accessToken: data.accessToken, user: data.user });
        setSuccess('Email verified! Welcome to OUTFY ✦');
        if (onVerified) {
          setTimeout(() => onVerified(data), 1200);
        } else {
          setTimeout(() => { window.location.href = '/'; }, 1200);
        }
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendsLeft <= 0) {
      setError('Maximum resend attempts reached. Try again tomorrow.');
      return;
    }
    setResendLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`${API_BASE_AUTH}/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to resend OTP.');
      } else {
        setResendsLeft(data.resendsLeft ?? resendsLeft - 1);
        setOtp(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        resetTimer();
        setSuccess('New OTP sent to your email!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleManualSubmit = () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter all 6 digits.');
      return;
    }
    submitOtp(code);
  };

  const filledCount = otp.filter(d => d !== '').length;
  const isExpired = timer === 0;

  return (
    <div className="auth-form-container">
      <div className="auth-brand-badge">
        <span className="auth-brand-dot" />
        OUTFY
      </div>

      <button
        type="button"
        className="auth-back-btn"
        id="otp-back-btn"
        onClick={onBack}
        aria-label="Go back"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back
      </button>

      <div className="auth-header">
        <div className="auth-otp-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h1 className="auth-title">Check Your Email</h1>
        <p className="auth-subtitle">
          We sent a 6-digit code to
          <br />
          <span className="auth-email-highlight">{maskedEmail}</span>
        </p>
      </div>

      {/* OTP Input */}
      <div className="auth-otp-inputs" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-input-${i}`}
            ref={el => inputRefs.current[i] = el}
            className={`auth-otp-cell ${digit ? 'filled' : ''} ${error ? 'error' : ''} ${success ? 'success' : ''}`}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={e => handleOtpChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            aria-label={`OTP digit ${i + 1}`}
            disabled={loading}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div className="auth-otp-progress">
        <div
          className="auth-otp-progress-fill"
          style={{ width: `${(filledCount / OTP_LENGTH) * 100}%` }}
        />
      </div>

      {/* Timer */}
      <div className="auth-otp-timer-row">
        {!isExpired ? (
          <span className="auth-otp-timer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Expires in <strong>{formatTime(timer)}</strong>
          </span>
        ) : (
          <span className="auth-otp-timer expired">OTP expired</span>
        )}
      </div>

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

      {success && (
        <div className="auth-success" role="status">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {success}
        </div>
      )}

      <button
        id="otp-verify-btn"
        type="button"
        className={`auth-submit-btn ${loading ? 'loading' : ''}`}
        onClick={handleManualSubmit}
        disabled={loading || filledCount < OTP_LENGTH}
      >
        {loading ? (
          <span className="auth-spinner" />
        ) : (
          <>
            <span>Verify Code</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </>
        )}
      </button>

      <div className="auth-resend-row">
        <span className="auth-switch-text">Didn't receive it? </span>
        <button
          id="resend-otp-btn"
          type="button"
          className={`auth-switch-link ${resendLoading ? 'loading-inline' : ''} ${resendsLeft <= 0 ? 'disabled' : ''}`}
          onClick={handleResend}
          disabled={resendLoading || resendsLeft <= 0}
        >
          {resendLoading ? 'Sending...' : `Resend Code`}
        </button>
        {resendsLeft < 3 && (
          <span className="auth-resend-count">({resendsLeft} left)</span>
        )}
      </div>
    </div>
  );
}
