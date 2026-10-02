import React, { useState } from 'react';
import { 
  Search, 
  Bus, 
  MapPin, 
  Clock, 
  Gauge, 
  Users, 
  Crosshair, 
  SlidersHorizontal 
} from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * FleetTable Component
 * Operator-oriented fleet table & list with search, status filtering, and telematics view
 */
export default function FleetTable({ 
  shuttles = [], 
  selectedShuttleId, 
  onSelectShuttle, 
  onTrackVehicle,
  lastUpdated = 'Just now' 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredShuttles = shuttles.filter((shuttle) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      shuttle.name.toLowerCase().includes(term) ||
      shuttle.id.toLowerCase().includes(term) ||
      shuttle.nextStop.toLowerCase().includes(term) ||
      shuttle.route.toLowerCase().includes(term);

    const matchesStatus =
      statusFilter === 'ALL' ||
      shuttle.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  const filterTabs = [
    { key: 'ALL', label: 'All Fleet' },
    { key: 'ON ROUTE', label: 'On Route' },
    { key: 'BOARDING', label: 'Boarding' },
    { key: 'ARRIVING SOON', label: 'Arriving Soon' },
    { key: 'DELAYED', label: 'Delayed' }
  ];

  return (
    <div className="fleet-table-panel">
      {/* Table Header & Controls */}
      <div className="fleet-table-header">
        <div className="fleet-table-title-group">
          <div className="table-title-icon-wrapper">
            <Bus size={18} />
          </div>
          <div>
            <h3 className="fleet-panel-heading">Active Fleet Manifest</h3>
            <span className="fleet-panel-sub">
              {filteredShuttles.length} of {shuttles.length} vehicles matching telemetry filters
            </span>
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="fleet-controls-row">
          <div className="fleet-search-wrapper">
            <Search size={15} className="fleet-search-icon" />
            <input
              type="text"
              placeholder="Search by shuttle, ID, or stop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="fleet-search-input"
              aria-label="Search fleet"
            />
            {searchTerm && (
              <button 
                type="button" 
                className="clear-search-btn"
                onClick={() => setSearchTerm('')}
              >
                ×
              </button>
            )}
          </div>

          <div className="fleet-filter-tabs">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={`fleet-filter-btn ${statusFilter === tab.key ? 'filter-active' : ''}`}
                onClick={() => setStatusFilter(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="fleet-table-wrapper">
        <table className="fleet-data-table">
          <thead>
            <tr>
              <th>Vehicle / ID</th>
              <th>Status</th>
              <th>Next Stop</th>
              <th>ETA</th>
              <th>Speed</th>
              <th>Capacity</th>
              <th>Telemetry</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredShuttles.length > 0 ? (
              filteredShuttles.map((shuttle) => {
                const isSelected = shuttle.id === selectedShuttleId;
                const occNumber = parseInt(shuttle.occupancy || '0');
                const isHighOccupancy = occNumber >= 80;

                return (
                  <tr 
                    key={shuttle.id} 
                    className={`fleet-table-row ${isSelected ? 'row-selected' : ''}`}
                    onClick={() => onSelectShuttle(shuttle)}
                  >
                    <td>
                      <div className="table-vehicle-cell">
                        <div 
                          className="vehicle-color-bar" 
                          style={{ backgroundColor: shuttle.accentColor || '#06b6d4' }} 
                        />
                        <div>
                          <strong className="vehicle-name">{shuttle.name}</strong>
                          <span className="vehicle-id-badge">{shuttle.id}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={shuttle.status} size="sm" />
                    </td>
                    <td>
                      <div className="table-stop-cell">
                        <MapPin size={13} className="stop-cell-icon" />
                        <span>{shuttle.nextStop}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-eta-cell">
                        <Clock size={12} className="eta-cell-icon" />
                        <span>{shuttle.eta}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-tele-cell">
                        <Gauge size={13} className="tele-cell-icon" />
                        <span>{shuttle.speed || '24 km/h'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="table-occ-cell">
                        <div className="occ-meter-bar">
                          <div 
                            className={`occ-meter-fill ${isHighOccupancy ? 'meter-high' : ''}`} 
                            style={{ width: `${Math.min(occNumber, 100)}%` }} 
                          />
                        </div>
                        <span className="occ-percent">{shuttle.occupancy || '40%'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="table-telemetry-tag">{lastUpdated}</span>
                    </td>
                    <td className="text-right">
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className="table-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectShuttle(shuttle);
                            if (onTrackVehicle) onTrackVehicle(shuttle);
                          }}
                          title={`Track ${shuttle.name} on map`}
                        >
                          <Crosshair size={13} />
                          <span>Track</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="empty-table-row">
                  No fleet vehicles matching the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
