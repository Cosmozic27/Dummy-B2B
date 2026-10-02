import { useState } from 'react';
import {
  ArrowLeft,
  Bus,
  ChevronRight,
  Clock,
  Crosshair,
  Gauge,
  MapPin,
  Route,
  User,
  Users,
} from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';
import MapView from './MapView.jsx';
import UpcomingStops from './UpcomingStops.jsx';
import TelemetryCard from './TelemetryCard.jsx';

export default function ShuttleDetails({
  shuttle,
  allShuttles = [],
  routes = [],
  campusStops = [],
  onBack,
  lastUpdated = 'Just now',
  onSelectAnotherShuttle,
  selectedStopId,
  onSelectStop,
}) {
  const [focusTrigger, setFocusTrigger] = useState(0);

  if (!shuttle) {
    return (
      <div className="subview-container">
        <div className="subview-card">
          <p>No shuttle selected.</p>
          <button type="button" className="focus-shuttle-btn" onClick={onBack}><ArrowLeft size={16} /> Back to Dashboard</button>
        </div>
      </div>
    );
  }

  const handleTrackOnMap = () => {
    setFocusTrigger((previous) => previous + 1);
    const mapElement = document.querySelector('.shuttle-details-map-container');
    if (mapElement && window.innerWidth < 1024) mapElement.scrollIntoView({ behavior: 'smooth' });
  };

  const routeStops = shuttle.stops || [];

  return (
    <div className="shuttle-details-page">
      <section className="details-header-section">
        <div className="details-header-container">
          <div className="details-header-left">
            <button type="button" className="back-to-dashboard-btn" onClick={onBack} aria-label="Back to Dashboard"><ArrowLeft size={18} /><span>Back to Dashboard</span></button>
            <div className="details-title-lockup">
              <div className="details-shuttle-badge">
                <span className="details-shuttle-super">Shuttle Details</span>
                <div className="details-shuttle-title-row"><h1 className="details-shuttle-name">{shuttle.name.toUpperCase()}</h1><span className="details-shuttle-id-pill">{shuttle.id}</span></div>
              </div>
            </div>
          </div>
          <div className="details-header-right"><StatusBadge status={shuttle.status} size="lg" /><div className="details-live-beacon"><span className="live-dot-pulse" /><span className="details-live-text">LIVE FIRESTORE</span></div></div>
        </div>
      </section>

      <div className="details-layout-grid">
        <div className="details-map-column">
          <div className="shuttle-details-map-container">
            <MapView
              shuttles={allShuttles.length > 0 ? allShuttles : [shuttle]}
              selectedShuttle={shuttle}
              onSelectShuttle={onSelectAnotherShuttle || (() => {})}
              routes={routes}
              campusStops={campusStops}
              selectedStopId={selectedStopId}
              onSelectStop={onSelectStop}
              focusTrigger={focusTrigger}
              className="details-map-custom-view"
            />
          </div>

          <div className="details-map-actions-bar">
            <button type="button" className="details-action-btn primary-action" onClick={handleTrackOnMap} title="Center on this shuttle's live coordinates"><Crosshair size={16} /><span>Track on Map</span></button>
            <button type="button" className="details-action-btn secondary-action" onClick={onBack} title="Return to the student overview"><ArrowLeft size={16} /><span>Back to Dashboard</span></button>
            <div className="details-plate-display"><span className="details-plate-label">Vehicle ID:</span><span className="details-plate-number">{shuttle.id}</span></div>
          </div>

          <div className="details-route-panel">
            <div className="details-route-header"><Route size={18} className="route-panel-icon" /><div><h3 className="route-panel-title">CURRENT ROUTE</h3><span className="details-route-sub">{shuttle.routeFullName || 'No route assigned'}</span></div></div>
            {shuttle.trip && (
              <div className="details-trip-progress">
                <div className="details-trip-progress-copy"><span>TRIP ACTIVE</span><strong>{shuttle.trip.progressPercent}% complete</strong></div>
                <div className="details-trip-progress-track"><span style={{ width: `${shuttle.trip.progressPercent}%` }} /></div>
              </div>
            )}
            {routeStops.length > 0 ? (
              <div className="route-visual-progression">
                {routeStops.map((stop, index) => {
                  const isNextStop = stop.isTarget || stop.status === 'current';
                  return (
                    <span className="route-visual-stop-group" key={stop.id || index}>
                      <div className={`route-stop-node ${isNextStop ? 'node-is-target' : ''}`}>
                        <div className="node-stop-dot">{isNextStop && <span className="target-pulse-center" />}</div>
                        <span className="node-stop-label">{stop.name}</span>
                        {isNextStop && <span className="node-target-tag">Next Stop</span>}
                      </div>
                      {index < routeStops.length - 1 && <div className="route-arrow-connector"><ChevronRight size={14} /></div>}
                    </span>
                  );
                })}
              </div>
            ) : <p className="route-empty-note">No route stops are assigned to this vehicle.</p>}
          </div>
        </div>

        <aside className="details-info-column">
          <div className="prominent-eta-card">
            <div className="eta-card-glow" />
            <div className="eta-top-row">
              <div className="eta-target-stop-block"><span className="eta-section-kicker">NEXT STOP</span><div className="eta-stop-name-group"><MapPin size={20} className="eta-pin-accent" /><span className="eta-main-stop">{shuttle.nextStop}</span></div></div>
              <div className="eta-countdown-block"><span className="eta-section-kicker">ARRIVAL</span><div className="eta-huge-time"><Clock size={20} className="eta-clock-pulse" /><span>{shuttle.eta}</span></div></div>
            </div>
            <div className="eta-sub-banner"><span className="eta-live-tag"><span className="live-dot-pulse" /> Live Firestore Sync</span><span className="eta-speed-tag">{shuttle.speed}</span></div>
          </div>

          <div className="shuttle-info-overview-card">
            <div className="info-card-header">
              <div className="info-title-group"><div className="info-avatar"><Bus size={22} color={shuttle.accentColor || '#06b6d4'} /></div><div><h3 className="info-shuttle-title">{shuttle.name}</h3><span className="info-shuttle-subtitle">{shuttle.id} · {shuttle.routeFullName}</span></div></div>
              <StatusBadge status={shuttle.status} size="sm" />
            </div>
            <div className="info-metrics-cards-grid">
              <div className="info-metric-card"><div className="metric-header-row"><span className="metric-name">Current Speed</span><Gauge size={15} className="metric-icon text-cyan" /></div><div className="metric-bold-value">{shuttle.speed}</div><span className="metric-footer-note">Vehicle document</span></div>
              <div className="info-metric-card"><div className="metric-header-row"><span className="metric-name">Crowding</span><Users size={15} className="metric-icon text-emerald" /></div><div className="metric-bold-value">{shuttle.crowding}</div><span className="metric-footer-note">Reported value</span></div>
              <div className="info-metric-card"><div className="metric-header-row"><span className="metric-name">Assigned Driver</span><User size={15} className="metric-icon text-amber" /></div><div className="metric-bold-value driver-name-val">{shuttle.driverName || 'Not provided'}</div><span className="metric-footer-note">Not in current schema</span></div>
              <div className="info-metric-card"><div className="metric-header-row"><span className="metric-name">Last Updated</span><Clock size={15} className="metric-icon text-purple" /></div><div className="metric-bold-value">{lastUpdated}</div><span className="metric-footer-note">Realtime snapshot</span></div>
            </div>
          </div>

          <TelemetryCard shuttle={shuttle} lastUpdated={lastUpdated} />
          <UpcomingStops selectedShuttle={shuttle} selectedStopId={selectedStopId} onSelectStop={onSelectStop} />
        </aside>
      </div>
    </div>
  );
}
