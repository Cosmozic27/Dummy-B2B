import { Activity, Clock, Gauge, MapPin, ShieldCheck, Users } from 'lucide-react';

export default function TelemetryCard({ shuttle, lastUpdated = 'Just now' }) {
  if (!shuttle) return null;
  const nextStop = shuttle.stops?.find((stop) => stop.isTarget || stop.status === 'current');
  const coordinates = Number.isFinite(shuttle.latitude) && Number.isFinite(shuttle.longitude)
    ? `${shuttle.latitude.toFixed(5)}, ${shuttle.longitude.toFixed(5)}`
    : 'Not available';
  const metrics = [
    { label: 'Current Speed', value: shuttle.speed || '—', meta: 'From vehicle document', icon: Gauge, color: 'text-cyan' },
    { label: 'Crowding', value: shuttle.crowding || 'Not reported', meta: 'From vehicle document', icon: Users, color: 'text-emerald' },
    { label: 'Distance to Stop', value: nextStop?.distance || '—', meta: `To ${shuttle.nextStop || 'next stop'}`, icon: MapPin, color: 'text-amber' },
    { label: 'Last Updated', value: lastUpdated, meta: 'Firestore snapshot', icon: Clock, color: 'text-purple' },
    { label: 'Vehicle Status', value: shuttle.status || 'Unknown', meta: shuttle.isDelayed ? `${shuttle.delayMinutes} min delay reported` : 'Live vehicle status', icon: ShieldCheck, color: 'text-emerald' },
    { label: 'Coordinates', value: coordinates, meta: 'Latitude, longitude', icon: Activity, color: 'text-cyan' },
  ];

  return (
    <div className="telemetry-card-container">
      <div className="telemetry-card-header"><div className="telemetry-card-title-group"><Activity size={17} className="telemetry-icon-pulse" /><h4 className="telemetry-card-title">Live Telemetry</h4></div><div className="telemetry-live-pill"><span className="telemetry-dot-ping" /><span>Firestore snapshots</span></div></div>
      <div className="telemetry-metrics-grid">
        {metrics.map(({ label, value, meta, icon: Icon, color }) => (
          <div className="metric-box" key={label}><div className="metric-box-top"><span className="metric-box-label">{label}</span><Icon size={16} className={`metric-box-icon ${color}`} /></div><div className="metric-box-value">{value}</div><span className="metric-box-meta">{meta}</span></div>
        ))}
      </div>
    </div>
  );
}
