import React from 'react';
import { 
  Bus, 
  Layers, 
  Navigation, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Zap 
} from 'lucide-react';

/**
 * FleetSummaryCards Component
 * Computes and displays dynamic KPIs from the shuttle fleet
 */
export default function FleetSummaryCards({ shuttles = [] }) {
  // Dynamically compute KPI values from shuttles array
  const totalFleet = shuttles.length;
  const onRouteCount = shuttles.filter((s) => s.status?.toUpperCase() === 'ON ROUTE').length;
  const boardingCount = shuttles.filter((s) => s.status?.toUpperCase() === 'BOARDING').length;
  const delayedCount = shuttles.filter((s) => s.status?.toUpperCase() === 'DELAYED').length;
  
  // High occupancy or delayed vehicles requiring attention
  const attentionCount = shuttles.filter(
    (s) => s.status?.toUpperCase() === 'DELAYED' || parseInt(s.occupancy || 0) >= 80
  ).length;

  const kpis = [
    {
      id: 'active',
      label: 'Active Shuttles',
      value: shuttles.length,
      sub: 'All units transmitting',
      icon: Zap,
      accent: 'cyan',
      dotColor: '#06b6d4'
    },
    {
      id: 'total',
      label: 'Total Fleet',
      value: totalFleet,
      sub: 'Campus registered',
      icon: Layers,
      accent: 'blue',
      dotColor: '#3b82f6'
    },
    {
      id: 'on-route',
      label: 'On Route',
      value: onRouteCount,
      sub: 'In transit between stops',
      icon: Navigation,
      accent: 'emerald',
      dotColor: '#10b981'
    },
    {
      id: 'boarding',
      label: 'Boarding',
      value: boardingCount,
      sub: 'At campus platforms',
      icon: Clock,
      accent: 'amber',
      dotColor: '#f59e0b'
    },
    {
      id: 'attention',
      label: 'Attention Required',
      value: attentionCount,
      sub: attentionCount > 0 ? 'High occupancy / alerts' : 'All systems nominal',
      icon: AlertTriangle,
      accent: attentionCount > 0 ? 'amber' : 'emerald',
      dotColor: attentionCount > 0 ? '#f59e0b' : '#10b981'
    }
  ];

  return (
    <div className="fleet-kpi-grid">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.id} className={`fleet-kpi-card kpi-accent-${kpi.accent}`}>
            <div className="kpi-card-header">
              <span className="kpi-label">{kpi.label}</span>
              <div className="kpi-icon-wrapper">
                <Icon size={16} />
              </div>
            </div>

            <div className="kpi-value-row">
              <span className="kpi-big-number">{kpi.value}</span>
              <span 
                className="kpi-status-dot" 
                style={{ backgroundColor: kpi.dotColor }} 
              />
            </div>

            <div className="kpi-sub-text">{kpi.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
