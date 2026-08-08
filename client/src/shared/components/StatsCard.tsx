import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, trend, trendUp, color = 'primary' }) => {
  const colorMap = {
    primary: 'var(--accent-primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
    info: 'var(--info)'
  };

  const bgMap = {
    primary: 'var(--accent-primary-glow)',
    success: 'var(--success-bg)',
    warning: 'var(--warning-bg)',
    danger: 'var(--danger-bg)',
    info: 'var(--info-bg)'
  };

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-secondary text-sm font-medium">{title}</h3>
        <div 
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: bgMap[color], color: colorMap[color] }}
        >
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-primary">{value}</div>
        {trend && (
          <div className={`text-sm font-medium ${trendUp ? 'text-success' : 'text-danger'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
