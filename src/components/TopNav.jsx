import { useState } from 'react';
import { Activity, Bell, Bookmark, Bus, Compass, Menu, SlidersHorizontal, User, X } from 'lucide-react';

export default function TopNav({ activeTab = 'Dashboard', onTabChange, currentMode = 'student', onToggleMode, onOpenLogin }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const studentNavItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: Compass },
    { id: 'MyShuttle', label: 'My Shuttle', icon: Bookmark },
    { id: 'Profile', label: 'Profile', icon: User },
  ];
  const handleNavClick = (tabId) => {
    if (currentMode === 'operator') onToggleMode?.('student');
    onTabChange?.(tabId);
    setMobileMenuOpen(false);
  };
  const handleModeSwitch = (mode) => { onToggleMode?.(mode); setMobileMenuOpen(false); };

  return (
    <header className="top-nav-bar">
      <div className="nav-container">
        <div className="brand-group"><div className="brand-logo-mark"><Bus size={20} className="brand-icon" /><span className="brand-pulse-glow" /></div><div className="brand-text-block"><span className="brand-name">Campus<span className="brand-name-accent">Shuttle</span></span><span className="brand-subtitle">Smart Mobility</span></div><div className={`role-badge-${currentMode === 'operator' ? 'operator' : 'student'}`}><span className="role-student-dot" /><span>{currentMode === 'operator' ? 'Operator' : 'Student'}</span></div></div>
        <nav className="desktop-nav-links" aria-label="Main Navigation">{currentMode === 'student' ? studentNavItems.map((item) => { const Icon = item.icon; const isActive = activeTab === item.id; return <button key={item.id} type="button" className={`nav-link-btn ${isActive ? 'nav-link-active' : ''}`} onClick={() => handleNavClick(item.id)} aria-current={isActive ? 'page' : undefined}><Icon size={16} className="nav-item-icon" /><span>{item.label}</span>{isActive && <span className="nav-active-pill" />}</button>; }) : <div className="operator-nav-indicator"><SlidersHorizontal size={15} className="text-cyan" /><span>Fleet Dispatch Console</span></div>}</nav>
        <div className="nav-right-actions">
          {onToggleMode && <button type="button" className={`portal-switch-pill ${currentMode === 'operator' ? 'pill-is-operator' : ''}`} onClick={() => handleModeSwitch(currentMode === 'operator' ? 'student' : 'operator')} title={currentMode === 'operator' ? 'Switch to Student View' : 'Switch to Operator Fleet Dashboard'} aria-label="Toggle between Student and Operator dashboards">{currentMode === 'operator' ? <><User size={13} /><span>Student View</span></> : <><SlidersHorizontal size={13} /><span>Operator Portal</span></>}</button>}
          <div className="live-status-pill" title="Connected to Firestore realtime snapshots"><span className="live-dot-pulse" /><span className="live-status-text">LIVE DATA</span><span className="live-status-latency">SYNC</span></div>
          <button type="button" className="nav-icon-button" title="Notifications" aria-label="View notifications"><Bell size={17} /><span className="notif-badge-dot" /></button>
          {onOpenLogin && <button type="button" className="nav-login-pill-btn" onClick={onOpenLogin} title="Sign in to your account" aria-label="Open Sign In page"><Activity size={13} /><span>Sign In</span></button>}
          <div className="user-profile-summary" onClick={onOpenLogin} role={onOpenLogin ? 'button' : undefined} tabIndex={onOpenLogin ? 0 : undefined} title={onOpenLogin ? 'Click to Sign In / Manage Account' : undefined}><div className={`avatar-chip ${currentMode === 'operator' ? 'operator-avatar-chip' : ''}`}><span className="avatar-initials">{currentMode === 'operator' ? 'OP' : 'ST'}</span></div></div>
          <button type="button" className="mobile-hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle mobile menu" aria-expanded={mobileMenuOpen}>{mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </div>
      {mobileMenuOpen && <div className="mobile-nav-drawer"><div className="mobile-drawer-inner"><div className="mobile-live-row"><div className="live-status-pill"><span className="live-dot-pulse" /><span className="live-status-text">LIVE DATA</span></div><span className="mobile-role-tag">{currentMode === 'operator' ? 'Operator Console' : 'Student Portal'}</span></div>
        {onToggleMode && <button type="button" className="mobile-mode-switch-btn" onClick={() => handleModeSwitch(currentMode === 'operator' ? 'student' : 'operator')}>{currentMode === 'operator' ? <><User size={16} /><span>Switch to Student Passenger View</span></> : <><SlidersHorizontal size={16} /><span>Open Fleet Operator Dashboard</span></>}</button>}
        {currentMode === 'student' && <nav className="mobile-nav-items">{studentNavItems.map((item) => { const Icon = item.icon; const isActive = activeTab === item.id; return <button key={item.id} type="button" className={`mobile-nav-btn ${isActive ? 'mobile-active' : ''}`} onClick={() => handleNavClick(item.id)}><Icon size={18} /><span>{item.label}</span></button>; })}</nav>}
        <div className="mobile-drawer-footer"><div className="mobile-student-card"><div className={`avatar-chip ${currentMode === 'operator' ? 'operator-avatar-chip' : ''}`}><span className="avatar-initials">{currentMode === 'operator' ? 'OP' : 'ST'}</span></div><div className="student-drawer-info"><span className="student-name">{currentMode === 'operator' ? 'Dispatcher' : 'Student Account'}</span><span className="student-sub">{currentMode === 'operator' ? 'Demo operator view' : 'Passenger view'}</span></div></div>{onOpenLogin && <button type="button" className="mobile-drawer-login-btn" onClick={() => { onOpenLogin(); setMobileMenuOpen(false); }}><span>Sign In / Change Account</span></button>}</div>
      </div></div>}
    </header>
  );
}
