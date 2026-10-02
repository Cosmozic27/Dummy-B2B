import React from 'react';
import { 
  Gauge, 
  Users, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Compass, 
  Activity,
  Zap
} from 'lucide-react';

/**
 * TelemetryCard Component
 * Displays real-time vehicle telematics including speed, occupancy, distance, and health status
 */
export default function TelemetryCard({ shuttle, lastUpdated = 'Just now' }) {
  if (!shuttle) return null;

  // Derive distance to next stop from mock stops or fallback
  const nextStopObj = shuttle.stops?.find((s) => s.isTarget || s.status === 'current');
  const distanceToNext = nextStopObj?.distance || '400 m away';

  return (
    <div className="telemetry-card-container">
      <div className="telemetry-card-header">
        <div className="telemetry-card-title-group">
          <Activity size={17} className="telemetry-icon-pulse" />
          <h4 className="telemetry-card-title">Live Telemetry</h4>
        </div>
        <div className="telemetry-live-pill">
          <span className="telemetry-dot-ping" />
          <span>Realtime GPS</span>
        </div>
      </div>

      <div className="telemetry-metrics-grid">
        {/* Metric 1: Current Speed */}
        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">Current Speed</span>
            <Gauge size={16} className="metric-box-icon text-cyan" />
          </div>
          <div className="metric-box-value">
            {shuttle.speed || '24 km/h'}
          </div>
          <span className="metric-box-meta">Normal Cruising</span>
        </div>

        {/* Metric 2: Passenger Occupancy */}
        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">Occupancy</span>
            <Users size={16} className="metric-box-icon text-emerald" />
          </div>
          <div className="metric-box-value">
            {shuttle.occupancy || '42%'}
          </div>
          <span className="metric-box-meta">{shuttle.occupancyLabel || 'Moderate Seating'}</span>
        </div>

        {/* Metric 3: Distance to Next Stop */}
        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">Distance to Stop</span>
            <MapPin size={16} className="metric-box-icon text-amber" />
          </div>
          <div className="metric-box-value">
            {distanceToNext}
          </div>
          <span className="metric-box-meta">To {shuttle.nextStop}</span>
        </div>

        {/* Metric 4: Last Telemetry Update */}
        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">Last Updated</span>
            <Clock size={16} className="metric-box-icon text-purple" />
          </div>
          <div className="metric-box-value">
            {lastUpdated}
          </div>
          <span className="metric-box-meta">GPS Lock: Strong (12 sats)</span>
        </div>

        {/* Metric 5: Vehicle Operational Status */}
        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">Vehicle Health</span>
            <ShieldCheck size={16} className="metric-box-icon text-emerald" />
          </div>
          <div className="metric-box-value">
            Nominal
          </div>
          <span className="metric-box-meta">All Subsystems OK</span>
        </div>

        {/* Metric 6: Compass Bearing */}
        <div className="metric-box">
          <div className="metric-box-top">
            <span className="metric-box-label">Heading Direction</span>
            <Compass size={16} className="metric-box-icon text-cyan" />
          </div>
          <div className="metric-box-value">
            {shuttle.heading || 145}° SE
          </div>
          <span className="metric-box-meta">On Corridor Lane</span>
        </div>
      </div>
    </div>
  );
}
