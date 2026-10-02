import React, { useState } from 'react';
import { 
  Bus, 
  Radio, 
  User, 
  Compass, 
  Bookmark, 
  Menu, 
  X, 
  Bell, 
  ShieldCheck, 
  Activity,
  SlidersHorizontal,
  LogIn
} from 'lucide-react';

/**
 * TopNav Component
 * Responsive top navigation bar with Role Switcher and Sign In entry point
 */
export default function TopNav({ 
  activeTab = 'Dashboard', 
  onTabChange,
  currentMode = 'student', // 'student' | 'operator'
  onToggleMode,
  onOpenLogin
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const studentNavItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: Compass },
    { id: 'MyShuttle', label: 'My Shuttle', icon: Bookmark },
    { id: 'Profile', label: 'Profile', icon: User }
  ];

  const handleNavClick = (tabId) => {
    if (currentMode === 'operator' && onToggleMode) {
      onToggleMode('student');
    }
    if (onTabChange) onTabChange(tabId);
    setMobileMenuOpen(false);
  };

  const handleModeSwitch = (targetMode) => {
    if (onToggleMode) onToggleMode(targetMode);
    setMobileMenuOpen(false);
  };

  return (
    <header className="top-nav-bar">
      <div className="nav-container">
        {/* Left: Brand & Role tag */}
        <div className="brand-group">
          <div className="brand-logo-mark">
            <Bus size={20} className="brand-icon" />
            <span className="brand-pulse-glow" />
          </div>
          <div className="brand-text-block">
            <span className="brand-name">Campus<span className="brand-name-accent">Shuttle</span></span>
            <span className="brand-subtitle">Smart Mobility</span>
          </div>

          <div className={`role-badge-${currentMode === 'operator' ? 'operator' : 'student'}`}>
            <span className="role-student-dot" />
            <span>{currentMode === 'operator' ? 'Operator' : 'Student'}</span>
          </div>
        </div>

        {/* Center: Desktop Navigation links */}
        <nav className="desktop-nav-links" aria-label="Main Navigation">
          {currentMode === 'student' ? (
            studentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`nav-link-btn ${isActive ? 'nav-link-active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={16} className="nav-item-icon" />
                  <span>{item.label}</span>
                  {isActive && <span className="nav-active-pill" />}
                </button>
              );
            })
          ) : (
            <div className="operator-nav-indicator">
              <SlidersHorizontal size={15} className="text-cyan" />
              <span>Fleet Dispatch Console</span>
            </div>
          )}
        </nav>

        {/* Right: Live Status Indicator, Role Switcher & Profile */}
        <div className="nav-right-actions">
          {/* Role Mode Switcher Pill */}
          {onToggleMode && (
            <button
              type="button"
              className={`portal-switch-pill ${currentMode === 'operator' ? 'pill-is-operator' : ''}`}
              onClick={() => handleModeSwitch(currentMode === 'operator' ? 'student' : 'operator')}
              title={currentMode === 'operator' ? 'Switch to Student View' : 'Switch to Operator Fleet Dashboard'}
              aria-label="Toggle between Student and Operator dashboards"
            >
              {currentMode === 'operator' ? (
                <>
                  <User size={13} />
                  <span>Student View</span>
                </>
              ) : (
                <>
                  <SlidersHorizontal size={13} />
                  <span>Operator Portal</span>
                </>
              )}
            </button>
          )}

          {/* Live system indicator */}
          <div className="live-status-pill" title="Telemetry Feed Active & Synchronized">
            <span className="live-dot-pulse" />
            <span className="live-status-text">LIVE SYSTEM</span>
            <span className="live-status-latency">12ms</span>
          </div>

          <button 
            type="button" 
            className="nav-icon-button"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell size={17} />
            <span className="notif-badge-dot" />
          </button>

          {/* Sign In Entry Point */}
          {onOpenLogin && (
            <button
              type="button"
              className="nav-login-pill-btn"
              onClick={onOpenLogin}
              title="Sign in to your account"
              aria-label="Open Sign In page"
            >
              <LogIn size={13} />
              <span>Sign In</span>
            </button>
          )}

          <div 
            className="user-profile-summary"
            onClick={onOpenLogin}
            role={onOpenLogin ? 'button' : undefined}
            tabIndex={onOpenLogin ? 0 : undefined}
            title={onOpenLogin ? 'Click to Sign In / Manage Account' : undefined}
          >
            <div className={`avatar-chip ${currentMode === 'operator' ? 'operator-avatar-chip' : ''}`}>
              <span className="avatar-initials">{currentMode === 'operator' ? 'OP' : 'ST'}</span>
            </div>
          </div>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            className="mobile-hamburger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          <div className="mobile-drawer-inner">
            <div className="mobile-live-row">
              <div className="live-status-pill">
                <span className="live-dot-pulse" />
                <span className="live-status-text">LIVE SYSTEM</span>
              </div>
              <span className="mobile-role-tag">
                {currentMode === 'operator' ? 'Operator Console' : 'Student Portal'}
              </span>
            </div>

            {/* Mobile Mode Switcher Button */}
            {onToggleMode && (
              <button
                type="button"
                className="mobile-mode-switch-btn"
                onClick={() => handleModeSwitch(currentMode === 'operator' ? 'student' : 'operator')}
              >
                {currentMode === 'operator' ? (
                  <>
                    <User size={16} />
                    <span>Switch to Student Passenger View</span>
                  </>
                ) : (
                  <>
                    <SlidersHorizontal size={16} />
                    <span>Open Fleet Operator Dashboard</span>
                  </>
                )}
              </button>
            )}

            {currentMode === 'student' && (
              <nav className="mobile-nav-items">
                {studentNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`mobile-nav-btn ${isActive ? 'mobile-active' : ''}`}
                      onClick={() => handleNavClick(item.id)}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            <div className="mobile-drawer-footer">
              <div className="mobile-student-card">
                <div className={`avatar-chip ${currentMode === 'operator' ? 'operator-avatar-chip' : ''}`}>
                  <span className="avatar-initials">{currentMode === 'operator' ? 'OP' : 'ST'}</span>
                </div>
                <div className="student-drawer-info">
                  <span className="student-name">
                    {currentMode === 'operator' ? 'Dispatcher Station 1' : 'Student Account'}
                  </span>
                  <span className="student-sub">
                    {currentMode === 'operator' ? 'Supervisor Access' : 'ID: CS-2026-881'}
                  </span>
                </div>
              </div>

              {onOpenLogin && (
                <button
                  type="button"
                  className="mobile-drawer-login-btn"
                  onClick={() => {
                    onOpenLogin();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogIn size={15} />
                  <span>Sign In / Change Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
