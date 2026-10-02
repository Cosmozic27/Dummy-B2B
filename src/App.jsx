import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bookmark, CheckCircle2, ShieldCheck } from 'lucide-react';
import Login from './pages/Login.jsx';
import TopNav from './components/TopNav.jsx';
import MainHeader from './components/MainHeader.jsx';
import MapView from './components/MapView.jsx';
import NextArrivalCard from './components/NextArrivalCard.jsx';
import ShuttleList from './components/ShuttleList.jsx';
import UpcomingStops from './components/UpcomingStops.jsx';
import ShuttleDetails from './components/ShuttleDetails.jsx';
import OperatorDashboard from './components/OperatorDashboard.jsx';
import StopArrivalsPanel from './components/StopArrivalsPanel.jsx';
import { TransitProvider } from './context/TransitContext.jsx';
import { useTransit } from './context/useTransit.js';
import { toCampusStopView, toShuttleView } from './services/transitViewModel.js';
import './styles/dashboard.css';

function timestampMillis(value) {
  if (typeof value?.toMillis === 'function') return value.toMillis();
  if (typeof value?.seconds === 'number') return value.seconds * 1000;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatLastUpdated(now, lastUpdatedAt) {
  if (!lastUpdatedAt) return 'Waiting for telemetry';
  const seconds = Math.max(0, Math.floor((now - lastUpdatedAt) / 1000));
  if (seconds < 5) return 'Updated just now';
  if (seconds < 60) return `Updated ${seconds}s ago`;
  return `Updated ${Math.floor(seconds / 60)}m ago`;
}

function DashboardApp() {
  const {
    vehicles,
    routes,
    stops,
    loading,
    error,
    setError,
    startTrip,
    stopTrip,
    setVehicleDelay,
    clearVehicleDelay,
    createRoute,
  } = useTransit();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentMode, setCurrentMode] = useState('student');
  const [selectedShuttleId, setSelectedShuttleId] = useState('');
  const [selectedStopId, setSelectedStopId] = useState('');
  const [clockNow, setClockNow] = useState(() => Date.now());

  const campusStops = useMemo(() => stops.map(toCampusStopView), [stops]);
  const shuttles = useMemo(() => vehicles
    .map((vehicle) => toShuttleView(vehicle, routes, stops))
    .sort((first, second) => first.name.localeCompare(second.name)), [vehicles, routes, stops]);
  const selectedShuttle = shuttles.find((shuttle) => shuttle.id === selectedShuttleId) || shuttles[0] || null;
  const selectedStop = campusStops.find((stop) => stop.id === selectedStopId) || null;

  useEffect(() => {
    const timer = window.setInterval(() => setClockNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const lastUpdatedAt = useMemo(() => vehicles.reduce(
    (latest, vehicle) => Math.max(latest, timestampMillis(vehicle.updatedAt)),
    0,
  ), [vehicles]);
  const lastUpdated = formatLastUpdated(clockNow, lastUpdatedAt);

  const handleLoginSuccess = (role) => {
    setCurrentMode(role === 'operator' ? 'operator' : 'student');
    setCurrentView('dashboard');
    setActiveTab('Dashboard');
    setIsLoggedIn(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectShuttle = (candidate) => {
    const id = typeof candidate === 'string' ? candidate : candidate?.id;
    if (id) setSelectedShuttleId(id);
  };

  const handleSelectStop = (candidate) => {
    const id = typeof candidate === 'string' ? candidate : candidate?.id;
    if (id && campusStops.some((stop) => stop.id === id)) setSelectedStopId(id);
  };

  const runOperatorAction = async (action) => {
    try {
      setError('');
      return await action();
    } catch (actionError) {
      setError(actionError?.message || 'The Firestore update could not be completed.');
      return false;
    }
  };

  const handleStartTrip = (vehicleId, routeId, speedKmh) => runOperatorAction(
    () => startTrip(vehicleId, routeId, speedKmh),
  );
  const handleStopTrip = (vehicleId) => runOperatorAction(() => stopTrip(vehicleId));
  const handleMarkDelayed = (vehicleId, minutes) => runOperatorAction(
    () => setVehicleDelay(vehicleId, minutes),
  );
  const handleClearDelay = (vehicleId) => runOperatorAction(() => clearVehicleDelay(vehicleId));
  const handleCreateRoute = (route) => runOperatorAction(() => createRoute(route));

  const handleOpenShuttleDetails = (shuttle) => {
    if (shuttle?.id) setSelectedShuttleId(shuttle.id);
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'Dashboard') setCurrentView('dashboard');
  };

  const handleToggleMode = (targetMode) => {
    setCurrentMode(targetMode);
    if (targetMode === 'student') setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFocusShuttleOnMap = (shuttle) => {
    handleSelectShuttle(shuttle);
    const mapElement = document.querySelector('.map-view-wrapper');
    if (mapElement && window.innerWidth < 768) mapElement.scrollIntoView({ behavior: 'smooth' });
  };

  if (!isLoggedIn) {
    return <Login
      onLoginSuccess={handleLoginSuccess}
      initialRole="student"
      activeVehicleCount={vehicles.filter((vehicle) => String(vehicle.status || '').toLowerCase() !== 'inactive').length}
      activeRouteCount={routes.filter((route) => route.active !== false).length}
      campusStops={campusStops}
    />;
  }

  return (
    <div className="campus-transit-app">
      <TopNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        currentMode={currentMode}
        onToggleMode={handleToggleMode}
      />

      {error && (
        <div className="firestore-status-banner" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError('')} aria-label="Dismiss message">Dismiss</button>
        </div>
      )}

      {loading ? (
        <main className="data-loading-state" aria-live="polite">
          <span className="live-dot-pulse" />
          <h1>Connecting to campus transit</h1>
          <p>Loading the live fleet, route, and stop collections from Firestore.</p>
        </main>
      ) : currentMode === 'operator' ? (
        <main>
          <OperatorDashboard
            shuttles={shuttles}
            routes={routes}
            campusStops={campusStops}
            selectedShuttleId={selectedShuttle?.id}
            onSelectShuttle={handleSelectShuttle}
            onStartTrip={handleStartTrip}
            onStopTrip={handleStopTrip}
            onSetDelay={handleMarkDelayed}
            onClearDelay={handleClearDelay}
            onCreateRoute={handleCreateRoute}
            onSwitchToStudent={() => handleToggleMode('student')}
            lastUpdated={lastUpdated}
          />
        </main>
      ) : (
        <>
          {activeTab === 'Dashboard' && (
            <>
              {currentView === 'details' ? (
                <main>
                  <ShuttleDetails
                    shuttle={selectedShuttle}
                    allShuttles={shuttles}
                    routes={routes}
                    campusStops={campusStops}
                    onBack={handleBackToDashboard}
                    lastUpdated={lastUpdated}
                    onSelectAnotherShuttle={handleSelectShuttle}
                    selectedStopId={selectedStopId}
                    onSelectStop={handleSelectStop}
                  />
                </main>
              ) : (
                <main>
                  <MainHeader
                    lastUpdated={lastUpdated}
                    activeCount={vehicles.filter((vehicle) => String(vehicle.status).toLowerCase() === 'active').length}
                    routeCount={routes.filter((route) => route.active !== false).length}
                  />

                  <div className="dashboard-content-layout">
                    <div className="map-column">
                      <MapView
                        shuttles={shuttles}
                        selectedShuttle={selectedShuttle}
                        onSelectShuttle={handleSelectShuttle}
                        onOpenDetails={handleOpenShuttleDetails}
                        routes={routes}
                        campusStops={campusStops}
                        selectedStopId={selectedStopId}
                        onSelectStop={handleSelectStop}
                      />
                    </div>

                    <aside className="sidebar-column">
                      <NextArrivalCard
                        shuttle={selectedShuttle}
                        onFocusShuttle={handleFocusShuttleOnMap}
                        onViewDetails={handleOpenShuttleDetails}
                      />
                      <ShuttleList
                        shuttles={shuttles}
                        selectedShuttleId={selectedShuttle?.id}
                        onSelectShuttle={handleSelectShuttle}
                        onOpenDetails={handleOpenShuttleDetails}
                      />
                      <UpcomingStops
                        selectedShuttle={selectedShuttle}
                        selectedStopId={selectedStopId}
                        selectedStopName={selectedStop?.name}
                        onSelectStop={handleSelectStop}
                      />
                      <StopArrivalsPanel
                        stops={campusStops}
                        vehicles={vehicles}
                        routes={routes}
                        rawStops={stops}
                        selectedStopId={selectedStopId}
                        onSelectStop={handleSelectStop}
                      />
                    </aside>
                  </div>
                </main>
              )}
            </>
          )}

          {activeTab === 'MyShuttle' && (
            <main className="subview-container">
              <div className="subview-card">
                <div className="subview-header">
                  <div className="live-system-badge-container">
                    <Bookmark size={16} className="text-accent" />
                    <span className="live-system-tag">SAVED COMMUTE</span>
                  </div>
                  <h1 className="subview-title">My Pinned Shuttle</h1>
                  <p className="subview-desc">Quick access to a shuttle in the live fleet.</p>
                </div>
                {selectedShuttle ? (
                  <div style={{ maxWidth: '640px' }}>
                    <NextArrivalCard
                      shuttle={selectedShuttle}
                      onFocusShuttle={() => {
                        setActiveTab('Dashboard');
                        setCurrentView('dashboard');
                      }}
                      onViewDetails={handleOpenShuttleDetails}
                    />
                  </div>
                ) : <p>No fleet vehicles are currently available.</p>}
              </div>
            </main>
          )}

          {activeTab === 'Profile' && (
            <main className="subview-container">
              <div className="subview-card" style={{ maxWidth: '780px' }}>
                <div className="subview-header">
                  <div className="live-system-badge-container">
                    <ShieldCheck size={16} color="#10b981" />
                    <span className="live-system-tag">DEMO STUDENT PROFILE</span>
                  </div>
                  <h1 className="subview-title">Student Transit Profile</h1>
                  <p className="subview-desc">This demo profile is local UI only; live vehicle, route, and stop data comes from Firestore.</p>
                </div>
                <div className="profile-data-card">
                  <div className="profile-data-row">
                    <div className="avatar-chip"><span className="avatar-initials">ST</span></div>
                    <div>
                      <h3>Student Account</h3>
                      <span>Campus shuttle passenger view</span>
                    </div>
                    <span className="status-badge status-badge-md profile-pass-status"><CheckCircle2 size={13} /> PASS ACTIVE</span>
                  </div>
                  <p className="profile-data-note">Profile and transit-pass details are placeholders in this UI port and are not written to Firestore.</p>
                </div>
                <div style={{ marginTop: '1.5rem' }}>
                  <button type="button" className="focus-shuttle-btn" onClick={() => handleTabChange('Dashboard')}>
                    <ArrowRight size={15} /> Back to Live Radar
                  </button>
                </div>
              </div>
            </main>
          )}
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <TransitProvider>
      <DashboardApp />
    </TransitProvider>
  );
}
