import { AlertTriangle, Bus, Layers, Navigation, Radio } from 'lucide-react';
import { isVehicleActive } from '../services/transitViewModel.js';

export default function FleetSummaryCards({ shuttles = [] }) {
  const activeCount = shuttles.filter(isVehicleActive).length;
  const onRouteCount = shuttles.filter((shuttle) => shuttle.isMoving).length;
  const delayedCount = shuttles.filter((shuttle) => shuttle.isDelayed).length;
  const crowdingReports = shuttles.filter((shuttle) => shuttle.crowding && shuttle.crowding !== 'Not reported').length;
  const kpis = [
    { id: 'active', label: 'Active Vehicles', value: activeCount, sub: 'Current vehicle status', icon: Bus, accent: 'cyan', dot: '#06b6d4' },
    { id: 'total', label: 'Total Fleet', value: shuttles.length, sub: 'Vehicle documents', icon: Layers, accent: 'blue', dot: '#3b82f6' },
    { id: 'moving', label: 'Moving', value: onRouteCount, sub: 'Speed above zero', icon: Navigation, accent: 'emerald', dot: '#10b981' },
    { id: 'delayed', label: 'Delayed', value: delayedCount, sub: 'Reported delay', icon: AlertTriangle, accent: delayedCount ? 'amber' : 'emerald', dot: delayedCount ? '#f59e0b' : '#10b981' },
    { id: 'crowding', label: 'Crowding Reports', value: crowdingReports, sub: 'Reported vehicle values', icon: Radio, accent: 'amber', dot: '#f59e0b' },
  ];
  return <div className="fleet-kpi-grid">{kpis.map((kpi) => {
    const Icon = kpi.icon;
    return <div key={kpi.id} className={`fleet-kpi-card kpi-accent-${kpi.accent}`}><div className="kpi-card-header"><span className="kpi-label">{kpi.label}</span><div className="kpi-icon-wrapper"><Icon size={16} /></div></div><div className="kpi-value-row"><span className="kpi-big-number">{kpi.value}</span><span className="kpi-status-dot" style={{ backgroundColor: kpi.dot }} /></div><div className="kpi-sub-text">{kpi.sub}</div></div>;
  })}</div>;
}
