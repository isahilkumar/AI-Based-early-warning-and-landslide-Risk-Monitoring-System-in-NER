import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Sliders, 
  BellRing, 
  BarChart3, 
  Cpu, 
  PhoneCall, 
  RefreshCw, 
  FileText,
  Clock,
  ExternalLink,
  Camera,
  Navigation,
  Radio,
  Sparkles
} from 'lucide-react';

export const Navbar = ({ 
  activeTab, 
  setActiveTab, 
  activeAlertCount = 0, 
  onRefreshTelemetry, 
  refreshing = false,
  soundEnabled = false,
  setSoundEnabled,
  onOpenExportModal,
  onOpenTourModal,
  userRole = 'ADMIN',
  setUserRole
}) => {
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'map', label: 'GIS Map', icon: MapPin },
    { id: 'citizen-reports', label: 'Vision AI', icon: Camera, badge: 'AI' },
    { id: 'evacuation', label: 'Safe Routes', icon: Navigation },
    { id: 'simulator', label: 'Digital Twin', icon: Sliders, badge: 'SIM' },
    { id: 'alerts', label: 'Alerts', icon: BellRing, alertCount: activeAlertCount },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'benchmark', label: 'Performance', icon: Cpu, badge: 'ML' },
    { id: 'advisory', label: 'Advisory', icon: PhoneCall },
  ];

  const roleOptions = [
    { id: 'ADMIN', label: '🛡️ SDMA Admin' },
    { id: 'DISTRICT', label: '🏛️ District DM' },
    { id: 'FIELD_QRT', label: '🚒 Field QRT' },
    { id: 'CITIZEN', label: '👤 Citizen' },
  ];

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: '#ffffff',
      borderBottom: '1px solid rgba(234, 88, 12, 0.22)',
      boxShadow: '0 4px 20px -2px rgba(234, 88, 12, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)'
    }}>
      {/* Top Status Bar: High-End Executive Command Ribbon */}
      <div className="navbar-top-ribbon" style={{
        background: '#090d16',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 24px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.72rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        color: '#94a3b8'
      }}>
        {/* Left: Authority Brand & Region Nodes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexShrink: 0 }}>
            <span style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: activeAlertCount > 0 ? '#ef4444' : '#10b981',
              boxShadow: activeAlertCount > 0 ? '0 0 10px #ef4444, 0 0 4px #ef4444' : '0 0 8px #10b981',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }} />
            <strong style={{ color: '#f8fafc', letterSpacing: '0.05em', fontSize: '0.72rem', fontWeight: 800 }}>
              LANDSAFE-NER
            </strong>
            <span style={{
              background: 'rgba(234, 88, 12, 0.18)',
              color: '#fb923c',
              border: '1px solid rgba(234, 88, 12, 0.35)',
              padding: '1px 6px',
              borderRadius: '4px',
              fontSize: '0.60rem',
              fontWeight: 800,
              letterSpacing: '0.04em'
            }}>
              DISASTER INTELLIGENCE
            </span>
          </div>

          <span style={{ color: 'rgba(255, 255, 255, 0.15)' }}>•</span>

          <span style={{ color: '#94a3b8', fontSize: '0.70rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Coverage: <strong style={{ color: '#e2e8f0', fontWeight: 600 }}>8 NER States</strong> (Sikkim, Assam, Meghalaya, Arunachal, Nagaland, Manipur, Mizoram, Tripura)
          </span>
        </div>

        {/* Right: Live Telemetry Status Indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Guided Tour Trigger Button */}
          {onOpenTourModal && (
            <button
              onClick={onOpenTourModal}
              style={{
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '2px 9px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(234, 88, 12, 0.4)',
                transition: 'all 0.15s ease'
              }}
              title="Launch Guided Presentation Tour of the complete decision pipeline"
            >
              <Sparkles size={11} />
              <span>Guided Tour</span>
            </button>
          )}

          {/* Live System Time */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            color: '#cbd5e1',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.70rem',
            fontWeight: 600,
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '2px 8px',
            borderRadius: '4px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <Clock size={11} color="#ea580c" />
            <span>{timeString || 'LIVE'}</span>
          </div>

          {/* Active Alert Pill (Interactive) */}
          {activeAlertCount > 0 ? (
            <button
              onClick={() => setActiveTab('alerts')}
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                color: '#ffffff',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.68rem',
                padding: '2px 9px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 0 10px rgba(220, 38, 38, 0.45)',
                transition: 'all 0.15s ease'
              }}
              title="Click to inspect all active early warning alerts"
            >
              <Radio size={11} className="animate-spin" />
              <span>{activeAlertCount} CRITICAL ALERTS</span>
            </button>
          ) : (
            <span style={{
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontWeight: 700,
              fontSize: '0.68rem',
              padding: '2px 8px',
              borderRadius: '999px'
            }}>
              🟢 ALL 37 STATIONS NOMINAL
            </span>
          )}

          {/* API Portal Link */}
          <a 
            href="http://127.0.0.1:8000/" 
            target="_blank" 
            rel="noreferrer" 
            style={{ 
              color: '#f97316', 
              textDecoration: 'none', 
              fontSize: '0.68rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px',
              background: 'rgba(234, 88, 12, 0.12)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(234, 88, 12, 0.3)',
              fontWeight: 700,
              transition: 'all 0.15s ease'
            }}
            title="Open Django REST Framework API Portal"
          >
            <span>REST API</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>


      {/* Main Navbar Header: Clean Single-Line Layout */}
      <div className="navbar-header-row" style={{
        maxWidth: '1760px',
        margin: '0 auto',
        padding: '0 24px',
        height: '62px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        whiteSpace: 'nowrap'
      }}>
        {/* Brand Logo & Title (Left) */}
        <div 
          onClick={() => setActiveTab('map')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            cursor: 'pointer',
            userSelect: 'none',
            flexShrink: 0
          }}
        >
          <div style={{
            position: 'relative',
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.28)',
            flexShrink: 0
          }}>
            <ShieldAlert size={20} color="#ffffff" />
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              border: '2px solid #ffffff'
            }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ 
                fontFamily: 'var(--font-heading)', 
                fontSize: '1.18rem', 
                fontWeight: 900, 
                letterSpacing: '-0.02em',
                color: '#0f172a',
                whiteSpace: 'nowrap'
              }}>
                LANDSAFE<span style={{ color: '#ea580c' }}>-NER</span>
              </span>
              <span style={{
                background: '#fff7ed',
                color: '#ea580c',
                border: '1px solid #fdba74',
                padding: '1px 5px',
                borderRadius: '4px',
                fontSize: '0.60rem',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                AI+GIS
              </span>
            </div>
            <span className="navbar-tagline">
              Don't just predict landslides—simulate the risk before it happens.
            </span>
          </div>
        </div>

        {/* Navigation Tabs (Center, Compact & Polished) */}
        <nav className="nav-tabs-container" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2px',
          flex: 1,
          justifyContent: 'center',
          padding: '0 2px'
        }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 7px',
                  borderRadius: '6px',
                  border: isActive ? '1px solid #fdba74' : '1px solid transparent',
                  background: isActive ? '#fff7ed' : 'transparent',
                  color: isActive ? '#ea580c' : '#475569',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.73rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                <Icon size={13} color={isActive ? '#ea580c' : '#64748b'} />
                <span>{item.label}</span>

                {item.badge && (
                  <span style={{
                    fontSize: '0.54rem',
                    background: isActive ? '#ea580c' : '#fed7aa',
                    color: isActive ? '#ffffff' : '#9a3412',
                    padding: '1px 3px',
                    borderRadius: '3px',
                    fontWeight: 800
                  }}>
                    {item.badge}
                  </span>
                )}

                {item.alertCount > 0 && (
                  <span style={{
                    fontSize: '0.58rem',
                    background: '#dc2626',
                    color: '#ffffff',
                    padding: '1px 4px',
                    borderRadius: '999px',
                    fontWeight: 800
                  }}>
                    {item.alertCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>


        {/* Action Controls & Role Switcher (Right) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Multi-tier Authority Role Switcher */}
          <div style={{ position: 'relative' }}>
            <select
              value={userRole}
              onChange={(e) => setUserRole(e.target.value)}
              style={{
                background: '#fff7ed',
                color: '#ea580c',
                border: '1px solid #fdba74',
                borderRadius: '7px',
                padding: '6px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                cursor: 'pointer',
                outline: 'none',
                maxWidth: '160px'
              }}
              title="Switch Operating Perspective (Disaster Command Role)"
            >
              {roleOptions.map(r => (
                <option key={r.id} value={r.id} style={{ background: '#ffffff', color: '#0f172a' }}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export Official Bulletin Button */}
          <button
            onClick={onOpenExportModal}
            className="btn btn-secondary"
            style={{
              padding: '6px 11px',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 700
            }}
            title="Download/Print Official Disaster Management Advisory Bulletin"
          >
            <FileText size={13} color="#ea580c" />
            <span>Bulletin</span>
          </button>

          {/* Sync Telemetry Button */}
          <button
            onClick={onRefreshTelemetry}
            disabled={refreshing}
            className="btn btn-primary"
            style={{
              padding: '6px 13px',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              fontWeight: 700
            }}
            title="Trigger dynamic atmospheric weather update across all NER stations"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

