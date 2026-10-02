import React from 'react';
import { CheckCircle2, Clock, Navigation, AlertCircle } from 'lucide-react';

/**
 * Individual Stop item card
 */
export function StopCard({ stop, isCurrent, isPassed, isLast, isSelected, onSelectStop }) {
  return (
    <div
      className={`stop-card-item ${isCurrent ? 'stop-card-current' : ''} ${isPassed ? 'stop-card-passed' : ''} ${isSelected ? 'stop-card-selected' : ''}`}
      onClick={() => onSelectStop && onSelectStop(stop)}
      onKeyDown={(event) => {
        if (onSelectStop && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault();
          onSelectStop(stop);
        }
      }}
      role={onSelectStop ? 'button' : undefined}
      tabIndex={onSelectStop ? 0 : undefined}
      aria-pressed={onSelectStop ? isSelected : undefined}
    >
      {/* Timeline track and node */}
      <div className="stop-timeline-track">
        <div className={`stop-node-indicator ${isPassed ? 'node-passed' : isCurrent ? 'node-current' : 'node-upcoming'}`}>
          {isPassed ? (
            <CheckCircle2 size={13} className="node-check-icon" />
          ) : isCurrent ? (
            <span className="current-node-pulse" />
          ) : (
            <span className="upcoming-node-dot" />
          )}
        </div>
        {!isLast && <div className={`stop-connector-line ${isPassed ? 'line-passed' : ''}`} />}
      </div>

      {/* Stop content */}
      <div className="stop-content-wrapper">
        <div className="stop-main-info">
          <div className="stop-name-row">
            <span className="stop-name">{stop.name}</span>
            {isCurrent && <span className="current-target-tag">Next Stop</span>}
          </div>
          <div className="stop-meta-row">
            {stop.distance && <span className="stop-distance">{stop.distance}</span>}
            {stop.time && <span className="stop-scheduled-time">• {stop.time}</span>}
          </div>
        </div>

        <div className="stop-eta-col">
          <span className={`stop-eta-pill ${isPassed ? 'eta-passed' : isCurrent ? 'eta-current' : 'eta-upcoming'}`}>
            <Clock size={12} />
            <span>{stop.eta}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * UpcomingStops Component
 * Displays the sequence of stops for the selected shuttle
 */
export default function UpcomingStops({ selectedShuttle, onSelectStop, selectedStopId, selectedStopName }) {
  if (!selectedShuttle || !selectedShuttle.stops || selectedShuttle.stops.length === 0) {
    return (
      <div className="upcoming-stops-panel empty-stops">
        <AlertCircle size={18} className="empty-stops-icon" />
        <span>Select a shuttle to view upcoming route stops</span>
      </div>
    );
  }

  const { stops, name, nextStop } = selectedShuttle;

  return (
    <div className="upcoming-stops-panel">
      <div className="upcoming-stops-header">
        <div className="stops-header-title-group">
          <div className="stops-header-icon-box">
            <Navigation size={16} />
          </div>
          <div>
            <h3 className="stops-panel-title">Upcoming Stops</h3>
            <span className="stops-panel-sub">{name} • Next: {nextStop}</span>
          </div>
        </div>
      </div>

      <div className="stops-timeline-container">
        {stops.map((stop, index) => {
          const isPassed = stop.status === 'passed';
          const isCurrent = stop.status === 'current' || stop.isTarget;
          const isLast = index === stops.length - 1;

          return (
            <StopCard
              key={stop.id || index}
              stop={stop}
              isCurrent={isCurrent}
              isPassed={isPassed}
              isLast={isLast}
              isSelected={stop.id === selectedStopId || Boolean(
                selectedStopName && stop.name.toLowerCase().includes(selectedStopName.toLowerCase())
              )}
              onSelectStop={onSelectStop}
            />
          );
        })}
      </div>
    </div>
  );
}
