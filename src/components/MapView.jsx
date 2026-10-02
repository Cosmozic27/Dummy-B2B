import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Crosshair, Maximize2 } from 'lucide-react';

const createShuttleIcon = (shuttle, isSelected) => {
  const accent = shuttle.accentColor || '#06b6d4';
  const dotColor = shuttle.status === 'DELAYED' ? '#ef4444' : shuttle.isMoving ? '#10b981' : '#94a3b8';
  const html = `
    <div class="custom-shuttle-marker ${isSelected ? 'marker-selected' : ''}">
      ${isSelected ? `<div class="marker-pulse-ring" style="border-color: ${accent};"></div>` : ''}
      <div class="marker-pin-body" style="background: #0f172a; border-color: ${accent}; box-shadow: 0 0 ${isSelected ? '16px' : '8px'} ${accent}80;">
        <svg class="marker-bus-svg" viewBox="0 0 24 24" width="16" height="16" stroke="${accent}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path>
          <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.2 6 18.2 6H5.8C4.8 6 3.9 6.8 3.6 7.8l-1.4 5c-.1.4-.2.8-.2 1.2 0 .4.1.8.2 1.2.3 1.1.8 2.8.8 2.8h3"></path>
          <circle cx="7" cy="18" r="2"></circle><circle cx="17" cy="18" r="2"></circle>
        </svg>
      </div>
      <div class="marker-label-tag" style="background: rgba(15, 23, 42, 0.94); border-color: ${accent}60; color: #f8fafc;">
        <span class="marker-live-dot" style="background: ${dotColor};"></span>
        <span class="marker-name">${shuttle.name}</span>
        <span class="marker-eta">${shuttle.eta}</span>
      </div>
    </div>`;

  return L.divIcon({
    className: `leaflet-custom-shuttle-wrapper ${shuttle.isMoving ? 'leaflet-shuttle-moving' : ''}`,
    html,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -20],
  });
};

