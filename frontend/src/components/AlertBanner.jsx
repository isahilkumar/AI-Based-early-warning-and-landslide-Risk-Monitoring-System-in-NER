import React from 'react';
import { AlertTriangle, ChevronRight, ShieldAlert } from 'lucide-react';

export const AlertBanner = ({ alerts = [], onSelectAlert, onViewAlerts }) => {
  if (!alerts || alerts.length === 0) return null;

  const activeAlert = alerts[0];

  return (
    <div style={{
      maxWidth: '1760px',
      margin: '16px auto 0 auto',
      width: 'calc(100% - 72px)',
      background: '#fef2f2',
      border: '1px solid #fca5a5',
      borderRadius: 'var(--radius-md)',
      padding: '12px 22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '20px',
      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.08)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#dc2626',
          flexShrink: 0
        }}>
          <ShieldAlert size={20} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <span className="badge badge-critical" style={{ fontSize: '0.68rem', padding: '2px 7px' }}>
              CRITICAL EARLY WARNING
            </span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
              Station: <strong style={{ color: '#0f172a' }}>{activeAlert.location_name || activeAlert.title}</strong> ({activeAlert.district}, {activeAlert.state})
            </span>
          </div>
          <p style={{
            margin: 0,
            fontSize: '0.86rem',
            color: '#0f172a',
            fontWeight: 700
          }}>
            {activeAlert.trigger_reason}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
        {onViewAlerts && (
          <button
            onClick={onViewAlerts}
            className="btn btn-danger"
            style={{ fontSize: '0.78rem', padding: '7px 14px', gap: '5px' }}
          >
            <span>View All Alerts ({alerts.length})</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertBanner;

