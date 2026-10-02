import React, { useState } from 'react';
import { Search, SlidersHorizontal, RefreshCw, BusFront } from 'lucide-react';
import ShuttleCard from './ShuttleCard';

/**
 * ShuttleList Component
 * Panel holding the list of shuttles with search/filters and selection callbacks
 */
export default function ShuttleList({ 
  shuttles = [], 
  selectedShuttleId, 
  onSelectShuttle,
  onOpenDetails,
  onRefresh,
  isRefreshing
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredShuttles = shuttles.filter((shuttle) => {
    const matchesSearch = 
      shuttle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shuttle.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shuttle.nextStop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shuttle.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'ALL' || 
      shuttle.status.toUpperCase() === statusFilter.toUpperCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="shuttle-list-panel">
      <div className="shuttle-list-header">
        <div className="shuttle-list-title-row">
          <div className="shuttle-list-title-group">
            <BusFront size={20} className="title-icon" />
            <div>
              <h3 className="panel-heading">Available Shuttles</h3>
              <span className="panel-subheading">{shuttles.length} fleet vehicles in service</span>
            </div>
          </div>

          {onRefresh && (
            <button 
              type="button" 
              className={`panel-refresh-btn ${isRefreshing ? 'is-spinning' : ''}`}
              onClick={onRefresh}
              title="Refresh telemetry"
              aria-label="Refresh telemetry"
            >
              <RefreshCw size={15} />
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="search-box-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by shuttle, stop, or route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search shuttles"
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

        {/* Filter Pills */}
        <div className="filter-chips">
          {['ALL', 'ON ROUTE', 'BOARDING'].map((filterKey) => (
            <button
              key={filterKey}
              type="button"
              className={`filter-chip ${statusFilter === filterKey ? 'filter-chip-active' : ''}`}
              onClick={() => setStatusFilter(filterKey)}
            >
              {filterKey === 'ALL' ? 'All Shuttles' : filterKey}
            </button>
          ))}
        </div>
      </div>

      {/* Shuttle Cards Container */}
      <div className="shuttle-cards-container">
        {filteredShuttles.length > 0 ? (
          filteredShuttles.map((shuttle) => (
            <ShuttleCard
              key={shuttle.id}
              shuttle={shuttle}
              isSelected={shuttle.id === selectedShuttleId}
              onSelect={onSelectShuttle}
              onOpenDetails={onOpenDetails}
            />
          ))
        ) : (
          <div className="empty-shuttles-state">
            <div className="empty-shuttle-icon">🚍</div>
            <p className="empty-shuttle-text">No shuttles match your filter.</p>
            <button 
              type="button" 
              className="reset-filters-btn"
              onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
