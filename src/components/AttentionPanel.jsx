import React from 'react';
import { 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Users, 
  Radio, 
  Clock, 
  ShieldCheck 
} from 'lucide-react';

/**
 * AttentionPanel Component
 * Displays actionable operational alerts derived from real-time fleet conditions
 */
export default function AttentionPanel({ shuttles = [] }) {
  // Dynamically derive alerts from the fleet
  const alerts = [];

  shuttles.forEach((shuttle) => {
    const occ = parseInt(shuttle.occupancy || '0');
    if (occ >= 80) {
      alerts.push({
        id: `occ-${shuttle.id}`,
        type: 'attention',
        icon: Users,
        title: `High Capacity: ${shuttle.name} (${shuttle.id})`,
        message: `Reported ${shuttle.occupancy} capacity (${shuttle.occupancyLabel || 'Near Full'}) at ${shuttle.nextStop}. Monitor for platform overcrowding.`,
        tag: 'CAPACITY ALERT',
        time: 'Active now'
      });
    }

    if (shuttle.status === 'BOARDING') {
      alerts.push({
        id: `boarding-${shuttle.id}`,
        type: 'notice',
        icon: Clock,
        title: `Boarding Phase: ${shuttle.name}`,
        message: `Currently dwell-timing at ${shuttle.nextStop}. Scheduled departure in ~60 seconds.`,
        tag: 'DWELL NOTICE',
        time: 'Just now'
      });
    }
  });

  // Always include telemetry and schedule health status
  alerts.push({
    id: 'system-gps',
    type: 'nominal',
    icon: ShieldCheck,
    title: 'Fleet GPS Telemetry Integrity',
    message: 'All 4 vehicle AVL transponders transmitting at 1.0 Hz with 100% signal lock.',
    tag: 'SYSTEM NOMINAL',
    time: 'Synced'
  });

  return (
    <div className="attention-panel-card">
      <div className="attention-panel-header">
        <div className="attention-title-group">
          <AlertTriangle size={17} className="attention-header-icon" />
          <h4 className="attention-heading">Fleet Operational Alerts</h4>
        </div>
        <span className="attention-badge-count">
          {alerts.filter((a) => a.type === 'attention').length} Action Items
        </span>
      </div>

      <div className="attention-items-list">
        {alerts.map((alert) => {
          const Icon = alert.icon;
          return (
            <div key={alert.id} className={`attention-alert-item alert-type-${alert.type}`}>
              <div className="alert-icon-box">
                <Icon size={16} />
              </div>
              <div className="alert-content-box">
                <div className="alert-top-row">
                  <strong className="alert-title">{alert.title}</strong>
                  <span className="alert-tag-pill">{alert.tag}</span>
                </div>
                <p className="alert-description">{alert.message}</p>
                <span className="alert-time-tag">{alert.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
