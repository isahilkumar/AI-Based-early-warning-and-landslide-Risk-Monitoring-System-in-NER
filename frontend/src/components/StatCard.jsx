import React from 'react';

export const StatCard = ({ title, value, unit = '', subtitle, icon: Icon, trend, color = '#ea580c', glow = false }) => {
  return (
    <div 
      className="glass-panel glass-panel-hover"
      style={{
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
        borderLeft: `4px solid ${color}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      {glow && (
        <div style={{
          position: 'absolute',
          top: '-20px',
          right: '-20px',
          width: '90px',
          height: '90px',
          borderRadius: '50%',
          background: color,
          opacity: 0.12,
          filter: 'blur(25px)',
          pointerEvents: 'none'
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            padding: '8px',
            borderRadius: '10px',
            background: '#fff7ed',
            color: color,
            border: '1px solid #fed7aa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={19} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '4px 0' }}>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '2.1rem',
          fontWeight: 900,
          color: '#0f172a',
          letterSpacing: '-0.02em',
          lineHeight: 1
        }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '0.92rem', color: '#64748b', fontWeight: 600 }}>
            {unit}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem' }}>
          {trend && (
            <span style={{
              color: trend.startsWith('+') ? '#dc2626' : '#16a34a',
              fontWeight: 700,
              background: trend.startsWith('+') ? '#fef2f2' : '#f0fdf4',
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {trend}
            </span>
          )}
          {subtitle && (
            <span style={{ color: '#64748b', fontWeight: 500 }}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
