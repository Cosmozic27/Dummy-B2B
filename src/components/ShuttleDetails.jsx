import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Bus, 
  MapPin, 
  Clock, 
  Gauge, 
  Users, 
  User, 
  Crosshair, 
  ShieldCheck, 
  Radio, 
  ChevronRight, 
  Route, 
  Navigation,
  Compass
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import MapView from './MapView';
import UpcomingStops from './UpcomingStops';
import TelemetryCard from './TelemetryCard';
import { CAMPUS_STOPS } from '../data/mockShuttles';

/**
 * ShuttleDetails Component
 * Complete detail view for a specific shuttle selected by a student
 */
export default function ShuttleDetails({ 
  shuttle, 
  allShuttles = [], 
  onBack, 
  lastUpdated = 'Just now',
  onSelectAnotherShuttle,
  selectedStopId,
  onSelectStop
}) {
  const [focusTrigger, setFocusTrigger] = useState(0);

  if (!shuttle) {
    return (
      <div className="subview-container">
        <div className="subview-card">
          <p>No shuttle selected.</p>
          <button type="button" className="focus-shuttle-btn" onClick={onBack}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleTrackOnMap = () => {
    setFocusTrigger((prev) => prev + 1);
    // On mobile, scroll up to map smoothly
    const mapEl = document.querySelector('.shuttle-details-map-container');
    if (mapEl && window.innerWidth < 1024) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Route progression array
  const routeStopsList = shuttle.route 
    ? shuttle.route.split('→').map((s) => s.trim()) 
    : ['Hostel Complex', 'Central Library', 'Main Gate', 'Engineering Block', 'Sports Arena'];

  return (
    <div className="shuttle-details-page">
      {/* 1. HEADER SECTION */}
      <section className="details-header-section">
        <div className="details-header-container">
          <div className="details-header-left">
            <button 
              type="button" 
              className="back-to-dashboard-btn"
              onClick={onBack}
              aria-label="Back to Dashboard"
            >
              <ArrowLeft size={18} />
              <span>Back to Dashboard</span>
            </button>

            <div className="details-title-lockup">
              <div className="details-shuttle-badge">
                <span className="details-shuttle-super">Shuttle Details</span>
                <div className="details-shuttle-title-row">
                  <h1 className="details-shuttle-name">{shuttle.name.toUpperCase()}</h1>
                  <span className="details-shuttle-id-pill">{shuttle.id}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="details-header-right">
            <StatusBadge status={shuttle.status} size="lg" />
            <div className="details-live-beacon">
              <span className="live-dot-pulse" />
              <span className="details-live-text">LIVE SYSTEM</span>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN TWO-COLUMN RESPONSIVE LAYOUT */}
      <div className="details-layout-grid">
        {/* LEFT COLUMN: Large Map & Action Bar */}
        <div className="details-map-column">
          <div className="shuttle-details-map-container">
            {/* 2. LARGE MAP: Reuses existing MapView component */}
            <MapView
              shuttles={allShuttles.length > 0 ? allShuttles : [shuttle]}
              selectedShuttle={shuttle}
              onSelectShuttle={onSelectAnotherShuttle || (() => {})}
              campusStops={CAMPUS_STOPS}
              selectedStopId={selectedStopId}
              onSelectStop={onSelectStop}
              focusTrigger={focusTrigger}
              className="details-map-custom-view"
            />
          </div>

          {/* Quick Actions Bar underneath the map */}
          <div className="details-map-actions-bar">
            <button 
              type="button" 
              className="details-action-btn primary-action"
              onClick={handleTrackOnMap}
              title="Center and zoom on this shuttle's live coordinates"
            >
              <Crosshair size={16} />
              <span>Track on Map</span>
            </button>

            <button 
              type="button" 
              className="details-action-btn secondary-action"
              onClick={onBack}
              title="Return to the full student overview"
            >
              <ArrowLeft size={16} />
              <span>Back to Dashboard</span>
            </button>

            <div className="details-plate-display">
              <span className="details-plate-label">License:</span>
              <span className="details-plate-number">{shuttle.numberPlate || 'KA-01-SH-4421'}</span>
            </div>
          </div>

          {/* 5. ROUTE INFORMATION SECTION */}
          <div className="details-route-panel">
            <div className="details-route-header">
              <Route size={18} className="route-panel-icon" />
              <div>
                <h3 className="route-panel-title">CURRENT ROUTE</h3>
                <span className="details-route-sub">{shuttle.routeFullName || 'Standard Campus Corridor'}</span>
              </div>
            </div>

            {shuttle.trip && (
              <div className="details-trip-progress">
                <div className="details-trip-progress-copy">
                  <span>{shuttle.trip.active ? 'TRIP ACTIVE' : `TRIP ${shuttle.trip.status}`}</span>
                  <strong>{shuttle.trip.progressPercent}% complete</strong>
                </div>
                <div className="details-trip-progress-track">
                  <span style={{ width: `${shuttle.trip.progressPercent}%` }} />
                </div>
              </div>
            )}

            {/* Visual Route Progression Sequence */}
            <div className="route-visual-progression">
              {routeStopsList.map((stopName, idx) => {
                const isNextStop = stopName.toLowerCase().includes(shuttle.nextStop.toLowerCase()) || 
                                   shuttle.nextStop.toLowerCase().includes(stopName.toLowerCase());
                return (
                  <React.Fragment key={idx}>
                    <div className={`route-stop-node ${isNextStop ? 'node-is-target' : ''}`}>
                      <div className="node-stop-dot">
                        {isNextStop && <span className="target-pulse-center" />}
                      </div>
                      <span className="node-stop-label">{stopName}</span>
                      {isNextStop && <span className="node-target-tag">Next Stop</span>}
                    </div>
                    {idx < routeStopsList.length - 1 && (
                      <div className="route-arrow-connector">
                        <ChevronRight size={14} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Information Cards, Prominent ETA, Stops Timeline & Telemetry */}
        <aside className="details-info-column">
          {/* 4. PROMINENT ETA SECTION */}
          <div className="prominent-eta-card">
            <div className="eta-card-glow" />
            <div className="eta-top-row">
              <div className="eta-target-stop-block">
                <span className="eta-section-kicker">NEXT STOP</span>
                <div className="eta-stop-name-group">
                  <MapPin size={20} className="eta-pin-accent" />
                  <span className="eta-main-stop">{shuttle.nextStop}</span>
                </div>
              </div>

              <div className="eta-countdown-block">
                <span className="eta-section-kicker">ARRIVAL</span>
                <div className="eta-huge-time">
                  <Clock size={20} className="eta-clock-pulse" />
                  <span>{shuttle.eta}</span>
                </div>
              </div>
            </div>

            <div className="eta-sub-banner">
              <span className="eta-live-tag">
                <span className="live-dot-pulse" /> Live Telematics Sync
              </span>
              <span className="eta-speed-tag">Cruising at {shuttle.speed || '24 km/h'}</span>
            </div>
          </div>

          {/* 3. SHUTTLE INFORMATION CARD (Attractive Metric Cards) */}
          <div className="shuttle-info-overview-card">
            <div className="info-card-header">
              <div className="info-title-group">
                <div className="info-avatar">
                  <Bus size={22} color={shuttle.accentColor || '#06b6d4'} />
                </div>
                <div>
                  <h3 className="info-shuttle-title">{shuttle.name}</h3>
                  <span className="info-shuttle-subtitle">{shuttle.id} • {shuttle.routeFullName || shuttle.route}</span>
                </div>
              </div>
              <StatusBadge status={shuttle.status} size="sm" />
            </div>

            {/* Metrics Grid */}
            <div className="info-metrics-cards-grid">
              <div className="info-metric-card">
                <div className="metric-header-row">
                  <span className="metric-name">Current Speed</span>
                  <Gauge size={15} className="metric-icon text-cyan" />
                </div>
                <div className="metric-bold-value">{shuttle.speed || '24 km/h'}</div>
                <span className="metric-footer-note">Telemetry verified</span>
              </div>

              <div className="info-metric-card">
                <div className="metric-header-row">
                  <span className="metric-name">Occupancy</span>
                  <Users size={15} className="metric-icon text-emerald" />
                </div>
                <div className="metric-bold-value">{shuttle.occupancy || '42%'}</div>
                <span className="metric-footer-note">{shuttle.occupancyLabel || 'Moderate Seating'}</span>
              </div>

              <div className="info-metric-card">
                <div className="metric-header-row">
                  <span className="metric-name">Assigned Driver</span>
                  <User size={15} className="metric-icon text-amber" />
                </div>
                <div className="metric-bold-value driver-name-val">{shuttle.driverName || 'Rajesh Kumar'}</div>
                <span className="metric-footer-note">Transit Operations</span>
              </div>

              <div className="info-metric-card">
                <div className="metric-header-row">
                  <span className="metric-name">Last Updated</span>
                  <Clock size={15} className="metric-icon text-purple" />
                </div>
                <div className="metric-bold-value">{lastUpdated}</div>
                <span className="metric-footer-note">Auto-sync active</span>
              </div>
            </div>
          </div>

          {/* 6. LIVE TELEMETRY COMPONENT */}
          <TelemetryCard shuttle={shuttle} lastUpdated={lastUpdated} />

          {/* UPCOMING STOPS TIMELINE (Reused from UpcomingStops) */}
          <UpcomingStops
            selectedShuttle={shuttle}
            selectedStopId={selectedStopId}
            onSelectStop={onSelectStop}
          />
        </aside>
      </div>
    </div>
  );
}
