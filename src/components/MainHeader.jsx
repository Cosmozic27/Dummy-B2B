import React from 'react';
import { Radio, RefreshCw, Zap, Clock, ShieldCheck } from 'lucide-react';

/**
 * MainHeader Component
 * Displays system status, main titles, and telematics freshness indicator
 */
export default function MainHeader({ 
  lastUpdated = 'Updated just now', 
  activeCount = 4, 
  onManualRefresh, 
  isRefreshing 
}) {
  return (
    <section className="main-header-section">
      <div className="header-primary-row">
        <div className="header-titles">
          <div className="live-system-badge-container">
            <span className="live-pulse-dot" />
            <span className="live-system-tag">LIVE SYSTEM</span>
          </div>

          <h1 className="header-main-title">Campus Shuttle</h1>
          <p className="header-subtitle">Track your ride in real time.</p>
        </div>

        {/* Real-time freshness info */}
        <div className="header-telematics-panel">
          <div className="freshness-badge">
            <Clock size={13} className="freshness-icon" />
            <span className="freshness-label">{lastUpdated}</span>
            <button 
              type="button" 
              className={`refresh-icon-btn ${isRefreshing ? 'is-spinning' : ''}`}
              onClick={onManualRefresh}
              title="Sync GPS Telemetry"
              aria-label="Refresh GPS Telemetry"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          <div className="header-quick-stats">
            <div className="stat-pill">
              <span className="stat-value">{activeCount}</span>
              <span className="stat-label">Active Shuttles</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-pill">
              <span className="stat-value">~3-5m</span>
              <span className="stat-label">Avg Campus Wait</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
