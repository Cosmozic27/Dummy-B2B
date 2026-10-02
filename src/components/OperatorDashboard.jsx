import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bus,
  Clock,
  Crosshair,
  Gauge,
  MapPin,
  Maximize2,
  Radio,
  Route,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import MapView from './MapView.jsx';
import FleetSummaryCards from './FleetSummaryCards.jsx';
import FleetTable from './FleetTable.jsx';
import AttentionPanel from './AttentionPanel.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function OperatorDashboard({
  shuttles = [],
  routes = [],
  campusStops = [],
  selectedShuttleId,
  onSelectShuttle,
  onStartTrip,
  onStopTrip,
  onSetDelay,
  onClearDelay,
  onCreateRoute,
  onSwitchToStudent,
  lastUpdated = 'Just now',
}) {
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [routeSelection, setRouteSelection] = useState(null);
  const [simulationSpeed, setSimulationSpeed] = useState(20);
  const [delayMinutes, setDelayMinutes] = useState(5);
  const [routeName, setRouteName] = useState('');
  const [orderedStopIds, setOrderedStopIds] = useState([]);
  const [routeColor, setRouteColor] = useState('#06b6d4');
  const [stopToAdd, setStopToAdd] = useState('');
  const [routeSaving, setRouteSaving] = useState(false);
  const [routeMessage, setRouteMessage] = useState('');

  const selectedShuttle = shuttles.find((shuttle) => shuttle.id === selectedShuttleId) || shuttles[0] || null;
  const activeRoutes = routes.filter((route) => route.active !== false);
  const defaultRouteId = activeRoutes.some((route) => route.id === selectedShuttle?.routeId)
    ? selectedShuttle?.routeId
    : activeRoutes[0]?.id;
  const selectedRouteId = routeSelection?.vehicleId === selectedShuttle?.id
    ? routeSelection.routeId
    : defaultRouteId;
  const selectedRoute = activeRoutes.find((route) => route.id === selectedRouteId) || null;
  const tripIsActive = Boolean(selectedShuttle?.isMoving);
  const routeStops = selectedShuttle?.stops || [];
  const routeProgressPercent = selectedShuttle?.trip?.progressPercent || 0;
  const availableStops = campusStops.filter((stop) => !orderedStopIds.includes(stop.id));

  const handleTrackVehicle = (shuttle) => {
    if (shuttle?.id) onSelectShuttle?.(shuttle);
    setFocusTrigger((previous) => previous + 1);
    const mapElement = document.querySelector('.operator-map-container');
    if (mapElement && window.innerWidth < 1024) mapElement.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddStop = () => {
    if (!stopToAdd || orderedStopIds.includes(stopToAdd)) return;
    setOrderedStopIds((current) => [...current, stopToAdd]);
    setStopToAdd('');
  };

  const handleMoveStop = (index, offset) => {
    setOrderedStopIds((current) => {
      const destination = index + offset;
      if (destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  };

  const handleSaveRoute = async (event) => {
    event.preventDefault();
    if (!routeName.trim() || orderedStopIds.length < 2) {
      setRouteMessage('Add a route name and at least two stops in order.');
      return;
    }

    setRouteSaving(true);
    setRouteMessage('');
    try {
      const result = await onCreateRoute?.({ name: routeName, stopIds: orderedStopIds, color: routeColor });
      if (result === false) return;
      setRouteMessage('Route saved to Firestore.');
      setRouteName('');
      setOrderedStopIds([]);
      setStopToAdd('');
    } finally {
      setRouteSaving(false);
    }
  };

  return (
    <div className="operator-dashboard-page">
      <header className="operator-header-bar">
        <div className="operator-header-left">
          <div className="operator-brand-mark"><SlidersHorizontal size={20} className="operator-brand-icon" /></div>
          <div className="operator-titles">
            <div className="operator-title-row">
              <h1 className="operator-main-heading">Fleet Operations</h1>
              <span className="operator-status-badge"><span className="live-dot-pulse" /><span>LIVE DISPATCH</span></span>
            </div>
            <p className="operator-subheading">Campus shuttle control center · Firestore live telemetry</p>
          </div>
        </div>

        <div className="operator-header-right">
          <div className="operator-freshness-pill"><Radio size={14} className="freshness-radio-icon text-cyan" /><span className="operator-freshness-text">{lastUpdated}</span></div>
          <div className="operator-profile-chip">
            <div className="operator-avatar">OP</div>
            <div className="operator-profile-info"><span className="operator-name">Dispatcher</span><span className="operator-role">Demo operator view</span></div>
          </div>
          <button type="button" className="switch-view-btn" onClick={onSwitchToStudent} title="Switch to Student Passenger View">
            <ArrowLeft size={15} /><span>Student View</span>
          </button>
        </div>
      </header>

      <section className="operator-kpi-section" aria-label="Fleet Performance Indicators">
        <FleetSummaryCards shuttles={shuttles} />
      </section>

      <div className="operator-main-layout">
        <div className="operator-primary-col">
          <div className="operator-map-panel">
            <div className="operator-map-toolbar">
              <div className="map-toolbar-info">
                <span className="map-toolbar-title">Campus Fleet Radar</span>
                <span className="map-toolbar-sub">{shuttles.length} vehicles · Selected: <strong>{selectedShuttle?.name || 'None'}</strong></span>
              </div>
              <div className="map-toolbar-actions">
                <button type="button" className="operator-map-tool-btn" onClick={() => handleTrackVehicle(selectedShuttle)} title="Recenter on selected vehicle">
                  <Crosshair size={14} /><span>Focus Vehicle</span>
                </button>
                <button type="button" className="operator-map-tool-btn" onClick={() => document.querySelector('.map-actions-group button:last-child')?.click()} title="Show all campus corridors">
                  <Maximize2 size={14} /><span>Show All</span>
                </button>
              </div>
            </div>
            <div className="operator-map-container">
              <MapView
                shuttles={shuttles}
                selectedShuttle={selectedShuttle}
                onSelectShuttle={onSelectShuttle}
                routes={routes}
                campusStops={campusStops}
                focusTrigger={focusTrigger}
                className="operator-leaflet-map"
              />
            </div>
          </div>

          <FleetTable
            shuttles={shuttles}
            selectedShuttleId={selectedShuttle?.id}
            onSelectShuttle={onSelectShuttle}
            onTrackVehicle={handleTrackVehicle}
            lastUpdated={lastUpdated}
          />
        </div>

        <aside className="operator-sidebar-col">
          <section className="trip-control-panel" aria-labelledby="trip-control-title">
            <div className="trip-control-heading">
              <div><span className="trip-control-kicker">OPERATOR DISPATCH</span><h3 id="trip-control-title">Trip Simulation</h3></div>
              <span className={`trip-state-pill ${tripIsActive ? 'trip-state-active' : ''}`}><span />{tripIsActive ? 'TRIP ACTIVE' : 'READY'}</span>
            </div>

            <div className="trip-control-fields">
              <label>
                <span>Vehicle</span>
                <select value={selectedShuttle?.id || ''} onChange={(event) => onSelectShuttle?.(event.target.value)} aria-label="Select vehicle for trip simulation">
                  {shuttles.map((shuttle) => <option key={shuttle.id} value={shuttle.id}>{shuttle.id} · {shuttle.name}</option>)}
                </select>
              </label>
              <label>
                <span>Route</span>
                <select
                  value={selectedRoute?.id || ''}
                  onChange={(event) => setRouteSelection({ vehicleId: selectedShuttle?.id, routeId: event.target.value })}
                  aria-label="Select route for trip simulation"
                  disabled={activeRoutes.length === 0}
                >
                  {activeRoutes.map((route) => <option key={route.id} value={route.id}>{route.name} · {route.stopIds?.length || 0} stops</option>)}
                </select>
              </label>
              <label>
                <span>Vehicle speed</span>
                <select value={simulationSpeed} onChange={(event) => setSimulationSpeed(Number(event.target.value))} aria-label="Select simulated vehicle speed">
                  {[10, 20, 40].map((speed) => <option key={speed} value={speed}>{speed} km/h</option>)}
                </select>
              </label>
            </div>

            {tripIsActive ? (
              <button type="button" className="trip-stop-button" onClick={() => onStopTrip?.(selectedShuttle.id)}>STOP SIMULATION</button>
            ) : (
              <button type="button" className="trip-start-button" onClick={() => onStartTrip?.(selectedShuttle?.id, selectedRoute?.id, simulationSpeed)} disabled={!selectedShuttle || !selectedRoute}>
                START TRIP
              </button>
            )}

            {selectedShuttle?.trip && (
              <div className="trip-control-summary" aria-live="polite">
                <div className="trip-summary-progress">
                  <span>Route progress</span><strong>{selectedShuttle.trip.progressPercent}%</strong>
                  <div className="trip-summary-track"><span style={{ width: `${selectedShuttle.trip.progressPercent}%` }} /></div>
                </div>
                <div><span>Previous stop</span><strong>{selectedShuttle.trip.currentStop}</strong></div>
                <div><span>Next stop · ETA</span><strong>{selectedShuttle.trip.nextStop} · {selectedShuttle.eta}</strong></div>
                <div><span>Route · speed</span><strong>{selectedShuttle.routeFullName} · {selectedShuttle.speed}</strong></div>
              </div>
            )}
            <p className="trip-control-note">Demo simulation writes only the existing vehicle route, coordinate, speed, status, and next-stop fields.</p>
          </section>

          <section className="selected-vehicle-panel">
            <div className="vehicle-panel-top">
              <div className="vehicle-identity-block">
                <div className="vehicle-avatar-box" style={{ borderColor: `${selectedShuttle?.accentColor || '#06b6d4'}50` }}><Bus size={20} color={selectedShuttle?.accentColor || '#06b6d4'} /></div>
                <div><h3 className="vehicle-panel-name">{selectedShuttle?.name || 'No vehicle selected'}</h3><span className="vehicle-panel-id">Document: {selectedShuttle?.id || '—'}</span></div>
              </div>
              <StatusBadge status={selectedShuttle?.status} size="sm" />
            </div>

            <div className="vehicle-stats-grid">
              <div className="v-stat-box"><span className="v-stat-label">Speed</span><div className="v-stat-val text-cyan"><Gauge size={14} /><span>{selectedShuttle?.speed || '—'}</span></div></div>
              <div className="v-stat-box"><span className="v-stat-label">Crowding</span><div className="v-stat-val text-emerald"><Users size={14} /><span>{selectedShuttle?.crowding || 'Not reported'}</span></div></div>
              <div className="v-stat-box"><span className="v-stat-label">Next Stop</span><div className="v-stat-val"><MapPin size={14} className="text-amber" /><span className="truncate-text">{selectedShuttle?.nextStop || '—'}</span></div></div>
              <div className="v-stat-box"><span className="v-stat-label">Stop ETA</span><div className="v-stat-val"><Clock size={14} className="text-cyan" /><span>{selectedShuttle?.eta || 'No ETA'}</span></div></div>
            </div>

            <div className="vehicle-telemetry-meta">
              <div className="meta-row"><span className="meta-key">Route:</span><strong className="meta-val">{selectedShuttle?.routeFullName || 'Not assigned'}</strong></div>
              <div className="meta-row"><span className="meta-key">Assigned driver:</span><strong className="meta-val">{selectedShuttle?.driverName || 'Not provided'}</strong></div>
              <div className="meta-row"><span className="meta-key">Coordinates:</span><strong className="meta-val">{Number.isFinite(selectedShuttle?.latitude) ? `${selectedShuttle.latitude.toFixed(5)}, ${selectedShuttle.longitude.toFixed(5)}` : 'Not available'}</strong></div>
              <div className="meta-row"><span className="meta-key">Last sync:</span><strong className="meta-val">{lastUpdated}</strong></div>
            </div>

            <div className="vehicle-delay-controls">
              <label htmlFor="delay-minutes">Delay (minutes)</label>
              <div className="vehicle-delay-actions">
                <select id="delay-minutes" value={delayMinutes} onChange={(event) => setDelayMinutes(Number(event.target.value))}>
                  {[5, 10, 15].map((minutes) => <option key={minutes} value={minutes}>{minutes} min</option>)}
                </select>
                {selectedShuttle?.isDelayed ? (
                  <button type="button" className="delay-clear-button" onClick={() => onClearDelay?.(selectedShuttle.id)}>Clear delay · {selectedShuttle.delayMinutes} min</button>
                ) : (
                  <button type="button" className="delay-set-button" onClick={() => onSetDelay?.(selectedShuttle?.id, delayMinutes)} disabled={!selectedShuttle}>Mark delayed</button>
                )}
              </div>
              <small>Delay status and minutes sync to the existing vehicle document.</small>
            </div>

            <button type="button" className="track-vehicle-action-btn" onClick={() => handleTrackVehicle(selectedShuttle)} disabled={!selectedShuttle}>
              <Crosshair size={16} /><span>Track Vehicle on Map</span>
            </button>
          </section>

          <section className="operator-route-overview-panel">
            <div className="route-overview-header">
              <div className="route-title-group"><Route size={16} className="text-cyan" /><h4 className="route-overview-title">Selected Route Progress</h4></div>
              <span className="route-percent-badge">{routeProgressPercent}%</span>
            </div>
            <div className="route-progress-bar-container"><div className="route-progress-bar-fill" style={{ width: `${routeProgressPercent}%` }} /></div>
            <div className="route-stops-summary">
              <div className="stops-summary-item"><span className="stops-sub-label">Previous stop</span><strong className="stops-main-label">{selectedShuttle?.trip?.currentStop || 'Not started'}</strong></div>
              <div className="stops-summary-arrow"><ArrowRight size={14} /></div>
              <div className="stops-summary-item text-right"><span className="stops-sub-label">Next stop</span><strong className="stops-main-label text-cyan">{selectedShuttle?.nextStop || '—'}</strong></div>
            </div>
            <div className="operator-stop-pills-row">
              {routeStops.map((stop) => {
                const isPassed = stop.status === 'passed';
                const isTarget = stop.isTarget || stop.status === 'current';
                return <span key={stop.id} className={`operator-mini-stop-pill ${isTarget ? 'pill-target' : isPassed ? 'pill-passed' : 'pill-upcoming'}`} title={`${stop.name} · ${stop.eta}`}>{stop.name}</span>;
              })}
              {routeStops.length === 0 && <span className="route-empty-note">No route assigned</span>}
            </div>
          </section>

          <section className="route-management-card" aria-labelledby="create-route-title">
            <div className="route-management-heading"><div><span className="trip-control-kicker">FIRESTORE ROUTES</span><h3 id="create-route-title">Create a Route</h3></div><Route size={18} /></div>
            <form onSubmit={handleSaveRoute}>
              <label className="route-form-field"><span>Route name</span><input value={routeName} onChange={(event) => setRouteName(event.target.value)} maxLength={60} placeholder="e.g. North Campus Loop" /></label>
              <div className="route-stop-adder">
                <label className="route-form-field"><span>Add existing stop</span>
                  <select value={stopToAdd} onChange={(event) => setStopToAdd(event.target.value)}>
                    <option value="">Choose a stop</option>
                    {availableStops.map((stop) => <option key={stop.id} value={stop.id}>{stop.name}</option>)}
                  </select>
                </label>
                <button type="button" className="route-add-stop-button" onClick={handleAddStop} disabled={!stopToAdd}>Add</button>
              </div>
              <ol className="ordered-route-stops">
                {orderedStopIds.map((stopId, index) => {
                  const stop = campusStops.find((item) => item.id === stopId);
                  return (
                    <li key={stopId}>
                      <span className="route-stop-order">{index + 1}</span><span className="route-stop-name">{stop?.name || stopId}</span>
                      <button type="button" onClick={() => handleMoveStop(index, -1)} disabled={index === 0} aria-label={`Move ${stop?.name || 'stop'} earlier`}>↑</button>
                      <button type="button" onClick={() => handleMoveStop(index, 1)} disabled={index === orderedStopIds.length - 1} aria-label={`Move ${stop?.name || 'stop'} later`}>↓</button>
                      <button type="button" onClick={() => setOrderedStopIds((current) => current.filter((id) => id !== stopId))} aria-label={`Remove ${stop?.name || 'stop'}`}>×</button>
                    </li>
                  );
                })}
              </ol>
              <div className="route-form-footer">
                <label className="route-color-field"><span>Line color</span><input type="color" value={routeColor} onChange={(event) => setRouteColor(event.target.value)} aria-label="Choose route color" /></label>
                <button type="submit" className="route-save-button" disabled={routeSaving || !routeName.trim() || orderedStopIds.length < 2}>{routeSaving ? 'Saving…' : 'Save Route'}</button>
              </div>
              {routeMessage && <p className="route-form-message" role="status">{routeMessage}</p>}
              <p className="route-form-note">Saves only the existing route fields: name, ordered stopIds, color, and active.</p>
            </form>
          </section>

          <AttentionPanel shuttles={shuttles} />
        </aside>
      </div>
    </div>
  );
}
