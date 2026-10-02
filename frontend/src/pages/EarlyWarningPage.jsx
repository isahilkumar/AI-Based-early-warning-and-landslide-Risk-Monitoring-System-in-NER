import React, { useState, useEffect } from 'react';
import { 
  BellRing, 
  AlertOctagon, 
  ShieldAlert, 
  CheckCircle2, 
  Send, 
  Phone, 
  Clock, 
  Droplets, 
  Users, 
  Radio, 
  Check,
  Volume2,
  Share2,
  ExternalLink,
  Flame,
  AlertTriangle,
  X
} from 'lucide-react';
import api from '../services/api';

export const EarlyWarningPage = ({ soundEnabled = false, alerts: propAlerts = null, onAlertAcknowledged = null, userRole = 'ADMIN' }) => {
  const [alerts, setAlerts] = useState(propAlerts || []);
  const [responseTeams, setResponseTeams] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  
  // Broadcast Form State
  const [selectedLocId, setSelectedLocId] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastReason, setBroadcastReason] = useState('');
  const [broadcastAction, setBroadcastAction] = useState('');
  const [submittingBroadcast, setSubmittingBroadcast] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [alertList, teams, locs] = await Promise.all([
        api.getAlerts(),
        api.getResponseTeams(),
        api.getLocations()
      ]);
      setAlerts(alertList);
      setResponseTeams(teams);
      setLocations(locs);
      if (locs.length > 0) setSelectedLocId(locs[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await api.acknowledgeAlert(alertId, 'Duty Officer (SEOC)');
      if (onAlertAcknowledged) onAlertAcknowledged();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    setSubmittingBroadcast(true);
    try {
      await api.triggerManualAlert({
        location_id: selectedLocId,
        title: broadcastTitle,
        risk_level: 'CRITICAL',
        risk_probability: 0.92,
        rainfall_24h: 180,
        trigger_reason: broadcastReason,
        recommended_action: broadcastAction
      });
      setShowBroadcastModal(false);
      setBroadcastTitle('');
      setBroadcastReason('');
      setBroadcastAction('');
      fetchData();
      if (onAlertAcknowledged) onAlertAcknowledged();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingBroadcast(false);
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE');
  const acknowledgedAlerts = alerts.filter(a => a.status !== 'ACTIVE');

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fdba74', padding: '4px 12px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 800 }}>
              🚨 Early Warning & Response System
            </span>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              Multi-Agency Disaster Alert Grid
            </span>
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
            Threshold Early Warning & Alert Management
          </h1>
          <p style={{ fontSize: '0.92rem', color: '#475569', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            Real-time rainfall threshold breach detection, multi-channel emergency alert dispatches, and NDRF/SDRF emergency deployment roster.
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="btn btn-primary"
            style={{ padding: '11px 22px', fontSize: '0.88rem' }}
          >
            <Radio size={17} />
            <span>Broadcast Emergency Bulletin</span>
          </button>
        </div>
      </div>

      {/* Rainfall Threshold Levels Matrix (IMD & GSI Regional Standard) */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.18rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontWeight: 800 }}>
            <Droplets size={22} color="#ea580c" />
            <span>Rainfall-Based Early Warning Threshold Matrix (Himalayan / NER Zone)</span>
          </h3>
          <span style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 800, background: '#fff7ed', padding: '4px 12px', borderRadius: '999px', border: '1px solid #fdba74' }}>
            STANDARD OPERATING PROCEDURES (SOP)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            borderRadius: '14px',
            padding: '18px 20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-low">🟢 NORMAL</span>
              <span style={{ fontSize: '0.82rem', color: '#16a34a', fontWeight: 800 }}>&lt; 65 mm / 24h</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#334155', margin: '12px 0 0 0', lineHeight: 1.45 }}>
              Safe hydrological threshold. Standard routine telemetry monitoring at 15-minute intervals.
            </p>
          </div>

          <div style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '14px',
            padding: '18px 20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-medium">🟡 WATCH</span>
              <span style={{ fontSize: '0.82rem', color: '#d97706', fontWeight: 800 }}>65 – 119 mm / 24h</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#334155', margin: '12px 0 0 0', lineHeight: 1.45 }}>
              Moderate soil saturation. Local field officers alerted to inspect prone highway cuts.
            </p>
          </div>

          <div style={{
            background: '#fff7ed',
            border: '1px solid #fdba74',
            borderRadius: '14px',
            padding: '18px 20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-high">🟠 WARNING</span>
              <span style={{ fontSize: '0.82rem', color: '#ea580c', fontWeight: 800 }}>120 – 179 mm / 24h</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#334155', margin: '12px 0 0 0', lineHeight: 1.45 }}>
              Severe threshold breached. Restrict night transit on mountain roads; SDRF on standby.
            </p>
          </div>

          <div style={{
            background: '#fef2f2',
            border: '1px solid #fca5a5',
            borderRadius: '14px',
            padding: '18px 20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="badge badge-critical">🔴 CRITICAL</span>
              <span style={{ fontSize: '0.82rem', color: '#dc2626', fontWeight: 800 }}>≥ 180 mm / 24h</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#334155', margin: '12px 0 0 0', lineHeight: 1.45 }}>
              Extreme cloudburst trigger. Failure probability &gt; 80%. Immediate evacuation protocol.
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column Grid: Alerts Stream vs Response Units */}
      <div className="responsive-grid-2">
        {/* Left Column: Live Alerts Stream */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
              <BellRing size={20} color="#ea580c" />
              <span>Real-Time Incident Alerts Stream</span>
            </h2>
            <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
              {activeAlerts.length} Active • {acknowledgedAlerts.length} Acknowledged
            </span>
          </div>

          {activeAlerts.length === 0 && acknowledgedAlerts.length === 0 ? (
            <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
              <CheckCircle2 size={40} color="#16a34a" style={{ margin: '0 auto 14px auto' }} />
              <p style={{ fontSize: '0.92rem' }}>No active landslide emergency alerts at this time.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Active Alerts */}
              {activeAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="glass-panel"
                  style={{
                    padding: '22px 26px',
                    borderLeft: '5px solid #dc2626',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <span className={`badge badge-${alert.risk_level.toLowerCase()}`} style={{ padding: '3px 9px' }}>
                          {alert.risk_level}
                        </span>
                        <span style={{ fontSize: '0.74rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                          {alert.alert_code}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
                        {alert.title}
                      </h3>

                      <p style={{ fontSize: '0.84rem', color: '#475569', margin: 0 }}>
                        Station: <strong>{alert.location_name}</strong> ({alert.district}, {alert.state})
                      </p>
                    </div>

                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.82rem', padding: '8px 16px', whiteSpace: 'nowrap' }}
                    >
                      <Check size={15} />
                      <span>Acknowledge Alert</span>
                    </button>
                  </div>

                  {/* Trigger & Recommended Action Box */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    fontSize: '0.82rem',
                    lineHeight: '1.45'
                  }}>
                    <div style={{ color: '#dc2626', fontWeight: 700, marginBottom: '6px' }}>
                      ⚡ TRIGGER: {alert.trigger_reason}
                    </div>
                    <div style={{ color: '#334155' }}>
                      🛡️ <strong>RECOMMENDED ACTION:</strong> {alert.recommended_action}
                    </div>
                  </div>

                  {/* Telemetry Chips & Timestamp */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b', flexWrap: 'wrap', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span>24h Rain: <strong style={{ color: '#ea580c' }}>{alert.rainfall_24h} mm</strong></span>
                      <span>Soil Saturation: <strong style={{ color: '#16a34a' }}>{alert.soil_moisture}%</strong></span>
                      <span>Channels: <strong>{alert.channels_dispatched}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} />
                      <span>{alert.created_at?.slice(0, 16)}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Acknowledged Alerts */}
              {acknowledgedAlerts.map(alert => (
                <div
                  key={alert.id}
                  className="glass-panel"
                  style={{
                    padding: '18px 24px',
                    opacity: 0.9,
                    borderLeft: '5px solid #16a34a'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <span className="badge badge-low" style={{ marginBottom: '6px' }}>
                        ACKNOWLEDGED
                      </span>
                      <h4 style={{ margin: '6px 0 3px 0', fontSize: '1.02rem', color: '#0f172a' }}>
                        {alert.title}
                      </h4>
                      <span style={{ fontSize: '0.76rem', color: '#64748b' }}>
                        Acknowledged by <strong>{alert.acknowledged_by || 'SEOC Duty Commander'}</strong>
                      </span>
                    </div>

                    <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                      {alert.acknowledged_at ? alert.acknowledged_at.slice(0, 16) : 'Recorded'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: NDRF & SDRF Emergency Response Units */}
        <div>
          <h2 style={{ fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px', fontWeight: 800 }}>
            <Users size={20} color="#ea580c" />
            <span>Disaster Response Battalions</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {responseTeams.map(team => (
              <div key={team.id} className="glass-panel" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div>
                    <span style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 800, textTransform: 'uppercase' }}>
                      {team.state} STATE COMMAND
                    </span>
                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', margin: '3px 0 0 0' }}>
                      {team.unit_name}
                    </h4>
                  </div>
                  <span className="badge badge-low">
                    {team.readiness_level}
                  </span>
                </div>

                <p style={{ fontSize: '0.8rem', color: '#475569', margin: '0 0 6px 0' }}>
                  Base: <strong>{team.base_station}</strong> ({team.district}) • Strength: <strong>{team.personnel_count} Personnel</strong>
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '10px', fontSize: '0.76rem' }}>
                  <span style={{ color: '#64748b' }}>Cmdr: <strong>{team.commander_name}</strong></span>
                  <a
                    href={`tel:${team.contact_phone}`}
                    style={{
                      color: '#ea580c',
                      textDecoration: 'none',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Phone size={13} /> {team.contact_phone}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '24px'
        }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #fdba74',
            borderRadius: '16px',
            maxWidth: '600px',
            width: '100%',
            padding: '32px 36px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radio size={22} color="#ea580c" />
                <span>Broadcast Emergency Disaster Alert</span>
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleBroadcastSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Target Hotspot Station:</label>
                <select
                  value={selectedLocId}
                  onChange={(e) => setSelectedLocId(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px' }}
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name} ({loc.district}, {loc.state})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Alert Headline:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH FLOOD & IMMINENT DEBRIS FLOW WARNING"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Hydrological Trigger Description:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Continuous 24h rainfall exceeded 180mm threshold; pore pressure rising."
                  value={broadcastReason}
                  onChange={(e) => setBroadcastReason(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Standard Recommended Evacuation Action:</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. Immediate evacuation of toe-slope dwellings; mobilize SDRF."
                  value={broadcastAction}
                  onChange={(e) => setBroadcastAction(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowBroadcastModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBroadcast}
                  className="btn btn-primary"
                  style={{ padding: '10px 20px' }}
                >
                  {submittingBroadcast ? 'Broadcasting...' : 'Transmit Alert Across All Channels'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EarlyWarningPage;
