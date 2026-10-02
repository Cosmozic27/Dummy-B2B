import React from 'react';

/**
 * StatusBadge Component
 * Renders consistent, accessible status pills for shuttle and transit states
 */
export default function StatusBadge({ status, size = 'md' }) {
  const getStatusConfig = (val) => {
    const normalized = (val || '').toUpperCase();
    switch (normalized) {
      case 'ON ROUTE':
        return {
          label: 'ON ROUTE',
          bg: 'rgba(6, 182, 212, 0.12)',
          border: 'rgba(6, 182, 212, 0.35)',
          text: '#22d3ee',
          dot: '#06b6d4',
          pulse: true
        };
      case 'ACTIVE':
        return {
          label: 'ACTIVE',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.3)',
          text: '#34d399',
          dot: '#10b981',
          pulse: false
        };
      case 'BOARDING':
        return {
          label: 'BOARDING',
          bg: 'rgba(245, 158, 11, 0.12)',
          border: 'rgba(245, 158, 11, 0.35)',
          text: '#fbbf24',
          dot: '#f59e0b',
          pulse: true
        };
      case 'ARRIVING SOON':
        return {
          label: 'ARRIVING',
          bg: 'rgba(16, 185, 129, 0.12)',
          border: 'rgba(16, 185, 129, 0.35)',
          text: '#34d399',
          dot: '#10b981',
          pulse: true
        };
      case 'DELAYED':
        return {
          label: 'DELAYED',
          bg: 'rgba(239, 68, 68, 0.12)',
          border: 'rgba(239, 68, 68, 0.35)',
          text: '#f87171',
          dot: '#ef4444',
          pulse: false
        };
      default:
        return {
          label: val || 'STANDBY',
          bg: 'rgba(148, 163, 184, 0.12)',
          border: 'rgba(148, 163, 184, 0.25)',
          text: '#94a3b8',
          dot: '#64748b',
          pulse: false
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = size === 'sm'
    ? 'status-badge-sm'
    : size === 'lg'
      ? 'status-badge-lg'
      : 'status-badge-md';

  return (
    <span
      className={`status-badge ${sizeClasses}`}
      style={{
        backgroundColor: config.bg,
        borderColor: config.border,
        color: config.text
      }}
    >
      <span
        className={`status-badge-dot ${config.pulse ? 'pulse-animation' : ''}`}
        style={{ backgroundColor: config.dot }}
      />
      <span className="status-badge-text">{config.label}</span>
    </span>
  );
}
