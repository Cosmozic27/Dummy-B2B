import { Clock, Radio } from 'lucide-react';

export default function MainHeader({ lastUpdated = 'Waiting for telemetry', activeCount = 0, routeCount = 0 }) {
  return (
    <section className="main-header-section">
      <div className="header-primary-row">
        <div className="header-titles">
          <div className="live-system-badge-container"><span className="live-pulse-dot" /><span className="live-system-tag">LIVE SYSTEM</span></div>
          <h1 className="header-main-title">Campus Shuttle</h1>
          <p className="header-subtitle">Track your ride from live campus data.</p>
        </div>
        <div className="header-telematics-panel">
          <div className="freshness-badge"><Clock size={13} className="freshness-icon" /><span className="freshness-label">{lastUpdated}</span><Radio size={13} aria-label="Realtime Firestore feed" /></div>
          <div className="header-quick-stats">
            <div className="stat-pill"><span className="stat-value">{activeCount}</span><span className="stat-label">Active Vehicles</span></div>
            <div className="stat-divider" />
            <div className="stat-pill"><span className="stat-value">{routeCount}</span><span className="stat-label">Active Routes</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}
