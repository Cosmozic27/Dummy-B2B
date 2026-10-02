import React from 'react';
import { Clock, MapPin, Radio } from 'lucide-react';
import { estimateArrivalAtStop } from '../services/tripSimulator';

export default function StopArrivalsPanel({ stops = [], selectedStopId, onSelectStop, shuttles = [] }) {
  const selectedStop = stops.find((stop) => stop.id === selectedStopId) || null;
  const arrivals = selectedStop
    ? shuttles
        .map((shuttle) => {
          const estimate = estimateArrivalAtStop(shuttle, selectedStop);
          return estimate ? { shuttle, ...estimate } : null;
        })
        .filter(Boolean)
        .sort((a, b) => a.etaSeconds - b.etaSeconds)
    : [];

  return (
    <section className="stop-arrivals-panel" aria-labelledby="stop-arrivals-title">
      <div className="stop-arrivals-heading">
        <div className="stop-arrivals-heading-icon"><MapPin size={16} /></div>
        <div>
          <h3 id="stop-arrivals-title">Arrivals at a Stop</h3>
          <p>Live estimates from active simulated trips</p>
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
              {arrivals.map(({ shuttle, eta, remainingMeters }) => (
                <div className="stop-arrival-row" key={shuttle.id}>
                  <div className="stop-arrival-vehicle">
                    <span className="stop-arrival-color" style={{ backgroundColor: shuttle.accentColor || '#06b6d4' }} />
                    <div>
                      <strong>{shuttle.id}</strong>
                      <span>{shuttle.name} · {Math.round(remainingMeters)} m to stop</span>
                    </div>
                  </div>
                  <div className="stop-arrival-eta"><Clock size={14} /><strong>{eta}</strong></div>
                </div>
              ))}
            </div>
          ) : (
            <p className="stop-arrivals-empty" aria-live="polite">
              No active trip is currently approaching this stop. Start a trip on a route that serves it to see a live ETA.
            </p>
          )}
        </>
      ) : (
        <p className="stop-arrivals-empty">Choose a stop here or click a stop marker on the map to see approaching shuttles.</p>
      )}
    </section>
  );
}
