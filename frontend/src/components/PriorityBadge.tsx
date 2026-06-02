import React from 'react';

interface PriorityBadgeProps {
  priority: string;
}

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  'Bassa':   { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e' },
  'Media':   { color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', dot: '#3b82f6' },
  'Alta':    { color: '#b45309', bg: '#fffbeb', border: '#fde68a', dot: '#f59e0b' },
  'Critica': { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', dot: '#ef4444' },
};

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const cfg = PRIORITY_CONFIG[priority] ?? { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', dot: '#9ca3af' };
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
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
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          backgroundColor: cfg.dot,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {priority}
    </span>
  );
};
