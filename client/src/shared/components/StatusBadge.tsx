import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeClass = (s: string) => {
    switch (s.toLowerCase()) {
      case 'active':
      case 'confirmed':
      case 'in':
        return 'badge-active';
      case 'lead':
      case 'retail':
        return 'badge-lead';
      case 'inactive':
      case 'wholesale':
        return 'badge-inactive';
      case 'draft':
      case 'distributor':
        return 'badge-draft';
      case 'cancelled':
      case 'out':
        return 'badge-cancelled';
      default:
        return 'bg-glass text-muted';
    }
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;
