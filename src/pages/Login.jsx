import React, { useState } from 'react';
import { 
  Bus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  User, 
  SlidersHorizontal, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Radio,
  Navigation
} from 'lucide-react';

/**
 * Login Component / Page
 * Polished mobility-tech authentication screen supporting Student and Operator roles
 */
export default function Login({ 
  onLoginSuccess, 
  onCancel, 
  initialRole = 'student' 
}) {
  const [selectedRole, setSelectedRole] = useState(initialRole); // 'student' | 'operator'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Please enter your university email';
    } else {
      // Basic standard email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 4) {
      newErrors.password = 'Password must be at least 4 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    // Simulate brief network latency for loading state styling
    setTimeout(() => {
      setIsSubmitting(false);
      if (onLoginSuccess) {
        onLoginSuccess(selectedRole);
      }
    }, 700);
  };

  // Demo Account 1-Click Access
  const handleUseDemoAccount = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onLoginSuccess) {
        onLoginSuccess(selectedRole);
      }
    }, 400);
  };

  return (
    <div className="auth-page-container">
      {/* Background glow orbs */}
      <div className="auth-glow-top-left" />
      <div className="auth-glow-bottom-right" />

      <div className="auth-content-split">
        {/* ====================================================================
            LEFT / HERO AREA (Branding, Mobility Graphics, Realtime Telematics)
            ==================================================================== */}
        <div className="auth-hero-pane">
          <div className="auth-hero-inner">
            {/* Top Brand Tag */}
            <div className="auth-brand-lockup">
              <div className="auth-brand-icon-box">
                <Bus size={24} className="auth-bus-icon" />
                <span className="auth-icon-pulse-glow" />
              </div>
              <div className="auth-brand-text">
                <span className="auth-brand-title">Campus<span className="auth-brand-accent">Flow</span></span>
                <span className="auth-brand-subtitle">Smart Transit System</span>
              </div>
            </div>

            {/* Main Hero Copy */}
            <div className="auth-hero-copy">
              <div className="auth-live-pill">
                <span className="live-dot-pulse" />
                <span>INTELLIGENT TRANSIT NETWORK</span>
              </div>
              <h1 className="auth-hero-heading">
                Smart campus mobility, connected in real time.
              </h1>
              <p className="auth-hero-description">
                Access live shuttle telemetry, high-precision corridor ETAs, route schedules, 
                and comprehensive fleet dispatch operations.
              </p>
            </div>

            {/* Visual Route Progression Graphic (CSS-based Mobility Tech visual) */}
            <div className="auth-mobility-visual-card">
              <div className="visual-card-header">
                <div className="visual-header-left">
                  <Radio size={14} className="text-cyan" />
                  <span className="visual-header-text">Active Campus Corridor</span>
                </div>
                <span className="visual-latency-tag">12ms Telemetry</span>
              </div>

              {/* Graphic nodes representing route tracking */}
              <div className="visual-route-track">
                <div className="visual-route-line" />
                <div className="visual-stop-point point-passed">
                  <span className="visual-node-dot" />
                  <span className="visual-node-label">Hostel</span>
                </div>
                <div className="visual-stop-point point-active">
                  <span className="visual-node-shuttle-pulse">
                    <Navigation size={12} className="visual-nav-icon" />
                  </span>
                  <span className="visual-node-label text-cyan">Shuttle 01</span>
                </div>
                <div className="visual-stop-point point-upcoming">
                  <span className="visual-node-dot" />
                  <span className="visual-node-label">Main Gate</span>
                </div>
                <div className="visual-stop-point point-upcoming">
                  <span className="visual-node-dot" />
                  <span className="visual-node-label">College</span>
                </div>
              </div>

              {/* Quick telematics summary pills */}
              <div className="visual-metrics-row">
                <div className="v-metric-item">
                  <span className="v-metric-num">4</span>
                  <span className="v-metric-lbl">Fleet Active</span>
                </div>
                <div className="v-metric-divider" />
                <div className="v-metric-item">
                  <span className="v-metric-num">3 min</span>
                  <span className="v-metric-lbl">Next Arrival</span>
                </div>
                <div className="v-metric-divider" />
                <div className="v-metric-item">
                  <span className="v-metric-num">100%</span>
                  <span className="v-metric-lbl">GPS Coverage</span>
                </div>
              </div>
            </div>

            {/* Return to Dashboard without login */}
            {onCancel && (
              <div className="auth-hero-footer">
                <button
                  type="button"
                  className="auth-return-guest-btn"
                  onClick={onCancel}
                  title="Explore tracking as guest"
                >
                  <ArrowLeft size={15} />
                  <span>Return to Live Radar (Guest Mode)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ====================================================================
            RIGHT / LOGIN CARD AREA
            ==================================================================== */}
        <div className="auth-card-pane">
          <div className="auth-card-box">
            {/* Card Header */}
            <div className="auth-card-header">
              <h2 className="auth-card-heading">Welcome back</h2>
              <p className="auth-card-subheading">
                Sign in to access campus shuttle tracking.
              </p>
            </div>

            {/* ROLE SELECTION ("Continue as") */}
            <div className="auth-role-selector-section">
              <span className="auth-role-label">Continue as</span>
              <div className="auth-role-toggle-group" role="radiogroup" aria-label="Select role">
                <button
                  type="button"
                  className={`auth-role-pill-btn ${selectedRole === 'student' ? 'role-selected-student' : ''}`}
                  onClick={() => {
                    setSelectedRole('student');
                    setErrors({});
                  }}
                  role="radio"
                  aria-checked={selectedRole === 'student'}
                >
                  <User size={16} />
                  <span>Student</span>
                  {selectedRole === 'student' && <span className="role-active-dot" />}
                </button>

                <button
                  type="button"
                  className={`auth-role-pill-btn ${selectedRole === 'operator' ? 'role-selected-operator' : ''}`}
                  onClick={() => {
                    setSelectedRole('operator');
                    setErrors({});
                  }}
                  role="radio"
                  aria-checked={selectedRole === 'operator'}
                >
                  <SlidersHorizontal size={16} />
                  <span>Operator</span>
                  {selectedRole === 'operator' && <span className="role-active-dot" />}
                </button>
              </div>
              <p className="auth-role-explanation">
                Your account permissions are determined after authentication.
              </p>
            </div>

            {/* AUTHENTICATION FORM */}
            <form onSubmit={handleFormSubmit} noValidate className="auth-form">
              {/* Email Input */}
              <div className="auth-field-group">
                <label htmlFor="auth-email-input" className="auth-field-label">
                  University Email
                </label>
                <div className={`auth-input-wrapper ${errors.email ? 'input-has-error' : ''}`}>
                  <Mail size={16} className="auth-input-icon" />
                  <input
                    id="auth-email-input"
                    type="email"
                    className="auth-text-input"
                    placeholder={selectedRole === 'operator' ? 'operator@transit.campus.edu' : 'student@university.edu'}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
                    }}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <div className="auth-field-error-message">
                    <AlertCircle size={13} />
                    <span>{errors.email}</span>
                  </div>
                )}
              </div>

              {/* Password Input */}
              <div className="auth-field-group">
                <div className="auth-password-label-row">
                  <label htmlFor="auth-password-input" className="auth-field-label">
                    Password
                  </label>
                  <button
                    type="button"
                    className="auth-forgot-link-btn"
                    onClick={() => setForgotPasswordNotice(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className={`auth-input-wrapper ${errors.password ? 'input-has-error' : ''}`}>
                  <Lock size={16} className="auth-input-icon" />
                  <input
                    id="auth-password-input"
                    type={showPassword ? 'text' : 'password'}
                    className="auth-text-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
                    }}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-toggle-password-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <div className="auth-field-error-message">
                    <AlertCircle size={13} />
                    <span>{errors.password}</span>
                  </div>
                )}
              </div>

              {/* Forgot password notice */}
              {forgotPasswordNotice && (
                <div className="auth-notice-toast">
                  <CheckCircle2 size={14} className="text-emerald" />
                  <span>Password recovery link will be sent to your university email once backend auth is connected.</span>
                  <button type="button" className="close-notice-btn" onClick={() => setForgotPasswordNotice(false)}>×</button>
                </div>
              )}

              {/* Remember Me */}
              <div className="auth-checkbox-row">
                <label className="auth-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="auth-checkbox-input"
                  />
                  <span>Remember me on this browser</span>
                </label>
              </div>

              {/* Primary Submit Button */}
              <button
                type="submit"
                className={`auth-primary-submit-btn ${isSubmitting ? 'is-loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="auth-loading-text">
                    <span className="auth-mini-spinner" />
                    <span>Authenticating...</span>
                  </span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* DEMO MODE SECTION */}
            <div className="auth-demo-divider">
              <span className="auth-divider-text">DEVELOPMENT ACCESS</span>
            </div>

            <div className="auth-demo-box">
              <div className="auth-demo-header">
                <div className="demo-tag-pill">
                  <Sparkles size={12} />
                  <span>DEMO MODE</span>
                </div>
                <span className="demo-disclaimer">Backend disconnected</span>
              </div>
              <p className="demo-description">
                1-click access to test the {selectedRole === 'operator' ? 'Fleet Operator' : 'Student'} experience with live mock telematics:
              </p>
              <button
                type="button"
                className="auth-demo-action-btn"
                onClick={handleUseDemoAccount}
                disabled={isSubmitting}
              >
                <Sparkles size={14} />
                <span>Use Demo Account ({selectedRole === 'operator' ? 'Operator' : 'Student'})</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
