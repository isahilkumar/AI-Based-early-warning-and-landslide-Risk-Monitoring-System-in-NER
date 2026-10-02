import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Globe, 
  Layers, 
  Calendar, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  AlertOctagon, 
  ShieldAlert, 
  Download, 
  RefreshCw, 
  Sliders, 
  Eye, 
  Radio, 
  CheckCircle2, 
  Building2, 
  Navigation, 
  Info,
  Split,
  Radar,
  Mountain,
  Satellite
} from 'lucide-react';
import api from '../services/api';

// Map view controller helper
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

export const SatelliteChangeDetectionPage = ({ userRole = 'ADMIN' }) => {
  const [selectedCorridor, setSelectedCorridor] = useState('mangan');
  const [activeBand, setActiveBand] = useState('ndvi_diff');
  const [sliderPosition, setSliderPosition] = useState(50); // Split slider 0-100%
  const [satelliteData, setSatelliteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScarOverlays, setShowScarOverlays] = useState(true);
  const [dossierExporting, setDossierExporting] = useState(false);

  useEffect(() => {
    fetchSatelliteData(selectedCorridor, activeBand);
  }, [selectedCorridor, activeBand]);

  const fetchSatelliteData = async (corridor, band) => {
    setLoading(true);
    try {
      const data = await api.getSatelliteChangeDetection(corridor, band);
      setSatelliteData(data);
    } catch (err) {
      console.error('Error fetching satellite change detection data:', err);
    } finally {
      setLoading(false);
    }
  };

  const sector = satelliteData?.active_sector || {
    name: 'Mangan-Chungthang Valley Corridor',
    district: 'North Sikkim',
    state: 'Sikkim',
    center: [27.5028, 88.5322],
    pass_t0_date: '14 May 2026',
    pass_t0_label: 'Pre-Monsoon Baseline (Dry Canopy)',
    pass_t1_date: '29 September 2026',
    pass_t1_label: 'Post-Cloudburst Pass (Active Runoff)',
    canopy_loss_pct: -44.2,
    denuded_area_km2: 3.42,
    insar_displacement_mm: 178.5,
    insar_velocity_mm_yr: 215.0,
    coherence_loss: 0.82,
    water_moisture_surge_pct: 71.4,
    identified_scars_count: 5,
    ai_severity: 'CRITICAL',
    ai_risk_score: 94.6,
    scars_detected: [],
    affected_critical_assets: [],
    geotechnical_verdict: 'Active translational failure detected.'
  };

  const allSectors = satelliteData?.all_sectors || [
    { id: 'mangan', name: 'Mangan-Chungthang Corridor', state: 'Sikkim', severity: 'CRITICAL', risk_score: 94.6 },
    { id: 'tupul', name: 'Tupul / Noney Railway Cut', state: 'Manipur', severity: 'HIGH', risk_score: 87.2 },
    { id: 'haflong', name: 'Haflong - Jatinga Hill Saddle', state: 'Assam', severity: 'HIGH', risk_score: 79.8 },
    { id: 'sohra', name: 'Cherrapunji / Sohra Escarpment', state: 'Meghalaya', severity: 'HIGH', risk_score: 83.5 },
    { id: 'tawang', name: 'Tawang Pass - Sela Ridge', state: 'Arunachal Pradesh', severity: 'MEDIUM', risk_score: 74.0 },
    { id: 'kohima', name: 'Kohima - Zubza Bypass Flank', state: 'Nagaland', severity: 'HIGH', risk_score: 81.0 },
  ];

  const bandModes = [
    { id: 'ndvi_diff', name: '🌿 NDVI Difference Mask', desc: 'Canopy loss & soil exposure heatmap' },
    { id: 'insar_los', name: '⚡ Sentinel-1 InSAR LOS Displacement', desc: 'Interferometric millimeter creep fringes' },
    { id: 'false_color_nir', name: '🔴 False Color Infrared (B8-B4-B3)', desc: 'Vegetation stress & moisture channels' },
    { id: 'true_color_rgb', name: '🌍 True Color Optical (RGB 4-3-2)', desc: 'Natural visible spectrum observation' },
    { id: 'ndwi_water', name: '💧 NDWI Moisture Runoff Index', desc: 'Pore-water pooling & drainage paths' },
  ];

  const handleExportDossier = () => {
    setDossierExporting(true);
    setTimeout(() => {
      setDossierExporting(false);
      window.print();
    }, 800);
  };

  return (
    <div style={{ maxWidth: '1780px', margin: '0 auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 🛰️ Executive Satellite Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #111827 50%, #1e293b 100%)',
        borderRadius: '16px',
        padding: '24px 32px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 8px 30px rgba(15, 23, 42, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '950px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(56, 189, 248, 0.2)',
              color: '#38bdf8',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Satellite size={13} />
              COPERNICUS SENTINEL-1/2 + ISRO BHUVAN EO ENGINE
            </span>
            <span style={{ fontSize: '0.76rem', color: '#94a3b8', fontWeight: 600 }}>
              Multi-Temporal Earth Observation (10m Resolution)
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#f8fafc' }}>
            Satellite Multi-Temporal Change Detection & InSAR Creep Analysis
          </h1>

          <p style={{ fontSize: '0.92rem', color: '#cbd5e1', margin: '8px 0 0 0', lineHeight: '1.5' }}>
            Multi-spectral differential imaging and synthetic aperture radar (SAR) interferometry detecting pre-failure slope displacement, vegetation loss, and active fissure propagation across the North Eastern Region.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '12px', flexWrap: 'wrap', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8' }}>
              <Calendar size={14} color="#38bdf8" />
              <span>Baseline: <strong>{sector.pass_t0_date}</strong> (T0)</span>
            </div>
            <ArrowRight size={14} color="#ea580c" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f8fafc' }}>
              <Calendar size={14} color="#ef4444" />
              <span>Current Overflight: <strong>{sector.pass_t1_date}</strong> (T1)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: 700 }}>
              <Radar size={14} />
              <span>InSAR Coherence: <strong>{(sector.coherence_loss * 100).toFixed(0)}% Loss</strong></span>
            </div>
          </div>
        </div>

        {/* Sector Selector Pill Container */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <label style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            SELECT MONITORED NER SECTOR:
          </label>
          <select
            value={selectedCorridor}
            onChange={(e) => setSelectedCorridor(e.target.value)}
            style={{
              background: '#090d16',
              color: '#ffffff',
              border: '1px solid #38bdf8',
              borderRadius: '8px',
              padding: '9px 14px',
              fontSize: '0.86rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
              minWidth: '270px'
            }}
          >
            {allSectors.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.state}) — {s.severity}
              </option>
            ))}
          </select>
          <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>
            Elev: {sector.elevation}m ASL • Slope: {sector.slope}°
          </span>
        </div>
      </div>

      {/* 📊 Key Satellite Differential Indicators Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px'
      }}>
        {/* NDVI Vegetation Loss */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '16px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
            🌿 CANOPY NDVI LOSS (ΔNDVI)
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#dc2626', fontFamily: 'var(--font-heading)', margin: '4px 0' }}>
            {sector.canopy_loss_pct}%
          </div>
          <div style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 700 }}>
            {sector.denuded_area_km2} km² Denuded Soil Surface
          </div>
        </div>

        {/* InSAR Line of Sight Displacement */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '16px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
            ⚡ InSAR GROUND DISPLACEMENT
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ea580c', fontFamily: 'var(--font-heading)', margin: '4px 0' }}>
            {sector.insar_displacement_mm} mm
          </div>
          <div style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 700 }}>
            Velocity: {sector.insar_velocity_mm_yr} mm/year Active Creep
          </div>
        </div>

        {/* Moisture / NDWI Surge */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '16px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
            💧 PORE-WATER NDWI SURGE
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0284c7', fontFamily: 'var(--font-heading)', margin: '4px 0' }}>
            +{sector.water_moisture_surge_pct}%
          </div>
          <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 700 }}>
            Severe Subsurface Soil Saturation
          </div>
        </div>

        {/* Detected Tension Scars */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '16px 20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>
            ⚠️ DETECTED TENSION SCARS
          </span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#dc2626', fontFamily: 'var(--font-heading)', margin: '4px 0' }}>
            {sector.identified_scars_count} Scars
          </div>
          <div style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 800 }}>
            AI Verdict: {sector.ai_severity} HAZARD ({sector.ai_risk_score}%)
          </div>
        </div>
      </div>

      {/* 🎛️ Band Switcher & Interactive Controls Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '14px',
        padding: '14px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '2px' }}>
          <span style={{ fontSize: '0.76rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', whiteSpace: 'nowrap', paddingRight: '4px' }}>
            SPECTRAL BAND:
          </span>
          {bandModes.map(b => (
            <button
              key={b.id}
              onClick={() => setActiveBand(b.id)}
              style={{
                background: activeBand === b.id ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : '#f8fafc',
                color: activeBand === b.id ? '#ffffff' : '#334155',
                border: activeBand === b.id ? '1px solid #0284c7' : '1px solid #e2e8f0',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: activeBand === b.id ? 800 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
              title={b.desc}
            >
              {b.name}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setShowScarOverlays(!showScarOverlays)}
            style={{
              background: showScarOverlays ? '#fff7ed' : '#f8fafc',
              border: showScarOverlays ? '1px solid #ea580c' : '1px solid #e2e8f0',
              color: showScarOverlays ? '#ea580c' : '#64748b',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Layers size={14} />
            <span>{showScarOverlays ? 'Hide Scar Polygons' : 'Show Scar Polygons'}</span>
          </button>

          <button
            onClick={handleExportDossier}
            disabled={dossierExporting}
            className="btn btn-secondary"
            style={{
              padding: '6px 14px',
              fontSize: '0.76rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Download space agency multi-spectral change detection report"
          >
            <Download size={14} />
            <span>{dossierExporting ? 'Generating...' : 'Export EO Dossier'}</span>
          </button>
        </div>
      </div>

      {/* 🖼️ Main Section: Interactive Split-Slider Viewer (55%) & Scar Diagnostics / GIS Map (45%) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(500px, 1.2fr) minmax(400px, 0.8fr)', gap: '24px' }}>
        
        {/* LEFT: Multi-Temporal Swipe Comparison Box */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Card Top Title */}
          <div style={{
            background: '#090d16',
            color: '#ffffff',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.80rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
              <Split size={16} color="#38bdf8" />
              <span>INTERACTIVE MULTI-TEMPORAL SATELLITE SWIPE COMPARISON</span>
            </div>
            <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
              Drag slider below or hover to reveal temporal delta
            </span>
          </div>

          {/* Interactive Split Image Canvas */}
          <div style={{
            position: 'relative',
            height: '420px',
            background: '#0b1329',
            overflow: 'hidden',
            userSelect: 'none'
          }}>
            {/* Base Layer: Post-Event T1 Image (Current) with Simulated Change Detection Overlays */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: activeBand === 'ndvi_diff'
                ? 'radial-gradient(ellipse at 60% 45%, #991b1b 0%, #ea580c 35%, #065f46 70%, #047857 100%)'
                : (activeBand === 'insar_los'
                  ? 'repeating-radial-gradient(circle at 55% 45%, #ec4899 0, #8b5cf6 15px, #3b82f6 30px, #10b981 45px, #f59e0b 60px)'
                  : (activeBand === 'false_color_nir'
                    ? 'radial-gradient(circle at 50% 50%, #f43f5e 0%, #be123c 45%, #1e293b 80%)'
                    : (activeBand === 'ndwi_water'
                      ? 'radial-gradient(ellipse at 55% 48%, #0284c7 0%, #0369a1 40%, #334155 85%)'
                      : 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)'))),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {/* Simulated Satellite Terrain Texture */}
              <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.25,
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }} />

              {/* Identified Scar Fissure Overlay (Simulated) */}
              {showScarOverlays && (
                <div style={{
                  position: 'absolute',
                  top: '25%',
                  left: '42%',
                  width: '180px',
                  height: '140px',
                  border: '2px dashed #ef4444',
                  borderRadius: '35% 65% 55% 45% / 45% 35% 65% 55%',
                  background: 'rgba(239, 68, 68, 0.25)',
                  boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  pointerEvents: 'none',
                  animation: 'pulse 2s infinite'
                }}>
                  <div style={{ textAlign: 'center', background: 'rgba(0,0,0,0.7)', padding: '4px 8px', borderRadius: '6px' }}>
                    🚨 ACTIVE SCAR FISSURE<br />
                    <span style={{ fontSize: '0.62rem', color: '#fca5a5' }}>420m Detachment Scarp</span>
                  </div>
                </div>
              )}

              {/* Right Side Label */}
              <div style={{
                position: 'absolute',
                top: 16,
                right: 16,
                background: 'rgba(220, 38, 38, 0.85)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800
              }}>
                T1 PASS ({sector.pass_t1_date})
              </div>
            </div>

            {/* Top Layer: Pre-Event T0 Baseline Image (Clipped by Slider) */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${sliderPosition}%`,
              height: '100%',
              background: 'radial-gradient(ellipse at 50% 50%, #15803d 0%, #166534 50%, #14532d 100%)',
              overflow: 'hidden',
              borderRight: '3px solid #ffffff',
              boxShadow: '4px 0 15px rgba(0,0,0,0.5)'
            }}>
              {/* Intact Canopy Texture */}
              <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.15,
                backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)',
                backgroundSize: '12px 12px'
              }} />

              {/* Left Side Label */}
              <div style={{
                position: 'absolute',
                top: 16,
                left: 16,
                background: 'rgba(22, 163, 74, 0.85)',
                color: '#ffffff',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 800,
                whiteSpace: 'nowrap'
              }}>
                T0 BASELINE ({sector.pass_t0_date})
              </div>
            </div>

            {/* Draggable Vertical Slider Handle */}
            <div style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: `calc(${sliderPosition}% - 14px)`,
              width: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'ew-resize',
              zIndex: 10
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#ffffff',
                border: '2px solid #0284c7',
                boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                color: '#0284c7',
                fontWeight: 900
              }}>
                ⇄
              </div>
            </div>
          </div>

          {/* Slider Position Range Input Controller */}
          <div style={{ padding: '14px 22px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#16a34a', whiteSpace: 'nowrap' }}>
              ◀ T0 Baseline ({sector.pass_t0_date})
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0284c7' }}
            />
            <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#dc2626', whiteSpace: 'nowrap' }}>
              T1 Current ({sector.pass_t1_date}) ▶
            </span>
          </div>
        </div>

        {/* RIGHT: Scar Diagnostics & Geotechnical Verdict */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Identified Scars List Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '22px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Radar size={18} color="#ea580c" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Detected Landslide Scarp Inventory
                </h3>
              </div>
              <span className="badge badge-critical" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                {sector.scars_detected.length || 3} DETECTED SCARS
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '230px', overflowY: 'auto' }}>
              {(sector.scars_detected && sector.scars_detected.length > 0 ? sector.scars_detected : [
                { id: "SCAR-01", name: "Crown Tension Scarp (Upper Ridge)", length_m: 420, width_m: 85, depth_m: 12.4, displacement_rate: "18.2 mm/day", hazard: "Impending Major Detachment" },
                { id: "SCAR-02", name: "Toe Slump & Road Carriageway Severance", length_m: 290, width_m: 60, depth_m: 7.8, displacement_rate: "14.5 mm/day", hazard: "NH-10 Highway Blockage" },
                { id: "SCAR-03", name: "Active Debris Flow Fan into Teesta Tributary", length_m: 650, width_m: 120, depth_m: 5.2, displacement_rate: "Flowing Slurry", hazard: "River Damming Threat" }
              ]).map((scar, idx) => (
                <div
                  key={scar.id || idx}
                  style={{
                    background: '#f8fafc',
                    borderLeft: '4px solid #dc2626',
                    borderRadius: '0 8px 8px 0',
                    padding: '10px 14px',
                    fontSize: '0.78rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0f172a' }}>
                    <span>{scar.name}</span>
                    <span style={{ color: '#dc2626' }}>{scar.displacement_rate}</span>
                  </div>
                  <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '3px' }}>
                    Dimensions: {scar.length_m}m L × {scar.width_m}m W × {scar.depth_m}m D • Threat: <strong style={{ color: '#ea580c' }}>{scar.hazard}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Geotechnical AI Verdict & Critical Asset Threat */}
          <div style={{
            background: '#fff7ed',
            border: '1px solid #fdba74',
            borderRadius: '16px',
            padding: '20px 24px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldAlert size={18} color="#ea580c" />
              <strong style={{ fontSize: '0.84rem', color: '#ea580c' }}>
                EARTH OBSERVATION GEOTECHNICAL VERDICT
              </strong>
            </div>

            <p style={{ margin: 0, fontSize: '0.82rem', color: '#334155', lineHeight: '1.45' }}>
              <em>"{sector.geotechnical_verdict}"</em>
            </p>

            <div style={{ marginTop: '12px', borderTop: '1px solid #fed7aa', paddingTop: '10px' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0f172a' }}>
                EXPOSED CRITICAL ASSETS IN DIRECT SCARP PATH:
              </span>
              <ul style={{ margin: '6px 0 0 16px', fontSize: '0.74rem', color: '#475569', lineHeight: '1.4' }}>
                {(sector.affected_critical_assets || [
                  "National Highway NH-10 (Chungthang Link)",
                  "Teesta Valley Hydel Project Intake Canal",
                  "34 Downstream Village Dwellings"
                ]).map((asset, idx) => (
                  <li key={idx}><strong>{asset}</strong></li>
                ))}
              </ul>
            </div>
          </div>

        </div>

      </div>

      {/* 🗺️ Interactive GIS Sector Map Card */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 18px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          background: '#090d16',
          color: '#ffffff',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.80rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
            <Globe size={16} color="#38bdf8" />
            <span>GEO-REFERENCED SATELLITE RADAR ORBITAL PASS & GROUND ASSET MAP</span>
          </div>
          <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>
            Target: {sector.name} ({sector.district}, {sector.state})
          </span>
        </div>

        <div style={{ height: '340px', width: '100%' }}>
          <MapContainer
            center={sector.center || [27.5028, 88.5322]}
            zoom={12}
            style={{ width: '100%', height: '100%' }}
          >
            <ChangeMapView center={sector.center} zoom={12} />
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="Tiles &copy; Esri &mdash; High-Res Satellite Imagery"
            />

            {/* Monitored Sector Focal Marker */}
            <Marker position={sector.center || [27.5028, 88.5322]}>
              <Popup>
                <div style={{ color: '#0f172a', padding: '4px' }}>
                  <strong>{sector.name}</strong>
                  <div>{sector.district}, {sector.state}</div>
                  <div style={{ color: '#dc2626', fontWeight: 800, marginTop: '4px' }}>
                    InSAR Velocity: {sector.insar_velocity_mm_yr} mm/yr ({sector.ai_severity})
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* InSAR Deformation Buffer Ring */}
            <Circle
              center={sector.center || [27.5028, 88.5322]}
              radius={3500}
              pathOptions={{
                color: '#dc2626',
                fillColor: '#dc2626',
                fillOpacity: 0.22,
                weight: 2,
                dashArray: '6, 6'
              }}
            >
              <Tooltip sticky>
                🔴 Active InSAR Deformation Footprint ({sector.denuded_area_km2} km²)
              </Tooltip>
            </Circle>
          </MapContainer>
        </div>
      </div>

    </div>
  );
};

export default SatelliteChangeDetectionPage;
