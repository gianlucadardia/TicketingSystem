import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  'Aperto':         { color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  'In Lavorazione': { color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  'Risolto':        { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  'Chiuso':         { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' };
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '2px 10px',
        borderRadius: 999,
        border: `1px solid ${cfg.border}`,
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: '20px',
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </span>
  );
};
