import React, { useState } from 'react';
import { 
  Bus, 
  Layers, 
  Radio, 
  Crosshair, 
  Maximize2, 
  User, 
  MapPin, 
  Clock, 
  Gauge, 
  Users, 
  ShieldCheck, 
  Route, 
  ArrowLeft, 
  RefreshCw, 
  SlidersHorizontal,
  Compass,
  ArrowRight
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import MapView from './MapView';
import FleetSummaryCards from './FleetSummaryCards';
import FleetTable from './FleetTable';
import AttentionPanel from './AttentionPanel';
import { CAMPUS_STOPS } from '../data/mockShuttles';

/**
 * OperatorDashboard Component
 * Professional campus transit fleet control center for dispatchers & operators
 */
export default function OperatorDashboard({
  shuttles = [],
  selectedShuttleId,
  onSelectShuttle,
  onSwitchToStudent,
  lastUpdated = 'Just now',
  onRefreshTelemetry,
  isRefreshing
}) {
  const [focusTrigger, setFocusTrigger] = useState(0);

  // Active selected vehicle
  const selectedShuttle = shuttles.find((s) => s.id === selectedShuttleId) || shuttles[0];

  // Route progress calculations
  const stops = selectedShuttle?.stops || [];
  const totalStopsCount = stops.length;
  const passedStopsCount = stops.filter((s) => s.status === 'passed').length;
  const routeProgressPercent = totalStopsCount > 0 
    ? Math.round(((passedStopsCount + (selectedShuttle?.status === 'ON ROUTE' ? 0.5 : 0)) / totalStopsCount) * 100) 
    : 50;

  const handleTrackVehicle = (shuttle) => {
    if (shuttle && shuttle.id) {
      onSelectShuttle(shuttle);
    }
    setFocusTrigger((prev) => prev + 1);
    // On small screens, scroll up to the map
    const mapElement = document.querySelector('.operator-map-container');
    if (mapElement && window.innerWidth < 1024) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="operator-dashboard-page">
      {/* 1. OPERATOR HEADER */}
      <header className="operator-header-bar">
        <div className="operator-header-left">
          <div className="operator-brand-mark">
            <SlidersHorizontal size={20} className="operator-brand-icon" />
          </div>
          <div className="operator-titles">
            <div className="operator-title-row">
              <h1 className="operator-main-heading">Fleet Operations</h1>
              <span className="operator-status-badge">
                <span className="live-dot-pulse" />
                <span>ONLINE DISPATCH</span>
              </span>
            </div>
            <p className="operator-subheading">
              Campus Shuttle Control Center • Realtime Telematics & Dispatch Console
            </p>
          </div>
        </div>

        <div className="operator-header-right">
          {/* Telemetry Freshness */}
          <div className="operator-freshness-pill">
            <Radio size={14} className="freshness-radio-icon text-cyan" />
            <span className="operator-freshness-text">{lastUpdated}</span>
            {onRefreshTelemetry && (
              <button
                type="button"
                className={`operator-refresh-btn ${isRefreshing ? 'is-spinning' : ''}`}
                onClick={onRefreshTelemetry}
                title="Sync telematics"
                aria-label="Refresh telemetry"
              >
                <RefreshCw size={13} />
              </button>
            )}
          </div>

          {/* Operator Profile badge */}
          <div className="operator-profile-chip">
            <div className="operator-avatar">OP</div>
            <div className="operator-profile-info">
              <span className="operator-name">Dispatcher Station 1</span>
              <span className="operator-role">Supervisor Access</span>
            </div>
          </div>

          {/* Switch to Student View */}
          <button
            type="button"
            className="switch-view-btn"
            onClick={onSwitchToStudent}
            title="Switch to Student Passenger View"
          >
            <ArrowLeft size={15} />
            <span>Student View</span>
          </button>
        </div>
      </header>

      {/* 2. KPI / SUMMARY CARDS */}
      <section className="operator-kpi-section" aria-label="Fleet Performance Indicators">
        <FleetSummaryCards shuttles={shuttles} />
      </section>

      {/* MAIN OPERATOR LAYOUT: Map & Panels */}
      <div className="operator-main-layout">
        {/* LEFT COLUMN: Main Fleet Map & Active Fleet Table */}
        <div className="operator-primary-col">
          {/* 3. MAIN FLEET MAP */}
          <div className="operator-map-panel">
            <div className="operator-map-toolbar">
              <div className="map-toolbar-info">
                <span className="map-toolbar-title">Active Fleet Radar</span>
                <span className="map-toolbar-sub">
                  Monitoring {shuttles.length} Vehicles • Selected: <strong>{selectedShuttle?.name}</strong> ({selectedShuttle?.id})
                </span>
              </div>

              <div className="map-toolbar-actions">
                <button
                  type="button"
                  className="operator-map-tool-btn"
                  onClick={() => handleTrackVehicle(selectedShuttle)}
                  title="Recenter on selected vehicle"
                >
                  <Crosshair size={14} />
                  <span>Focus Vehicle</span>
                </button>
                <button
                  type="button"
                  className="operator-map-tool-btn"
                  onClick={() => {
                    const fullCampusBtn = document.querySelector('.map-actions-group button:last-child');
                    if (fullCampusBtn) fullCampusBtn.click();
                  }}
                  title="Show all campus corridors"
                >
                  <Maximize2 size={14} />
                  <span>Show All</span>
                </button>
              </div>
            </div>

            <div className="operator-map-container">
              <MapView
                shuttles={shuttles}
                selectedShuttle={selectedShuttle}
                onSelectShuttle={onSelectShuttle}
                campusStops={CAMPUS_STOPS}
                focusTrigger={focusTrigger}
                className="operator-leaflet-map"
              />
            </div>
          </div>

          {/* 4. ACTIVE FLEET PANEL */}
          <FleetTable
            shuttles={shuttles}
            selectedShuttleId={selectedShuttleId}
            onSelectShuttle={onSelectShuttle}
            onTrackVehicle={handleTrackVehicle}
            lastUpdated={lastUpdated}
          />
        </div>

        {/* RIGHT COLUMN: Selected Vehicle Panel, Route Overview, Attention Alerts */}
        <aside className="operator-sidebar-col">
          {/* 5. SELECTED VEHICLE PANEL */}
          <div className="selected-vehicle-panel">
            <div className="vehicle-panel-top">
              <div className="vehicle-identity-block">
                <div 
                  className="vehicle-avatar-box"
                  style={{ borderColor: `${selectedShuttle?.accentColor || '#06b6d4'}50` }}
                >
                  <Bus size={20} color={selectedShuttle?.accentColor || '#06b6d4'} />
                </div>
                <div>
                  <h3 className="vehicle-panel-name">{selectedShuttle?.name}</h3>
                  <span className="vehicle-panel-id">{selectedShuttle?.id} • Plate: {selectedShuttle?.numberPlate || 'KA-01-SH-4421'}</span>
                </div>
              </div>
              <StatusBadge status={selectedShuttle?.status} size="sm" />
            </div>

            {/* Quick Metrics Grid */}
            <div className="vehicle-stats-grid">
              <div className="v-stat-box">
                <span className="v-stat-label">Velocity</span>
                <div className="v-stat-val text-cyan">
                  <Gauge size={14} />
                  <span>{selectedShuttle?.speed || '24 km/h'}</span>
                </div>
              </div>

              <div className="v-stat-box">
                <span className="v-stat-label">Capacity</span>
                <div className="v-stat-val text-emerald">
                  <Users size={14} />
                  <span>{selectedShuttle?.occupancy || '42%'}</span>
                </div>
              </div>

              <div className="v-stat-box">
                <span className="v-stat-label">Next Stop</span>
                <div className="v-stat-val">
                  <MapPin size={14} className="text-amber" />
                  <span className="truncate-text">{selectedShuttle?.nextStop}</span>
                </div>
              </div>

              <div className="v-stat-box">
                <span className="v-stat-label">Stop ETA</span>
                <div className="v-stat-val">
                  <Clock size={14} className="text-cyan" />
                  <span>{selectedShuttle?.eta}</span>
                </div>
              </div>
            </div>

            {/* Driver & Telemetry Detail Metadata */}
            <div className="vehicle-telemetry-meta">
              <div className="meta-row">
                <span className="meta-key">Assigned Driver:</span>
                <strong className="meta-val">{selectedShuttle?.driverName || 'Rajesh Kumar'}</strong>
              </div>
              <div className="meta-row">
                <span className="meta-key">Corridor Line:</span>
                <strong className="meta-val">{selectedShuttle?.routeFullName || selectedShuttle?.route}</strong>
              </div>
              <div className="meta-row">
                <span className="meta-key">GPS Accuracy:</span>
                <strong className="meta-val text-emerald">High Precision (12 Sats Lock)</strong>
              </div>
              <div className="meta-row">
                <span className="meta-key">Last Sync:</span>
                <strong className="meta-val">{lastUpdated}</strong>
              </div>
            </div>

            {/* Action Button: Track Vehicle */}
            <button
              type="button"
              className="track-vehicle-action-btn"
              onClick={() => handleTrackVehicle(selectedShuttle)}
            >
              <Crosshair size={16} />
              <span>Track Vehicle on Map</span>
            </button>
          </div>

          {/* 6. ROUTE / STOP OVERVIEW */}
          <div className="operator-route-overview-panel">
            <div className="route-overview-header">
              <div className="route-title-group">
                <Route size={16} className="text-cyan" />
                <h4 className="route-overview-title">Active Route Progress</h4>
              </div>
              <span className="route-percent-badge">{routeProgressPercent}% Completed</span>
            </div>

            <div className="route-progress-bar-container">
              <div 
                className="route-progress-bar-fill" 
                style={{ width: `${routeProgressPercent}%` }} 
              />
            </div>

            <div className="route-stops-summary">
              <div className="stops-summary-item">
                <span className="stops-sub-label">Current / Last Stop</span>
                <strong className="stops-main-label">
                  {stops.find((s) => s.status === 'passed')?.name || stops[0]?.name || 'Hostel Complex'}
                </strong>
              </div>
              <div className="stops-summary-arrow">
                <ArrowRight size={14} />
              </div>
              <div className="stops-summary-item text-right">
                <span className="stops-sub-label">Next Scheduled</span>
                <strong className="stops-main-label text-cyan">{selectedShuttle?.nextStop}</strong>
              </div>
            </div>

            {/* Mini stop pills */}
            <div className="operator-stop-pills-row">
              {stops.map((st, idx) => {
                const isPassed = st.status === 'passed';
                const isTarget = st.isTarget || st.status === 'current';
                return (
                  <span 
                    key={st.id || idx} 
                    className={`operator-mini-stop-pill ${isTarget ? 'pill-target' : isPassed ? 'pill-passed' : 'pill-upcoming'}`}
                    title={`${st.name} (${st.eta})`}
                  >
                    {st.name.split(' ')[0]}
                  </span>
                );
              })}
            </div>
          </div>

          {/* 7. ATTENTION / ALERTS PANEL */}
          <AttentionPanel shuttles={shuttles} />
        </aside>
      </div>
    </div>
  );
}
