import { Bus, ChevronRight, Clock, Gauge, MapPin, Users } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

export default function ShuttleCard({ shuttle, isSelected, onSelect, onOpenDetails }) {
  if (!shuttle) return null;
  const handleClick = () => {
    onSelect?.(shuttle);
    onOpenDetails?.(shuttle);
  };

  return (
    <div className={`shuttle-card ${isSelected ? 'shuttle-card-selected' : ''}`} onClick={handleClick} role="button" tabIndex={0} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); handleClick(); } }} aria-pressed={isSelected} style={{ '--card-accent': shuttle.accentColor || '#06b6d4' }}>
      {isSelected && <div className="selected-indicator-bar" />}
      <div className="shuttle-card-header">
        <div className="shuttle-card-identity">
          <div className="shuttle-icon-badge" style={{ backgroundColor: `${shuttle.accentColor || '#06b6d4'}18`, borderColor: `${shuttle.accentColor || '#06b6d4'}40`, color: shuttle.accentColor || '#06b6d4' }}><Bus size={18} /></div>
          <div className="shuttle-info"><div className="shuttle-name-row"><h3 className="shuttle-card-name">{shuttle.name}</h3><span className="shuttle-badge-id">{shuttle.id}</span></div><div className="shuttle-driver-subtext">{shuttle.routeFullName}</div></div>
        </div>
        <div className="shuttle-card-status-col"><StatusBadge status={shuttle.status} size="sm" /><div className="shuttle-card-eta"><Clock size={13} className="eta-icon" /><span className="eta-value">{shuttle.eta}</span></div></div>
      </div>
      <div className="shuttle-card-body">
        <div className="route-flow"><div className="route-flow-label">Route:</div><div className="route-flow-text" title={shuttle.route}>{shuttle.route}</div></div>
        <div className="next-stop-flow"><div className="next-stop-pill"><MapPin size={13} className="next-stop-pin" /><span className="next-stop-label">Next Stop:</span><span className="next-stop-target">{shuttle.nextStop}</span></div></div>
      </div>
      <div className="shuttle-card-footer"><div className="footer-telemetry"><span className="footer-telem-item"><Gauge size={12} /> {shuttle.speed}</span><span className="footer-dot">•</span><span className="footer-telem-item"><Users size={12} /> {shuttle.crowding || 'Not reported'}</span></div><div className="select-action-hint"><span>Details</span><ChevronRight size={14} className="details-chevron" /></div></div>
    </div>
  );
}
