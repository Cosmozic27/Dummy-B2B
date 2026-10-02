import { Clock, MapPin, Radio } from 'lucide-react';
import { formatEta, getEta } from '../lib/eta.js';

export default function StopArrivalsPanel({
  stops = [],
  vehicles = [],
  routes = [],
  rawStops = [],
  selectedStopId,
  onSelectStop,
}) {
  const selectedStop = rawStops.find((stop) => stop.id === selectedStopId) || null;
  const arrivals = selectedStop
    ? vehicles
        .filter((vehicle) => Number(vehicle.speed) > 0 && vehicle.routeId)
        .map((vehicle) => {
          const route = routes.find((item) => item.id === vehicle.routeId);
          const estimate = getEta(vehicle, selectedStop, route, rawStops);
          return estimate ? {
            vehicle,
            route,
            minutes: estimate.minutes,
            eta: formatEta(estimate),
            remainingMeters: estimate.distanceKm * 1000,
          } : null;
        })
        .filter(Boolean)
        .sort((first, second) => first.minutes - second.minutes)
    : [];

  return (
    <section className="stop-arrivals-panel" aria-labelledby="stop-arrivals-title">
      <div className="stop-arrivals-heading">
        <div className="stop-arrivals-heading-icon"><MapPin size={16} /></div>
        <div>
          <h3 id="stop-arrivals-title">Arrivals at a Stop</h3>
          <p>Live estimates for vehicles in motion</p>
        </div>
        <span className="stop-arrivals-live"><Radio size={13} /> LIVE</span>
      </div>

      <label className="stop-arrivals-select-label" htmlFor="campus-stop-select">Selected stop</label>
      <select
        id="campus-stop-select"
        className="stop-arrivals-select"
        value={selectedStopId || ''}
        onChange={(event) => onSelectStop?.(event.target.value)}
      >
        <option value="">Choose a campus stop</option>
        {stops.map((stop) => <option key={stop.id} value={stop.id}>{stop.name}</option>)}
      </select>

      {selectedStop ? (
        <>
          <div className="stop-arrivals-selected-name">
            <span>SELECTED STOP</span>
            <strong>{selectedStop.name}</strong>
          </div>
          {arrivals.length > 0 ? (
            <div className="stop-arrival-list" aria-live="polite">
              {arrivals.map(({ vehicle, route, eta, remainingMeters }) => (
                <div className="stop-arrival-row" key={vehicle.id}>
                  <div className="stop-arrival-vehicle">
                    <span className="stop-arrival-color" style={{ backgroundColor: route?.color || '#06b6d4' }} />
                    <div>
                      <strong>{vehicle.name || vehicle.id}</strong>
                      <span>{route?.name || 'Unassigned route'} · {Math.round(remainingMeters)} m via route</span>
                    </div>
                  </div>
                  <div className="stop-arrival-eta"><Clock size={14} /><strong>{eta}</strong></div>
                </div>
              ))}
            </div>
          ) : (
            <p className="stop-arrivals-empty" aria-live="polite">
              No moving vehicle on a route serving this stop. Start a trip from the operator view to see a live ETA.
            </p>
          )}
        </>
      ) : (
        <p className="stop-arrivals-empty">Choose a stop here or click a stop marker on the map to see approaching vehicles.</p>
      )}
    </section>
  );
}
