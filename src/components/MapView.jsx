import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { CAMPUS_CENTER, CAMPUS_STOPS } from '../data/mockShuttles';
import { getRouteById } from '../services/tripSimulator';
import { Maximize2, Crosshair, Layers, Navigation } from 'lucide-react';

/**
 * Creates custom HTML divIcon for shuttles
 */
const createShuttleIcon = (shuttle, isSelected) => {
  const accent = shuttle.accentColor || '#06b6d4';
  const isBoarding = shuttle.status === 'BOARDING';

  const html = `
    <div class="custom-shuttle-marker ${isSelected ? 'marker-selected' : ''}">
      ${isSelected ? `<div class="marker-pulse-ring" style="border-color: ${accent};"></div>` : ''}
      <div class="marker-pin-body" style="background: #0f172a; border-color: ${accent}; box-shadow: 0 0 ${isSelected ? '16px' : '8px'} ${accent}80;">
        <svg class="marker-bus-svg" viewBox="0 0 24 24" width="16" height="16" stroke="${accent}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"></path>
          <path d="M15 6v6"></path>
          <path d="M2 12h19.6"></path>
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.2 6 18.2 6H5.8C4.8 6 3.9 6.8 3.6 7.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path>
          <circle cx="7" cy="18" r="2"></circle>
          <circle cx="17" cy="18" r="2"></circle>
        </svg>
      </div>
      <div class="marker-label-tag" style="background: rgba(15, 23, 42, 0.92); border-color: ${accent}60; color: #f8fafc;">
        <span class="marker-live-dot" style="background: ${isBoarding ? '#f59e0b' : '#10b981'};"></span>
        <span class="marker-name">${shuttle.name}</span>
        <span class="marker-eta">${shuttle.eta}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: `leaflet-custom-shuttle-wrapper ${shuttle.trip?.active ? 'leaflet-shuttle-moving' : ''}`,
    html: html,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -20]
  });
};

/**
 * Creates custom HTML divIcon for campus stops
 */
const createStopIcon = (stop, isTarget, isSelected) => {
  const html = `
    <div class="custom-stop-marker ${isTarget ? 'stop-is-target' : ''} ${isSelected ? 'stop-is-selected' : ''}">
      <div class="stop-marker-dot">
        <span class="stop-marker-center"></span>
      </div>
      <div class="stop-marker-label">
        <span class="stop-code">${stop.shortCode || stop.name.slice(0, 3).toUpperCase()}</span>
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'leaflet-custom-stop-wrapper',
    html: html,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });
};

/**
 * Helper to smoothly pan and zoom map when selected shuttle changes or Track on Map is clicked
 */
function MapController({ selectedShuttle, focusTrigger }) {
  const map = useMap();
  const selectedShuttleRef = React.useRef(selectedShuttle);

  useEffect(() => {
    selectedShuttleRef.current = selectedShuttle;
  }, [selectedShuttle]);

  useEffect(() => {
    const target = selectedShuttleRef.current;
    if (target && target.latitude && target.longitude) {
      map.flyTo([target.latitude, target.longitude], 16.5, {
        animate: true,
        duration: 1.2
      });
    }
  }, [selectedShuttle?.id, focusTrigger, map]);

  return null;
}

/**
 * MapView Component
 */