const createStopIcon = (stop, isTarget, isSelected) => {
  const html = `
    <div class="custom-stop-marker ${isTarget ? 'stop-is-target' : ''} ${isSelected ? 'stop-is-selected' : ''}">
      <div class="stop-marker-dot"><span class="stop-marker-center"></span></div>
      <div class="stop-marker-label"><span class="stop-code">${stop.shortCode || stop.name.slice(0, 3).toUpperCase()}</span></div>
    </div>`;
  return L.divIcon({
    className: 'leaflet-custom-stop-wrapper',
    html,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

function MapController({ selectedShuttle, focusTrigger }) {
  const map = useMap();
  const selectedShuttleRef = useRef(selectedShuttle);

  useEffect(() => {
    selectedShuttleRef.current = selectedShuttle;
  }, [selectedShuttle]);

  useEffect(() => {
    const container = map.getContainer();
    if (typeof ResizeObserver === 'undefined') return undefined;

    let frameId = 0;
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(() => {
        map.invalidateSize({ pan: false, animate: false });
      });
    });

    observer.observe(container);
    frameId = window.requestAnimationFrame(() => {
      map.invalidateSize({ pan: false, animate: false });
    });

    return () => {
      observer.disconnect();
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [map]);

  useEffect(() => {
    const target = selectedShuttleRef.current;
    if (target && Number.isFinite(target.latitude) && Number.isFinite(target.longitude)) {
      map.flyTo([target.latitude, target.longitude], 16.5, { animate: true, duration: 1.2 });
    }
  }, [selectedShuttle?.id, focusTrigger, map]);

  return null;
}

export default function MapView({
  shuttles = [],
  selectedShuttle,
  onSelectShuttle,
  onOpenDetails,
  routes = [],
  campusStops = [],
  selectedStopId,
  onSelectStop,
  focusTrigger = 0,
  className = '',
}) {
  const mapRef = useRef(null);
  const campusCenter = useMemo(() => {
    if (campusStops.length === 0) return [0, 0];
    const validStops = campusStops.filter((stop) => Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude));
    if (validStops.length === 0) return [0, 0];
    return [
      validStops.reduce((sum, stop) => sum + stop.latitude, 0) / validStops.length,
      validStops.reduce((sum, stop) => sum + stop.longitude, 0) / validStops.length,
    ];
  }, [campusStops]);

  const activeRoute = routes.find((route) => route.id === selectedShuttle?.routeId);
  const stopById = useMemo(() => new Map(campusStops.map((stop) => [stop.id, stop])), [campusStops]);
  const displayedPolyline = (activeRoute?.stopIds || [])
    .map((stopId) => stopById.get(stopId))
    .filter((stop) => stop && Number.isFinite(stop.latitude) && Number.isFinite(stop.longitude))
    .map((stop) => [stop.latitude, stop.longitude]);
  const validShuttles = shuttles.filter((shuttle) => Number.isFinite(shuttle.latitude) && Number.isFinite(shuttle.longitude));

  const handleResetView = () => {
    if (mapRef.current) mapRef.current.flyTo(campusCenter, 15, { animate: true, duration: 1 });
  };
  const handleCenterSelected = () => {
    if (mapRef.current && selectedShuttle && Number.isFinite(selectedShuttle.latitude) && Number.isFinite(selectedShuttle.longitude)) {
      mapRef.current.flyTo([selectedShuttle.latitude, selectedShuttle.longitude], 16.5, { animate: true, duration: 1 });
    }
  };

  if (campusStops.length === 0) {
    return (
      <div className={`map-view-wrapper ${className}`}>
        <div className="map-empty-state">Campus stop coordinates are not available in Firestore yet.</div>
      </div>
    );
  }

  return (
    <div className={`map-view-wrapper ${className}`}>
      <div className="map-hud-top-bar">
        <div className="map-hud-pill">
          <span className="hud-live-beacon" />
          <span className="hud-text">Live Campus Radar</span>
          <span className="hud-divider">|</span>
          <span className="hud-metric">{validShuttles.length} Vehicles · {campusStops.length} Stops</span>
        </div>
        <div className="map-actions-group">
          <button type="button" className="map-action-btn" onClick={handleCenterSelected} title="Recenter on selected shuttle" aria-label="Recenter on selected shuttle" disabled={!selectedShuttle}>
            <Crosshair size={15} /><span className="btn-label-desktop">Focus Shuttle</span>
          </button>
          <button type="button" className="map-action-btn" onClick={handleResetView} title="Reset Campus View" aria-label="Reset Campus View">
            <Maximize2 size={15} /><span className="btn-label-desktop">Full Campus</span>
          </button>
        </div>
      </div>

      <MapContainer center={campusCenter} zoom={15} scrollWheelZoom className="leaflet-map-container" ref={mapRef}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        <MapController selectedShuttle={selectedShuttle} focusTrigger={focusTrigger} />

        {selectedShuttle && displayedPolyline.length > 1 && (
          <>
            <Polyline positions={displayedPolyline} pathOptions={{ color: activeRoute?.color || selectedShuttle.accentColor || '#06b6d4', weight: 8, opacity: 0.25, lineCap: 'round', lineJoin: 'round' }} />
            <Polyline positions={displayedPolyline} pathOptions={{ color: activeRoute?.color || selectedShuttle.accentColor || '#06b6d4', weight: 3.5, opacity: 0.9, dashArray: '6, 8', lineCap: 'round', lineJoin: 'round' }} />
          </>
        )}

        {campusStops.map((stop) => {
          const isTarget = selectedShuttle?.nextStop === stop.name;
          return (
            <Marker
              key={stop.id}
              position={[stop.latitude, stop.longitude]}
              icon={createStopIcon(stop, isTarget, stop.id === selectedStopId)}
              eventHandlers={{ click: () => onSelectStop?.(stop) }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="popup-stop-content">
                  <div className="popup-stop-tag">Campus Stop</div>
                  <div className="popup-stop-title">{stop.name}</div>
                  <div className="popup-stop-meta">Select this stop to see live arrivals from active vehicles.</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {validShuttles.map((shuttle) => (
          <Marker
            key={shuttle.id}
            position={[shuttle.latitude, shuttle.longitude]}
            icon={createShuttleIcon(shuttle, shuttle.id === selectedShuttle?.id)}
            eventHandlers={{ click: () => onSelectShuttle?.(shuttle) }}
            zIndexOffset={shuttle.id === selectedShuttle?.id ? 1000 : 100}
          >
            <Popup className="custom-leaflet-popup">
              <div className="popup-shuttle-content">
                <div className="popup-header-row">
                  <span className="popup-shuttle-name">{shuttle.name}</span>
                  <span className="popup-status-badge">{shuttle.status}</span>
                </div>
                <div className="popup-route-text">{shuttle.routeFullName}</div>
                <div className="popup-meta-grid">
                  <div><span className="p-label">Next Stop:</span><span className="p-val">{shuttle.nextStop}</span></div>
                  <div><span className="p-label">ETA:</span><span className="p-val text-accent">{shuttle.eta}</span></div>
                  <div><span className="p-label">Speed:</span><span className="p-val">{shuttle.speed}</span></div>
                  <div><span className="p-label">Crowding:</span><span className="p-val">{shuttle.crowding}</span></div>
                </div>
                {onOpenDetails && (
                  <button type="button" className="popup-select-btn" onClick={() => onOpenDetails(shuttle)}>
                    View Shuttle Details →
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="map-legend-overlay">
        <div className="legend-item"><span className="legend-indicator legend-shuttle" /><span>Vehicle</span></div>
        <div className="legend-item"><span className="legend-indicator legend-stop" /><span>Campus Stop</span></div>
        <div className="legend-item"><span className="legend-indicator legend-route" /><span>Selected Route</span></div>
      </div>
    </div>
  );
}
