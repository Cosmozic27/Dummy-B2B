import { ArrowRight, Bus, Clock, Gauge, MapPin, Users } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

export default function NextArrivalCard({ shuttle, onFocusShuttle, onViewDetails }) {
  if (!shuttle) return null;
  return (
    <div className="next-arrival-card">
      <div className="next-arrival-ambient-glow" style={{ background: `radial-gradient(circle at 80% 20%, ${shuttle.accentColor || '#06b6d4'}25 0%, transparent 70%)` }} />
      <div className="next-arrival-header"><div className="next-arrival-label-group"><div className="live-radar-indicator"><span className="live-radar-ping" /><span className="live-radar-core" /></div><div><span className="next-arrival-kicker">Selected Shuttle</span><div className="next-arrival-route-code">{shuttle.routeFullName || 'No route assigned'}</div></div></div><StatusBadge status={shuttle.status} size="sm" /></div>
      <div className="next-arrival-main">
        <div className="next-arrival-target">
          <div className="next-arrival-shuttle-title"><div className="shuttle-avatar" style={{ borderColor: `${shuttle.accentColor || '#06b6d4'}60` }}><Bus size={22} color={shuttle.accentColor || '#06b6d4'} /></div><div><h2 className="shuttle-name-text">{shuttle.name}</h2><span className="shuttle-plate-text">Vehicle ID · {shuttle.id}</span></div></div>
          <div className="next-arrival-destination"><div className="destination-meta"><span className="dest-subtext">Next route stop</span><div className="dest-stop-name"><MapPin size={17} className="dest-pin-icon" /><span>{shuttle.nextStop}</span></div></div></div>
        </div>
        <div className="next-arrival-eta-box"><div className="eta-badge-container"><div className="eta-header"><Clock size={15} className="eta-clock-icon" /><span>ESTIMATED TIME</span></div><div className="eta-display"><span className="eta-numeric-highlight">{shuttle.eta}</span></div><span className="eta-live-tag"><span className="eta-mini-pulse" /> Supplied ETA helper</span></div></div>
      </div>
      <div className="next-arrival-route-preview"><div className="route-preview-label">Route Sequence:</div><div className="route-preview-path"><span>{shuttle.route}</span></div></div>
      <div className="next-arrival-footer">
        <div className="telematics-stats"><div className="telem-item" title="Speed from the vehicle document"><Gauge size={14} className="telem-icon" /><span>{shuttle.speed}</span></div><div className="telem-divider" /><div className="telem-item" title="Crowding report from the vehicle document"><Users size={14} className="telem-icon" /><span>{shuttle.crowding || 'Not reported'}</span></div></div>
        <div className="next-arrival-actions-group">
          {onFocusShuttle && <button type="button" className="focus-shuttle-btn" onClick={() => onFocusShuttle(shuttle)} aria-label={`Locate ${shuttle.name} on map`}><span>Focus on Map</span><ArrowRight size={14} /></button>}
          {onViewDetails && <button type="button" className="view-details-pill-btn" onClick={() => onViewDetails(shuttle)} aria-label={`View ${shuttle.name} details`}><span>Full Details</span><ArrowRight size={14} /></button>}
        </div>
      </div>
    </div>
  );
}
