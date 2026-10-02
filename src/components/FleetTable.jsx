import { useState } from 'react';
import { Bus, Clock, Crosshair, Gauge, MapPin, Search } from 'lucide-react';
import StatusBadge from './StatusBadge.jsx';

export default function FleetTable({ shuttles = [], selectedShuttleId, onSelectShuttle, onTrackVehicle, lastUpdated = 'Just now' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const term = searchTerm.trim().toLowerCase();
  const filteredShuttles = shuttles.filter((shuttle) => {
    const matchesSearch = [shuttle.name, shuttle.id, shuttle.nextStop, shuttle.routeFullName]
      .some((value) => String(value || '').toLowerCase().includes(term));
    const matchesStatus = statusFilter === 'ALL' || shuttle.status.toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });
  const filterTabs = [
    { key: 'ALL', label: 'All Fleet' },
    { key: 'ACTIVE', label: 'Active' },
    { key: 'ON ROUTE', label: 'On Route' },
    { key: 'DELAYED', label: 'Delayed' },
  ];

  return (
    <div className="fleet-table-panel">
      <div className="fleet-table-header">
        <div className="fleet-table-title-group">
          <div className="table-title-icon-wrapper"><Bus size={18} /></div>
          <div><h3 className="fleet-panel-heading">Fleet Manifest</h3><span className="fleet-panel-sub">{filteredShuttles.length} of {shuttles.length} vehicles match the filters</span></div>
        </div>
        <div className="fleet-controls-row">
          <div className="fleet-search-wrapper"><Search size={15} className="fleet-search-icon" /><input type="text" placeholder="Search vehicle, route, or stop…" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="fleet-search-input" aria-label="Search fleet" />{searchTerm && <button type="button" className="clear-search-btn" onClick={() => setSearchTerm('')} aria-label="Clear search">×</button>}</div>
          <div className="fleet-filter-tabs">{filterTabs.map((tab) => <button key={tab.key} type="button" className={`fleet-filter-btn ${statusFilter === tab.key ? 'filter-active' : ''}`} onClick={() => setStatusFilter(tab.key)}>{tab.label}</button>)}</div>
        </div>
      </div>

      <div className="fleet-table-wrapper">
        <table className="fleet-data-table">
          <thead><tr><th>Vehicle / ID</th><th>Status</th><th>Next Stop</th><th>ETA</th><th>Speed</th><th>Crowding</th><th>Telemetry</th><th className="text-right">Action</th></tr></thead>
          <tbody>
            {filteredShuttles.length > 0 ? filteredShuttles.map((shuttle) => {
              const isSelected = shuttle.id === selectedShuttleId;
              return (
                <tr key={shuttle.id} className={`fleet-table-row ${isSelected ? 'row-selected' : ''}`} onClick={() => onSelectShuttle?.(shuttle)}>
                  <td><div className="table-vehicle-cell"><div className="vehicle-color-bar" style={{ backgroundColor: shuttle.accentColor || '#06b6d4' }} /><div><strong className="vehicle-name">{shuttle.name}</strong><span className="vehicle-id-badge">{shuttle.id}</span></div></div></td>
                  <td><StatusBadge status={shuttle.status} size="sm" /></td>
                  <td><div className="table-stop-cell"><MapPin size={13} className="stop-cell-icon" /><span>{shuttle.nextStop}</span></div></td>
                  <td><div className="table-eta-cell"><Clock size={12} className="eta-cell-icon" /><span>{shuttle.eta}</span></div></td>
                  <td><div className="table-tele-cell"><Gauge size={13} className="tele-cell-icon" /><span>{shuttle.speed}</span></div></td>
                  <td><span className="crowding-pill">{shuttle.crowding || 'Not reported'}</span></td>
                  <td><span className="table-telemetry-tag">{lastUpdated}</span></td>
                  <td className="text-right"><div className="table-actions-cell"><button type="button" className="table-action-btn" onClick={(event) => { event.stopPropagation(); onSelectShuttle?.(shuttle); onTrackVehicle?.(shuttle); }} title={`Track ${shuttle.name} on map`}><Crosshair size={13} /><span>Track</span></button></div></td>
                </tr>
              );
            }) : <tr><td colSpan={8} className="empty-table-row">No fleet vehicles match the selected filters.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
