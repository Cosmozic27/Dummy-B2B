import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function AttentionPanel({ shuttles = [] }) {
  const delayed = shuttles.filter((shuttle) => shuttle.isDelayed);
  const alerts = delayed.map((shuttle) => ({
    id: `delay-${shuttle.id}`,
    type: 'attention',
    icon: AlertTriangle,
    title: `${shuttle.name} is delayed`,
    message: `${shuttle.delayMinutes || 0} minutes reported · Current route: ${shuttle.routeFullName || 'not assigned'}.`,
    tag: 'DELAY REPORTED',
    time: shuttle.nextStop ? `Next stop: ${shuttle.nextStop}` : 'Live vehicle record',
  }));
  if (alerts.length === 0) {
    alerts.push({
      id: 'no-delay-reports',
      type: 'nominal',
      icon: CheckCircle2,
      title: 'No delay reports',
      message: 'No vehicle in the current Firestore snapshot is marked delayed.',
      tag: 'LIVE DATA',
      time: 'Realtime snapshot',
    });
  }

  return (
    <div className="attention-panel-card">
      <div className="attention-panel-header"><div className="attention-title-group"><Clock size={17} className="attention-header-icon" /><h4 className="attention-heading">Fleet Operational Alerts</h4></div><span className="attention-badge-count">{delayed.length} Delayed</span></div>
      <div className="attention-items-list">{alerts.map((alert) => {
        const Icon = alert.icon;
        return <div key={alert.id} className={`attention-alert-item alert-type-${alert.type}`}><div className="alert-icon-box"><Icon size={16} /></div><div className="alert-content-box"><div className="alert-top-row"><strong className="alert-title">{alert.title}</strong><span className="alert-tag-pill">{alert.tag}</span></div><p className="alert-description">{alert.message}</p><span className="alert-time-tag">{alert.time}</span></div></div>;
      })}</div>
    </div>
  );
}
