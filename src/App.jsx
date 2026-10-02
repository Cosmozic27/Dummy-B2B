import React, { useState, useEffect, useReducer } from 'react';
import TopNav from './components/TopNav';
import MainHeader from './components/MainHeader';
import MapView from './components/MapView';
import NextArrivalCard from './components/NextArrivalCard';
import ShuttleList from './components/ShuttleList';
import UpcomingStops from './components/UpcomingStops';
import ShuttleDetails from './components/ShuttleDetails';
import OperatorDashboard from './components/OperatorDashboard';
import StopArrivalsPanel from './components/StopArrivalsPanel';
import Login from './pages/Login';
import { MOCK_SHUTTLES, CAMPUS_STOPS } from './data/mockShuttles';
import { SIMULATION_TICK_MS, transitReducer } from './services/tripSimulator';
import './styles/dashboard.css';
import { 
  Bookmark, 
  User, 
  ShieldCheck, 
  MapPin, 
  Bell, 
  ArrowRight, 
  CheckCircle2, 
  Calendar, 
  QrCode,
  Sparkles
} from 'lucide-react';

function formatLastUpdated(now, lastUpdatedAt) {
  const seconds = Math.max(0, Math.floor((now - lastUpdatedAt) / 1000));
  if (seconds < 5) return 'Updated just now';
  if (seconds < 60) return `Updated ${seconds}s ago`;
  return `Updated ${Math.floor(seconds / 60)}m ago`;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [shuttles, dispatchTransit] = useReducer(transitReducer, MOCK_SHUTTLES);
  const [selectedShuttleId, setSelectedShuttleId] = useState(MOCK_SHUTTLES[0]?.id || 'BUS-01');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'details'
  const [currentMode, setCurrentMode] = useState('student'); // 'student' | 'operator'
  const [selectedStopId, setSelectedStopId] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(0);
  const [clockNow, setClockNow] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const lastUpdated = formatLastUpdated(clockNow, lastUpdatedAt);

  // Handle login success — role from Login drives the initial mode
  const handleLoginSuccess = (role) => {
    setCurrentMode(role === 'operator' ? 'operator' : 'student');
    setCurrentView('dashboard');
    setActiveTab('Dashboard');
    setIsLoggedIn(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // All student and operator views read from this single root-owned fleet state.
  const selectedShuttle = shuttles.find((s) => s.id === selectedShuttleId) || shuttles[0];
  const selectedStop = CAMPUS_STOPS.find((stop) => stop.id === selectedStopId) || null;
  const hasActiveTrips = shuttles.some((shuttle) => shuttle.trip?.active);

  useEffect(() => {
    const initializeClock = setTimeout(() => {
      const now = Date.now();
      setLastUpdatedAt(now);
      setClockNow(now);
    }, 0);
    const timer = setInterval(() => setClockNow(Date.now()), 1000);
    return () => {
      clearTimeout(initializeClock);
      clearInterval(timer);
    };
  }, []);

  // One lightweight, cleaned-up timer advances every active trip in the shared reducer.
  useEffect(() => {
    if (!hasActiveTrips) return undefined;
    let lastTickAt = Date.now();
    let lastFreshnessUpdateAt = lastTickAt;
    const timer = setInterval(() => {
      const now = Date.now();
      const deltaMs = Math.min(now - lastTickAt, 1000);
      lastTickAt = now;
      dispatchTransit({ type: 'tick', deltaMs });
      if (now - lastFreshnessUpdateAt >= 1000) {
        setLastUpdatedAt(now);
        lastFreshnessUpdateAt = now;
      }
    }, SIMULATION_TICK_MS);
    return () => clearInterval(timer);
  }, [hasActiveTrips]);

  // Manual telemetry refresh handler (simulates live GPS poll)
  const handleRefreshTelemetry = () => {
    setIsRefreshing(true);
    setLastUpdatedAt(Date.now());

    setTimeout(() => {
      // Keep active trip coordinates on-route; only idle mocks receive GPS jitter.
      const offsets = Object.fromEntries(
        shuttles
          .filter((shuttle) => !shuttle.trip?.active)
          .map((shuttle) => [shuttle.id, {
            latitude: (Math.random() - 0.5) * 0.0003,
            longitude: (Math.random() - 0.5) * 0.0003
          }])
      );
      dispatchTransit({ type: 'refresh', offsets });
      setLastUpdatedAt(Date.now());
      setIsRefreshing(false);
    }, 600);
  };

  const handleSelectShuttle = (shuttle) => {
    if (shuttle?.id) setSelectedShuttleId(shuttle.id);
  };

  const handleStartTrip = (vehicleId, routeId, speedMultiplier) => {
    dispatchTransit({ type: 'start-trip', vehicleId, routeId, speedMultiplier, now: Date.now() });
    setSelectedShuttleId(vehicleId);
    setLastUpdatedAt(Date.now());
  };

  const handleStopTrip = (vehicleId) => {
    dispatchTransit({ type: 'stop-trip', vehicleId });
    setLastUpdatedAt(Date.now());
  };

  const handleSelectStop = (candidate) => {
    if (typeof candidate === 'string') {
      if (CAMPUS_STOPS.some((stop) => stop.id === candidate)) setSelectedStopId(candidate);
      return;
    }
    if (!candidate) return;
    const candidateName = String(candidate.name || '').toLowerCase();
    const matchedStop = CAMPUS_STOPS.find((stop) => {
      if (candidate.id === stop.id) return true;
      const stopName = stop.name.toLowerCase();
      return stopName.includes(candidateName) || candidateName.includes(stopName) ||
        (candidateName.includes('food court') && stopName.includes('sports arena'));
    });
    if (matchedStop) setSelectedStopId(matchedStop.id);
  };

  // Open the dedicated Shuttle Details view
  const handleOpenShuttleDetails = (shuttle) => {
    if (shuttle && shuttle.id) {
      setSelectedShuttleId(shuttle.id);
    }
    setCurrentView('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Return back to the primary Student Dashboard
  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle top navigation tab switching
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'Dashboard') {
      setCurrentView('dashboard');
    }
  };

  // Toggle between Student Passenger View and Operator Fleet Dashboard
  const handleToggleMode = (targetMode) => {
    setCurrentMode(targetMode);
    if (targetMode === 'student') {
      setCurrentView('dashboard');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFocusShuttleOnMap = (shuttle) => {
    setSelectedShuttleId(shuttle.id);
    // Smooth scroll down to map on mobile if needed
    const mapElement = document.querySelector('.map-view-wrapper');
    if (mapElement && window.innerWidth < 768) {
      mapElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // --- AUTH GATE ---
  if (!isLoggedIn) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        initialRole="student"
      />
    );
  }

  return (
    <div className="campus-transit-app">
      {/* 1. TOP NAVIGATION WITH ROLE SWITCHER */}
      <TopNav 
        activeTab={activeTab} 
        onTabChange={handleTabChange}
        currentMode={currentMode}
        onToggleMode={handleToggleMode}
      />

      {/* MODE 1: OPERATOR FLEET DASHBOARD */}
      {currentMode === 'operator' ? (
        <main>
          <OperatorDashboard
            shuttles={shuttles}
            selectedShuttleId={selectedShuttleId}
            onSelectShuttle={handleSelectShuttle}
            onStartTrip={handleStartTrip}
            onStopTrip={handleStopTrip}
            onSwitchToStudent={() => handleToggleMode('student')}
            lastUpdated={lastUpdated}
            onRefreshTelemetry={handleRefreshTelemetry}
            isRefreshing={isRefreshing}
          />
        </main>
      ) : (
        /* MODE 2: STUDENT PASSENGER DASHBOARD & SUBVIEWS */
        <>
          {/* DASHBOARD TAB CONTENT */}
          {activeTab === 'Dashboard' && (
            <>
              {currentView === 'details' ? (
                /* DEDICATED SHUTTLE DETAILS VIEW */
                <main>
                  <ShuttleDetails
                    shuttle={selectedShuttle}
                    allShuttles={shuttles}
                    onBack={handleBackToDashboard}
                    lastUpdated={lastUpdated}
                    onSelectAnotherShuttle={handleSelectShuttle}
                    selectedStopId={selectedStopId}
                    onSelectStop={handleSelectStop}
                  />
                </main>
              ) : (
                /* PRIMARY STUDENT DASHBOARD */
                <main>
                  {/* 2. MAIN HEADER */}
                  <MainHeader
                    lastUpdated={lastUpdated}
                    activeCount={shuttles.length}
                    onManualRefresh={handleRefreshTelemetry}
                    isRefreshing={isRefreshing}
                  />

                  {/* MAIN DASHBOARD CONTENT GRID */}
                  <div className="dashboard-content-layout">
                    {/* 3. MAIN MAP SECTION */}
                    <div className="map-column">
                      <MapView
                        shuttles={shuttles}
                        selectedShuttle={selectedShuttle}
                        onSelectShuttle={handleSelectShuttle}
                        onOpenDetails={handleOpenShuttleDetails}
                        campusStops={CAMPUS_STOPS}
                        selectedStopId={selectedStopId}
                        onSelectStop={handleSelectStop}
                      />
                    </div>

                    {/* SIDE PANEL (Next Arrival, Shuttle List, Upcoming Stops) */}
                    <aside className="sidebar-column">
                      {/* 5. NEXT ARRIVAL CARD */}
                      <NextArrivalCard
                        shuttle={selectedShuttle}
                        onFocusShuttle={handleFocusShuttleOnMap}
                        onViewDetails={handleOpenShuttleDetails}
                      />

                      {/* 4. SHUTTLE LIST / SIDE PANEL */}
                      <ShuttleList
                        shuttles={shuttles}
                        selectedShuttleId={selectedShuttleId}
                        onSelectShuttle={handleSelectShuttle}
                        onOpenDetails={handleOpenShuttleDetails}
                        onRefresh={handleRefreshTelemetry}
                        isRefreshing={isRefreshing}
                      />

                      {/* 6. UPCOMING STOPS */}
                      <UpcomingStops
                        selectedShuttle={selectedShuttle}
                        selectedStopId={selectedStopId}
                        selectedStopName={selectedStop?.name}
                        onSelectStop={handleSelectStop}
                      />
                      <StopArrivalsPanel
                        stops={CAMPUS_STOPS}
                        selectedStopId={selectedStopId}
                        onSelectStop={handleSelectStop}
                        shuttles={shuttles}
                      />
                    </aside>
                  </div>
                </main>
              )}
            </>
          )}

          {/* 2. MY SHUTTLE SUB-VIEW (for pinned commuter alerts) */}
          {activeTab === 'MyShuttle' && (
            <main className="subview-container">
              <div className="subview-card">
                <div className="subview-header">
                  <div className="live-system-badge-container">
                    <Bookmark size={16} className="text-accent" />
                    <span className="live-system-tag">SAVED COMMUTE</span>
                  </div>
                  <h1 className="subview-title">My Pinned Shuttle</h1>
                  <p className="subview-desc">
                    Quick access to your regular route from Hostel Complex to Engineering Block.
                  </p>
                </div>

                <div style={{ maxWidth: '640px' }}>
                  <NextArrivalCard
                    shuttle={shuttles[0]}
                    onFocusShuttle={() => {
                      setActiveTab('Dashboard');
                      setCurrentView('dashboard');
                      setSelectedShuttleId(shuttles[0].id);
                    }}
                    onViewDetails={() => {
                      setActiveTab('Dashboard');
                      handleOpenShuttleDetails(shuttles[0]);
                    }}
                  />
                  <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      className="focus-shuttle-btn"
                      onClick={() => {
                        setActiveTab('Dashboard');
                        setCurrentView('dashboard');
                      }}
                    >
                      <ArrowRight size={15} /> Return to Full Live Map
                    </button>
                  </div>
                </div>
              </div>
            </main>
          )}

          {/* 3. PROFILE SUB-VIEW (Student Transit Pass & Preferences) */}
          {activeTab === 'Profile' && (
            <main className="subview-container">
              <div className="subview-card" style={{ maxWidth: '780px' }}>
                <div className="subview-header">
                  <div className="live-system-badge-container">
                    <ShieldCheck size={16} color="#10b981" />
                    <span className="live-system-tag">VERIFIED STUDENT CREDENTIAL</span>
                  </div>
                  <h1 className="subview-title">Student Transit Profile</h1>
                  <p className="subview-desc">
                    Campus mobility digital pass & notification preferences.
                  </p>
                </div>

                <div style={{
                  background: 'rgba(9, 13, 22, 0.75)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.25rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="avatar-chip" style={{ width: '48px', height: '48px', fontSize: '1.1rem' }}>
                        ST
                      </div>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', color: '#fff', fontWeight: '700' }}>Student Account</h3>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', fontFamily: 'var(--font-mono)' }}>
                          ID: CS-2026-881 • Computer Science Dept
                        </span>
                      </div>
                    </div>
                    <div className="status-badge status-badge-md" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                      <CheckCircle2 size={13} />
                      <span>PASS ACTIVE</span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Primary Pickup</span>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Hostel Complex Gate</strong>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Frequent Destination</span>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Engineering Block (Sec 3)</strong>
                    </div>
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Pass Expiry</span>
                      <strong style={{ color: '#fff', fontSize: '0.9rem' }}>Dec 31, 2026</strong>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <button 
                    type="button" 
                    className="focus-shuttle-btn"
                    onClick={() => {
                      setActiveTab('Dashboard');
                      setCurrentView('dashboard');
                    }}
                  >
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
