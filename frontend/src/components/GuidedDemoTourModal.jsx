import React, { useState, useEffect } from 'react';
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  CloudRain, 
  Brain, 
  Layers, 
  Sparkles, 
  Sliders, 
  Users, 
  BellRing, 
  Navigation, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Play
} from 'lucide-react';

export const GuidedDemoTourModal = ({ isOpen = false, onClose, onNavigateTab, onSelectStation }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      step: 1,
      id: 'select_location',
      tabId: 'map',
      title: '1. Select Vulnerable Hotspot Location',
      badge: 'GIS HOTSPOT SELECTION',
      icon: MapPin,
      color: '#ea580c',
      summary: 'Operator selects an active monitoring node in the North Eastern Region.',
      details: [
        'Selected Node: Mangan-Chungthang Valley Corridor (North Sikkim)',
        'Coordinates: 27.5028° N, 88.5284° E • Elevation: 1,310m ASL',
        'Geological Setting: Fragile Foliated Schist / Weak Phyllite Bedrock (Index 5)',
        'Road Proximity: NH-310 Ghat Highway cut along toe of vulnerable slope (25m)'
      ],
      callout: '37 Telemetry Stations monitored continuously across all 8 NER states.'
    },
    {
      step: 2,
      id: 'view_conditions',
      tabId: 'map',
      title: '2. Ingest Near-Real-Time (NRT) Hydro Telemetry',
      badge: '15-MIN NRT TELEMETRY',
      icon: CloudRain,
      color: '#0284c7',
      summary: 'Automatic Weather Station (AWS) sensors report acute hydrologic buildup.',
      details: [
        '24-Hour Antecedent Precipitation: 145.6 mm (Severe Monsoon Threshold)',
        '72-Hour Cumulative Rainfall: 312.0 mm (Deep pore-water saturation)',
        'Volumetric Soil Moisture: 78.4% (Critical threshold: >75%)',
        'Pore Water Pressure: 28.4 kPa (Active effective stress reduction)'
      ],
      callout: 'Ingested via IMD AWS API on an audited 15-minute near-real-time polling cadence.'
    },
    {
      step: 3,
      id: 'ai_predict',
      tabId: 'benchmark',
      title: '3. Machine Learning Landslide Susceptibility Inference',
      badge: 'ML VALIDATION (94.2% ACC)',
      icon: Brain,
      color: '#dc2626',
      summary: 'Trained Gradient Boosting model evaluates 15 geotechnical variables.',
      details: [
        'Calculated Hazard Probability: 92.4% (CRITICAL FAILURE RISK)',
        'Inference Execution Latency: 1.2 milliseconds per sample',
        'Safety-Critical Recall: 95.40% (Minimizes fatal false negatives)',
        'Harmonic F1-Score: 94.25% • ROC-AUC: 0.9788'
      ],
      callout: 'Validated on 14,850 GSI-NLSM calibrated historical slope records.'
    },
    {
      step: 4,
      id: 'gis_map',
      tabId: 'map',
      title: '4. GIS Displays Spatial Hazard Danger Perimeter',
      badge: 'SPATIAL GIS MAPPING',
      icon: Layers,
      color: '#ea580c',
      summary: 'Dynamic danger buffer cone and at-risk infrastructure rendered on map.',
      details: [
        'Calculated Hazard Radius: 4.6 km radius danger zone around Mangan Ridge',
        'Terrain Slope Gradient: 42° Steep Scarp face',
        'At-Risk Highway Corridors: NH-310 and Dikchu River bypass flank',
        'Multi-Layer Overlays: Safe Green Routes, Emergency Hospitals, and Shelters'
      ],
      callout: 'Rendered at 60 FPS via WebGL-accelerated Leaflet vector canvas.'
    },
    {
      step: 5,
      id: 'explain_xai',
      tabId: 'map',
      title: '5. Explainable AI (TreeSHAP Factor Decomposition)',
      badge: 'EXPLAINABLE AI (XAI)',
      icon: Sparkles,
      color: '#ea580c',
      summary: 'Auditable mathematical breakdown explaining why the AI predicted high risk.',
      details: [
        '+18.4% Surge Contribution: 24-hour rainfall intensity (145.6 mm breach)',
        '+14.2% Geomorphic Push: Steep 42° slope angle exceeding angle of repose',
        '+9.1% Lithological Weakness: Foliated Schist bedrock formation',
        '+6.2% Anthropogenic Factor: Toe road cut within 25m of slope base'
      ],
      callout: 'TreeSHAP additive attribution provides legally defensible decision-support.'
    },
    {
      step: 6,
      id: 'what_if_sim',
      tabId: 'simulator',
      title: '6. Landslide Digital Twin & What-If Stress Testing',
      badge: 'SCENARIO SIMULATION',
      icon: Sliders,
      color: '#ea580c',
      summary: 'Virtual twin stress-test answers: “What could happen if conditions worsen?”',
      details: [
        'User Simulates Cloudburst Surge: Rainfall increases from 145mm → 220mm/24h',
        'Soil Moisture Sim: Increased to 92% (Pore liquefaction threshold)',
        'Simulated AI Risk Surge: Climbs from 92.4% → 97.8% CRITICAL',
        '3x3 Micro-Terrain Grid: Quadrants transition from Yellow Watch → Red Emergency'
      ],
      callout: '“Don’t just predict landslides—simulate the risk before it happens.”'
    },
    {
      step: 7,
      id: 'exposure_analysis',
      tabId: 'simulator',
      title: '7. Population & Critical Infrastructure Exposure Analysis',
      badge: 'EXPOSURE QUANTIFICATION',
      icon: Users,
      color: '#dc2626',
      summary: 'Dynamic quantification of human lives and public assets in danger path.',
      details: [
        'Potentially Exposed Citizens: 11,605 residents in danger cone (+5,845 delta)',
        'Denuded Hazard Footprint: 4.6 km² expanded catchment area',
        'At-Risk Public Infrastructure: 3 Roads, 4 Schools, 2 Civil Hospitals',
        'Emergency Facilities Active: 3 Disaster Relief Shelters with 650 bed capacity'
      ],
      callout: 'Enables targeted district evacuation orders rather than blanket lockdowns.'
    },
    {
      step: 8,
      id: 'early_warning',
      tabId: 'alerts',
      title: '8. Multi-Agency Early Warning Bulletin Generation',
      badge: 'EMERGENCY DISPATCH',
      icon: BellRing,
      color: '#dc2626',
      summary: 'Automated CAP alert dispatch to District DM, NDRF, and State SEOC.',
      details: [
        'Disaster Alert Code: ALR-NER-SK_02 (IMD Severe Rainfall Threshold Breach)',
        'Multi-Channel Dispatch: Automated SMS broadcast & SEOC Command Dashboard',
        'Assigned Response Battalion: NDRF 12th Battalion (HQ Itanagar/Gangtok Unit)',
        'Duty Officer Acknowledgment: One-click digital incident logging'
      ],
      callout: 'Dispatched in 35 milliseconds via automated background broadcast queue.'
    },
    {
      step: 9,
      id: 'safe_routes',
      tabId: 'evacuation',
      title: '9. Actionable Evacuation Routing & Safe Shelter Allocation',
      badge: 'LOGISTICS & SHELTER',
      icon: Navigation,
      color: '#16a34a',
      summary: 'Dynamic road clearance routing directing citizens around blocked corridors.',
      details: [
        'Hazard Corridor Blocked: NH-310 Main Carriageway (Active Debris Runoff)',
        'Recommended Green Route: Dikchu-Singtam Ridge Bypass (14.2 km, +18 min detour)',
        'Nearest Emergency Hospital: Dikchu Sub-Divisional Hospital (6.2 km, 45 Beds)',
        'Staging Shelter Camp: Mangan Community High Shelter (4.8 km, 200 Capacity)'
      ],
      callout: 'Completes the chain: Data → ML → GIS → Explainability → Warning → Useful Response.'
    }
  ];

  const current = steps[currentStep];
  const StepIcon = current.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleJumpToLive = (tabId) => {
    if (onNavigateTab) {
      onNavigateTab(tabId);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(9, 13, 22, 0.75)',
      backdropFilter: 'blur(8px)',
      zIndex: 2500,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '920px',
        background: '#ffffff',
        borderRadius: '18px',
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
        border: '1px solid rgba(234, 88, 12, 0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header Ribbon */}
        <div style={{
          background: '#090d16',
          color: '#ffffff',
          padding: '16px 28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              background: 'rgba(234, 88, 12, 0.25)',
              color: '#fb923c',
              border: '1px solid rgba(234, 88, 12, 0.5)',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '0.68rem',
              fontWeight: 800
            }}>
              🎯 GUIDED PRESENTATION TOUR
            </span>
            <strong style={{ fontSize: '0.95rem' }}>
              LANDSAFE-NER Complete End-to-End Decision Flow
            </strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'var(--font-mono)' }}>
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#cbd5e1',
                padding: '6px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Step Progression Timeline Bar */}
        <div style={{
          display: 'flex',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '8px 28px',
          gap: '4px',
          overflowX: 'auto'
        }}>
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentStep(idx)}
              style={{
                background: currentStep === idx ? '#ea580c' : (idx < currentStep ? '#fed7aa' : '#e2e8f0'),
                color: currentStep === idx ? '#ffffff' : (idx < currentStep ? '#9a3412' : '#64748b'),
                border: 'none',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.68rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {s.step}. {s.title.split('.')[1]?.trim().split(' ')[0] || s.step}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Active Step Card */}
          <div style={{
            background: '#fff7ed',
            border: `2px solid ${current.color}`,
            borderRadius: '14px',
            padding: '22px 26px',
            boxShadow: `0 4px 20px ${current.color}15`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: current.color,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: `0 3px 10px ${current.color}44`
                }}>
                  <StepIcon size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: current.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {current.badge}
                  </span>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', margin: '2px 0 0 0' }}>
                    {current.title}
                  </h2>
                </div>
              </div>

              <button
                onClick={() => handleJumpToLive(current.tabId)}
                className="btn btn-primary"
                style={{
                  padding: '7px 14px',
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                title="Navigate directly to this live interactive view on LANDSAFE-NER"
              >
                <span>Jump to Live View</span>
                <ExternalLink size={13} />
              </button>
            </div>

            <p style={{ fontSize: '0.92rem', color: '#334155', margin: '0 0 16px 0', fontWeight: 600 }}>
              {current.summary}
            </p>

            {/* Bullet Point Metrics */}
            <div style={{
              background: '#ffffff',
              borderRadius: '10px',
              border: '1px solid #fed7aa',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {current.details.map((d, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.84rem', color: '#1e293b' }}>
                  <CheckCircle2 size={16} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{d}</span>
                </div>
              ))}
            </div>

            <div style={{
              marginTop: '14px',
              fontSize: '0.78rem',
              color: '#9a3412',
              fontWeight: 700,
              background: 'rgba(234, 88, 12, 0.1)',
              padding: '8px 14px',
              borderRadius: '6px'
            }}>
              💡 <strong>System Rigor:</strong> {current.callout}
            </div>
          </div>
        </div>

        {/* Footer Navigation Buttons */}
        <div style={{
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="btn btn-secondary"
            style={{
              opacity: currentStep === 0 ? 0.5 : 1,
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ChevronLeft size={16} />
            <span>Previous Step</span>
          </button>

          <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
            Architecture Flow: <strong style={{ color: '#0f172a' }}>Data (NRT) → ML (94.2%) → GIS → XAI → Digital Twin → Warning → Safe Routes</strong>
          </div>

          {currentStep < steps.length - 1 ? (
            <button
              onClick={handleNext}
              className="btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>Next Step ({currentStep + 2})</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', border: 'none' }}
            >
              <span>Complete Tour ✓</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuidedDemoTourModal;
