import { useState } from 'react';
import { BusFront, Search } from 'lucide-react';
import ShuttleCard from './ShuttleCard.jsx';

export default function ShuttleList({ shuttles = [], selectedShuttleId, onSelectShuttle, onOpenDetails }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const term = searchTerm.trim().toLowerCase();
  const filteredShuttles = shuttles.filter((shuttle) => {
    const matchesSearch = [shuttle.name, shuttle.route, shuttle.nextStop, shuttle.id]
      .some((value) => String(value || '').toLowerCase().includes(term));
    return matchesSearch && (statusFilter === 'ALL' || shuttle.status.toUpperCase() === statusFilter);
  });
  const filters = ['ALL', 'ACTIVE', 'ON ROUTE', 'DELAYED'];

  return (
    <div className="shuttle-list-panel">
      <div className="shuttle-list-header">
        <div className="shuttle-list-title-row"><div className="shuttle-list-title-group"><BusFront size={20} className="title-icon" /><div><h3 className="panel-heading">Campus Fleet</h3><span className="panel-subheading">{shuttles.length} live vehicle records</span></div></div></div>
        <div className="search-box-wrapper"><Search size={16} className="search-icon" /><input type="text" className="search-input" placeholder="Search by vehicle, stop, or route…" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} aria-label="Search shuttles" />{searchTerm && <button type="button" className="clear-search-btn" onClick={() => setSearchTerm('')} aria-label="Clear search">×</button>}</div>
        <div className="filter-chips">{filters.map((filter) => <button key={filter} type="button" className={`filter-chip ${statusFilter === filter ? 'filter-chip-active' : ''}`} onClick={() => setStatusFilter(filter)}>{filter === 'ALL' ? 'All Vehicles' : filter}</button>)}</div>
      </div>
      <div className="shuttle-cards-container">
        {filteredShuttles.length > 0 ? filteredShuttles.map((shuttle) => <ShuttleCard key={shuttle.id} shuttle={shuttle} isSelected={shuttle.id === selectedShuttleId} onSelect={onSelectShuttle} onOpenDetails={onOpenDetails} />) : (
          <div className="empty-shuttles-state"><div className="empty-shuttle-icon">—</div><p className="empty-shuttle-text">No vehicles match your filter.</p><button type="button" className="reset-filters-btn" onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}>Reset Filters</button></div>
        )}
      </div>
    </div>
  );
}