export default function MapView({ 
  shuttles = [], 
  selectedShuttle, 
  onSelectShuttle,
  onOpenDetails,
  campusStops = CAMPUS_STOPS,
  selectedStopId,
  onSelectStop,
  focusTrigger = 0,
  className = ''
}) {
  const mapRef = React.useRef(null);
  const activeRoute = selectedShuttle?.trip?.routeId
    ? getRouteById(selectedShuttle.trip.routeId)
    : null;
  const displayedPolyline = activeRoute?.polyline || selectedShuttle?.polyline;

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo(CAMPUS_CENTER, 15, { animate: true, duration: 1 });
    }
  };

  const handleCenterSelected = () => {
    if (mapRef.current && selectedShuttle) {
      mapRef.current.flyTo([selectedShuttle.latitude, selectedShuttle.longitude], 16.5, {
        animate: true,
        duration: 1
      });
    }
  };

  return (
    <div className={`map-view-wrapper ${className}`}>
      {/* Floating Map HUD header */}
      <div className="map-hud-top-bar">
        <div className="map-hud-pill">
          <span className="hud-live-beacon" />
          <span className="hud-text">Live Campus Radar</span>
          <span className="hud-divider">|</span>
          <span className="hud-metric">{shuttles.length} Shuttles Active</span>
        </div>

        <div className="map-actions-group">
          <button 
            type="button" 
            className="map-action-btn"
            onClick={handleCenterSelected}
            title="Recenter on selected shuttle"
            aria-label="Recenter on selected shuttle"
            disabled={!selectedShuttle}
          >
            <Crosshair size={15} />
            <span className="btn-label-desktop">Focus Shuttle</span>
          </button>
          <button 
            type="button" 
            className="map-action-btn"
            onClick={handleResetView}
            title="Reset Campus View"
            aria-label="Reset Campus View"
          >
            <Maximize2 size={15} />
            <span className="btn-label-desktop">Full Campus</span>
          </button>
        </div>
      </div>

      <MapContainer
        center={CAMPUS_CENTER}
        zoom={15}
        scrollWheelZoom={true}
        className="leaflet-map-container"
        ref={mapRef}
      >
        {/* Modern dark basemap tiles using CartoDB Dark Matter */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        <MapController selectedShuttle={selectedShuttle} focusTrigger={focusTrigger} />

        {/* Selected Shuttle Polyline Route */}
        {selectedShuttle && displayedPolyline && (
          <>
            {/* Outer soft glow route line */}
            <Polyline
              positions={displayedPolyline}
              pathOptions={{
                color: selectedShuttle.accentColor || '#06b6d4',
                weight: 8,
                opacity: 0.25,
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
            {/* Core crisp route line */}
            <Polyline
              positions={displayedPolyline}
              pathOptions={{
                color: selectedShuttle.accentColor || '#06b6d4',
                weight: 3.5,
                opacity: 0.9,
                dashArray: '6, 8',
                lineCap: 'round',
                lineJoin: 'round'
              }}
            />
          </>
        )}

        {/* Campus Stops */}
        {campusStops.map((stop) => {
          const nextStopName = selectedShuttle?.nextStop?.toLowerCase() || '';
          const isTarget = nextStopName && (
            stop.name.toLowerCase().includes(nextStopName) || nextStopName.includes(stop.name.toLowerCase())
          );
          const isStopSelected = stop.id === selectedStopId;
          return (
            <Marker
              key={stop.id}
              position={[stop.latitude, stop.longitude]}
              icon={createStopIcon(stop, isTarget, isStopSelected)}
              eventHandlers={{ click: () => onSelectStop?.(stop) }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="popup-stop-content">
                  <div className="popup-stop-tag">Campus Stop</div>
                  <div className="popup-stop-title">{stop.name}</div>
                  <div className="popup-stop-meta">
                    <span>Est. Wait: <strong>{stop.estimatedWait || '3-5m'}</strong></span>
                    {stop.shelter && <span className="shelter-badge">Shelter Available</span>}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Shuttles */}
        {shuttles.map((shuttle) => {
          const isSelected = selectedShuttle && selectedShuttle.id === shuttle.id;
          return (
            <Marker
              key={shuttle.id}
              position={[shuttle.latitude, shuttle.longitude]}
              icon={createShuttleIcon(shuttle, isSelected)}
              eventHandlers={{
                click: () => onSelectShuttle(shuttle)
              }}
              zIndexOffset={isSelected ? 1000 : 100}
            >
              <Popup className="custom-leaflet-popup">
                <div className="popup-shuttle-content">
                  <div className="popup-header-row">
                    <span className="popup-shuttle-name">{shuttle.name}</span>
                    <span className="popup-status-badge">{shuttle.status}</span>
                  </div>
                  <div className="popup-route-text">{shuttle.route}</div>
                  <div className="popup-meta-grid">
                    <div>
                      <span className="p-label">Next Stop:</span>
                      <span className="p-val">{shuttle.nextStop}</span>
                    </div>
                    <div>
                      <span className="p-label">ETA:</span>
                      <span className="p-val text-accent">{shuttle.eta}</span>
                    </div>
                    <div>
                      <span className="p-label">Speed:</span>
                      <span className="p-val">{shuttle.speed || '24 km/h'}</span>
                    </div>
                    <div>
                      <span className="p-label">Capacity:</span>
                      <span className="p-val">{shuttle.occupancy || '60%'}</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="popup-select-btn"
                    onClick={() => {
                      onSelectShuttle(shuttle);
                      if (onOpenDetails) onOpenDetails(shuttle);
                    }}
                  >
                    View Shuttle Details →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Footer */}
      <div className="map-legend-overlay">
        <div className="legend-item">
          <span className="legend-indicator legend-shuttle" />
          <span>Active Shuttle</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator legend-stop" />
          <span>Campus Stop</span>
        </div>
        <div className="legend-item">
          <span className="legend-indicator legend-route" />
          <span>Active Route</span>
        </div>
      </div>
    </div>
  );
}
