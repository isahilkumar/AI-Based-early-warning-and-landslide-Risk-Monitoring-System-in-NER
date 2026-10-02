import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Tooltip, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Sliders, 
  RotateCcw, 
  CloudRain, 
  Mountain, 
  Droplets, 
  Layers, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  ShieldCheck, 
  CheckCircle,
  Activity,
  Trees,
  Compass,
  AlertOctagon,
  Sparkles,
  Building2,
  Navigation,
  RefreshCw,
  Users,
  MapPin,
  Flame,
  ArrowRight,
  ShieldAlert,
  Thermometer,
  Radio,
  Eye,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

// Helper component to center Leaflet Map when base location changes
const ChangeMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

export const WhatIfSimulatorPage = ({ initialStation = null, preloadedStation = null, userRole = 'ADMIN' }) => {
  const currentStation = preloadedStation || initialStation;
  const [locations, setLocations] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(currentStation?.code?.toLowerCase() || 'sk_01');
  
  // Simulator Parameters State
  const [rainfall24h, setRainfall24h] = useState(150);
  const [soilMoisture, setSoilMoisture] = useState(70);
  const [temperature, setTemperature] = useState(24);
  const [slope, setSlope] = useState(32);
  const [elevation, setElevation] = useState(1650);
  const [landCover, setLandCover] = useState(1);
  const [geology, setGeology] = useState(4);
  const [distanceFault, setDistanceFault] = useState(4.2);
  const [distanceRoadCut, setDistanceRoadCut] = useState(40);

  // Active Scenario Preset Name
  const [activePreset, setActivePreset] = useState('custom');

  // Simulation output results
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // GIS Simulation Map Controls
  const [mapMode, setMapMode] = useState('simulated'); // 'simulated' | 'baseline'
  const [showInfrastructure, setShowInfrastructure] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showHazardCone, setShowHazardCone] = useState(true);

  const landCoverOptions = [
    { code: 0, label: 'Dense Forest / Strong Root Cohesion (NDVI: 0.75)' },
    { code: 1, label: 'Shrubland / Degraded Forest (NDVI: 0.48)' },
    { code: 2, label: 'Terraced Hill Agriculture (NDVI: 0.42)' },
    { code: 3, label: 'Built-up / Urban Slope Settlement (NDVI: 0.18)' },
    { code: 4, label: 'Barren / Road Toe Cut Excavation (NDVI: 0.08)' }
  ];

  const geologyOptions = [
    { code: 0, label: 'Alluvium (Valley Plains - High Resistance)' },
    { code: 1, label: 'Massive Quartzite (High Strength Bedrock)' },
    { code: 2, label: 'Granite Gneiss (Moderate Strength)' },
    { code: 3, label: 'Limestone / Karst Formation' },
    { code: 4, label: 'Weathered Sandstone & Shale (Prone)' },
    { code: 5, label: 'Foliated Schist / Weak Phyllite (Fragile Bedrock)' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [locs, facs, rts] = await Promise.all([
        api.getLocations(),
        api.getEmergencyFacilities(),
        api.getSafeRoutes()
      ]);
      setLocations(locs);
      setFacilities(facs);
      setRoutes(rts);

      if (currentStation) {
        syncWithStation(currentStation);
      } else if (locs.length > 0) {
        syncWithStation(locs[0]);
      }
    } catch (err) {
      console.error('Error fetching simulator data:', err);
    }
  };

  const syncWithStation = (loc) => {
    if (!loc) return;
    const code = (loc.code || 'sk_01').toLowerCase();
    setSelectedStationId(code);
    setSlope(loc.slope || 32);
    setElevation(loc.elevation || 1650);
    setGeology(loc.geology_code ?? 4);
    setLandCover(loc.land_cover_code ?? 1);
    setDistanceFault(loc.distance_to_fault_km || 4.2);
    setDistanceRoadCut(loc.distance_to_road_cut_m || 40);
    const rain = loc.latest_reading?.rainfall_24h || 120;
    setRainfall24h(rain);
    setSoilMoisture(loc.latest_reading?.soil_moisture || 62);
    setTemperature(loc.latest_reading?.temperature || 22);
  };

  const handleStationChange = (code) => {
    setSelectedStationId(code);
    const found = locations.find(l => (l.code || '').toLowerCase() === code.toLowerCase());
    if (found) {
      syncWithStation(found);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [rainfall24h, slope, soilMoisture, temperature, elevation, landCover, geology, distanceFault, distanceRoadCut, selectedStationId]);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const sim = await api.simulateWhatIf(selectedStationId, {
        rainfall_24h: Number(rainfall24h),
        rainfall_72h: Number(rainfall24h) * 2.3,
        slope: Number(slope),
        elevation: Number(elevation),
        soil_moisture: Number(soilMoisture),
        temperature: Number(temperature),
        land_cover_code: Number(landCover),
        geology_code: Number(geology),
        distance_to_fault_km: Number(distanceFault),
        distance_to_road_cut_m: Number(distanceRoadCut)
      });
      setSimulationResult(sim);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (presetType) => {
    setActivePreset(presetType);
    if (presetType === 'heavy_rain') {
      setRainfall24h(140);
      setSoilMoisture(68);
      setTemperature(21);
    } else if (presetType === 'extreme_cloudburst') {
      setRainfall24h(220);
      setSoilMoisture(92);
      setTemperature(18);
    } else if (presetType === 'high_moisture') {
      setRainfall24h(110);
      setSoilMoisture(88);
      setTemperature(23);
    } else if (presetType === 'slope_instability') {
      setSlope(48);
      setLandCover(4);
      setDistanceRoadCut(15);
      setRainfall24h(130);
      setSoilMoisture(76);
      setGeology(5);
    } else if (presetType === 'dry_baseline') {
      setRainfall24h(15);
      setSoilMoisture(25);
      setTemperature(26);
    }
  };

  const currentStationObj = useMemo(() => {
    return locations.find(l => (l.code || '').toLowerCase() === selectedStationId.toLowerCase()) || locations[0] || {
      name: 'Gangtok Ridge',
      district: 'East Sikkim',
      state: 'Sikkim',
      latitude: 27.3389,
      longitude: 88.6065
    };
  }, [locations, selectedStationId]);

  const scenario = simulationResult?.scenario || {
    risk_percentage: 78.0,
    risk_level: 'HIGH',
    risk_color: '#ea580c',
    risk_badge: '🟠 HIGH',
    status: 'Simulated Hazard Surge'
  };

  const baseline = simulationResult?.baseline || {
    risk_percentage: 48.0,
    risk_level: 'MEDIUM',
    risk_color: '#d97706',
    risk_badge: '🟡 MEDIUM'
  };

  const delta = simulationResult?.delta_percentage ?? 30.0;
  const isCritical = scenario.risk_percentage >= 80;
  const isHigh = scenario.risk_percentage >= 65;

  const impactMetrics = simulationResult?.impact_metrics || {
    affected_area_km2: { baseline: 1.8, simulated: 3.4, delta: 1.6 },
    exposed_population: { baseline: 4200, simulated: 9850, delta: 5650 },
    infrastructure_exposure: {
      roads_affected_count: 2,
      schools_affected_count: 3,
      hospitals_affected_count: 2,
      shelters_active_count: 3
    }
  };

  const beforeMatrix = simulationResult?.terrain_matrix?.before_grid || [
    { badge: '🟢', color: '#16a34a', val: 24 },
    { badge: '🟢', color: '#16a34a', val: 32 },
    { badge: '🟡', color: '#d97706', val: 48 },
    { badge: '🟢', color: '#16a34a', val: 28 },
    { badge: '🟡', color: '#d97706', val: 52 },
    { badge: '🟡', color: '#d97706', val: 58 },
    { badge: '🟡', color: '#d97706', val: 42 },
    { badge: '🟡', color: '#d97706', val: 54 },
    { badge: '🟠', color: '#ea580c', val: 66 },
  ];

  const afterMatrix = simulationResult?.terrain_matrix?.after_grid || [
    { badge: '🟡', color: '#d97706', val: 56 },
    { badge: '🟠', color: '#ea580c', val: 72 },
    { badge: '🔴', color: '#dc2626', val: 88 },
    { badge: '🟠', color: '#ea580c', val: 68 },
    { badge: '🔴', color: '#dc2626', val: 86 },
    { badge: '🔴', color: '#dc2626', val: 94 },
    { badge: '🔴', color: '#dc2626', val: 82 },
    { badge: '🔴', color: '#dc2626', val: 91 },
    { badge: '🔴', color: '#dc2626', val: 97 },
  ];

  // Dynamic simulation radius (meters) based on risk percentage
  const simRadiusMeters = Math.min(18000, Math.round(3000 + (scenario.risk_percentage / 100) * 11000));
  const baseRadiusMeters = Math.min(10000, Math.round(2500 + (baseline.risk_percentage / 100) * 5000));

  // Custom facility icons for Leaflet
  const createMapIcon = (emoji, bg) => L.divIcon({
    className: 'sim-custom-icon',
    html: `<div style="
      background: ${bg};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      border: 2px solid #ffffff;
    ">${emoji}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });

  return (
    <div style={{ maxWidth: '1780px', margin: '0 auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 🌟 Master Header & Tagline Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #1e293b 100%)',
        borderRadius: '16px',
        padding: '24px 32px',
        color: '#ffffff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 8px 30px rgba(15, 23, 42, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div style={{ maxWidth: '900px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              background: 'rgba(234, 88, 12, 0.25)',
              color: '#fb923c',
              border: '1px solid rgba(234, 88, 12, 0.5)',
              padding: '3px 10px',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 800,
              letterSpacing: '0.04em'
            }}>
              💡 NEW CAPABILITY • DIGITAL TWIN & WHAT-IF ENGINE
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
              Scenario Analysis & Decision-Support Layer
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', color: '#f8fafc' }}>
            Landslide Digital Twin + What-If Scenario Simulator
          </h1>

          <p style={{ fontSize: '0.95rem', color: '#cbd5e1', margin: '8px 0 0 0', lineHeight: '1.5' }}>
            <em>“Don't just predict landslides—simulate the risk before it happens.”</em>
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#94a3b8' }}>
              <span style={{ color: '#60a5fa', fontWeight: 700 }}>Telemetry Question:</span>
              <span style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '4px' }}>“What is the risk now?”</span>
            </div>
            <ArrowRight size={14} color="#ea580c" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#f8fafc' }}>
              <span style={{ color: '#fb923c', fontWeight: 800 }}>Digital Twin Answers:</span>
              <span style={{ background: 'rgba(234, 88, 12, 0.2)', color: '#fdba74', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                “What could happen if environmental conditions change?”
              </span>
            </div>
          </div>
        </div>

        {/* Base Area Selector */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '12px',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}>
          <label style={{ fontSize: '0.74rem', color: '#fb923c', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Target Virtual Twin Area:
          </label>
          <select
            value={selectedStationId}
            onChange={(e) => handleStationChange(e.target.value)}
            style={{
              background: '#090d16',
              color: '#ffffff',
              border: '1px solid rgba(234, 88, 12, 0.5)',
              borderRadius: '8px',
              padding: '8px 14px',
              fontSize: '0.86rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer',
              minWidth: '260px'
            }}
          >
            {locations.map(loc => (
              <option key={loc.id} value={(loc.code || '').toLowerCase()}>
                {loc.name} — {loc.district}, {loc.state}
              </option>
            ))}
          </select>
          <span style={{ fontSize: '0.70rem', color: '#94a3b8' }}>
            Lat: {currentStationObj.latitude?.toFixed(4)}, Lng: {currentStationObj.longitude?.toFixed(4)}
          </span>
        </div>
      </div>

      {/* ⚡ Scenario Presets Bar */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={18} color="#ea580c" />
          <span style={{ fontSize: '0.82rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            SCENARIO PRESETS:
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'heavy_rain', label: '☔ Heavy Rainfall (140mm)' },
            { id: 'extreme_cloudburst', label: '🌧️ Extreme Cloudburst (220mm)' },
            { id: 'high_moisture', label: '🌍 High Soil-Moisture (88%)' },
            { id: 'slope_instability', label: '⛰️ Slope Cut & Instability' },
            { id: 'dry_baseline', label: '☀️ Dry Winter Baseline (15mm)' }
          ].map(p => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              style={{
                background: activePreset === p.id ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : '#f8fafc',
                color: activePreset === p.id ? '#ffffff' : '#334155',
                border: activePreset === p.id ? '1px solid #ea580c' : '1px solid #e2e8f0',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: activePreset === p.id ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {p.label}
            </button>
          ))}
          <button
            onClick={() => syncWithStation(currentStationObj)}
            style={{
              background: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Reset parameters to actual live station sensor values"
          >
            <RotateCcw size={13} /> Reset Live
          </button>
        </div>
      </div>

      {/* 📊 High-Level Impact & Comparison Summary Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '16px'
      }}>
        {/* Risk Comparison Card */}
        <div style={{
          background: '#ffffff',
          border: `2px solid ${scenario.risk_color}`,
          borderRadius: '14px',
          padding: '16px 20px',
          boxShadow: `0 4px 18px ${scenario.risk_color}18`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>AI RISK IMPACT</span>
            <span style={{
              background: scenario.risk_color,
              color: '#ffffff',
              fontSize: '0.68rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '999px'
            }}>
              {scenario.risk_level}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: '8px 0 4px 0' }}>
            <span style={{ fontSize: '1.1rem', color: '#64748b', textDecoration: 'line-through', fontWeight: 700 }}>
              {baseline.risk_percentage}%
            </span>
            <ArrowRight size={18} color="#ea580c" />
            <span style={{ fontSize: '2.3rem', fontWeight: 900, color: scenario.risk_color, fontFamily: 'var(--font-heading)', lineHeight: 1 }}>
              {scenario.risk_percentage}%
            </span>
          </div>
          <div style={{ fontSize: '0.76rem', fontWeight: 800, color: delta > 0 ? '#dc2626' : '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
            {delta > 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
            <span>{delta > 0 ? `+${delta}% Risk Surge` : `${delta}% Risk Receding`}</span>
          </div>
        </div>

        {/* Affected Spatial Footprint Card */}
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
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>AFFECTED HAZARD FOOTPRINT</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0 4px 0' }}>
            <span style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: 700 }}>{impactMetrics.affected_area_km2.baseline} km²</span>
            <ArrowRight size={16} color="#ea580c" />
            <span style={{ fontSize: '1.9rem', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-heading)' }}>
              {impactMetrics.affected_area_km2.simulated} km²
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 700 }}>
            +{impactMetrics.affected_area_km2.delta} km² Expanded Hazard Cone
          </div>
        </div>

        {/* Exposed Population Card */}
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
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>POTENTIALLY EXPOSED CITIZENS</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0 4px 0' }}>
            <span style={{ fontSize: '1.05rem', color: '#64748b', fontWeight: 700 }}>{impactMetrics.exposed_population.baseline.toLocaleString()}</span>
            <ArrowRight size={16} color="#ea580c" />
            <span style={{ fontSize: '1.9rem', fontWeight: 900, color: '#dc2626', fontFamily: 'var(--font-heading)' }}>
              {impactMetrics.exposed_population.simulated.toLocaleString()}
            </span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 700 }}>
            +{impactMetrics.exposed_population.delta.toLocaleString()} in Hazard Perimeter
          </div>
        </div>

        {/* Critical Infrastructure Exposure Card */}
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
          <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase' }}>INFRASTRUCTURE IN DANGER CONE</span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', margin: '6px 0 0 0' }}>
            <div style={{ fontSize: '0.74rem', color: '#334155', fontWeight: 700 }}>
              🛣️ <strong>{impactMetrics.infrastructure_exposure.roads_affected_count}</strong> Roads At Risk
            </div>
            <div style={{ fontSize: '0.74rem', color: '#334155', fontWeight: 700 }}>
              🏫 <strong>{impactMetrics.infrastructure_exposure.schools_affected_count}</strong> Schools
            </div>
            <div style={{ fontSize: '0.74rem', color: '#334155', fontWeight: 700 }}>
              🏥 <strong>{impactMetrics.infrastructure_exposure.hospitals_affected_count}</strong> Hospitals
            </div>
            <div style={{ fontSize: '0.74rem', color: '#16a34a', fontWeight: 700 }}>
              🏠 <strong>{impactMetrics.infrastructure_exposure.shelters_active_count}</strong> Shelters Open
            </div>
          </div>
          <div style={{ fontSize: '0.70rem', color: '#64748b', marginTop: '4px' }}>
            Critical Zone buffer calculated at {simRadiusMeters / 1000} km
          </div>
        </div>
      </div>

      {/* 🎛️ Main 2-Column Section: Left Controls | Right Digital Twin GIS Map & 3x3 Matrix */}
      <div className="responsive-grid-2">
        
        {/* LEFT COLUMN: Digital Twin Stress Test Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Hydrological & Atmospheric Sliders */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '22px 26px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '1.05rem', color: '#ea580c', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 18px 0', fontWeight: 800 }}>
              <CloudRain size={20} />
              <span>1. Hydrological & Weather Stress Triggers</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Rainfall Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                    Rainfall Downpour (24h):
                  </label>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: rainfall24h >= 140 ? '#dc2626' : '#ea580c', fontFamily: 'var(--font-mono)' }}>
                    {rainfall24h} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="350"
                  step="5"
                  value={rainfall24h}
                  onChange={(e) => {
                    setRainfall24h(e.target.value);
                    setActivePreset('custom');
                  }}
                  style={{ width: '100%', accentColor: rainfall24h >= 140 ? '#dc2626' : '#ea580c' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.70rem', color: '#64748b', marginTop: '4px' }}>
                  <span>0 mm (Dry)</span>
                  <span>70 mm (Moderate)</span>
                  <span>140 mm (Warning)</span>
                  <span>350 mm (Extreme Cloudburst)</span>
                </div>
              </div>

              {/* Soil Moisture Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                    Soil Volumetric Moisture:
                  </label>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: soilMoisture >= 80 ? '#dc2626' : '#ea580c', fontFamily: 'var(--font-mono)' }}>
                    {soilMoisture}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="2"
                  value={soilMoisture}
                  onChange={(e) => {
                    setSoilMoisture(e.target.value);
                    setActivePreset('custom');
                  }}
                  style={{ width: '100%', accentColor: soilMoisture >= 80 ? '#dc2626' : '#ea580c' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.70rem', color: '#64748b', marginTop: '4px' }}>
                  <span>10% (Desiccated)</span>
                  <span>50% (Field Capacity)</span>
                  <span>80% (Pore Saturation)</span>
                  <span>100% (Liquefaction)</span>
                </div>
              </div>

              {/* Temperature Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                    Ambient Temperature & Freeze-Thaw:
                  </label>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', fontFamily: 'var(--font-mono)' }}>
                    {temperature}°C
                  </span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="42"
                  step="1"
                  value={temperature}
                  onChange={(e) => {
                    setTemperature(e.target.value);
                    setActivePreset('custom');
                  }}
                  style={{ width: '100%', accentColor: '#ea580c' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.70rem', color: '#64748b', marginTop: '4px' }}>
                  <span>2°C (Himalayan Frost)</span>
                  <span>24°C (Normal Monsoon)</span>
                  <span>42°C (Thermal Expansion)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Topographic & Geotechnical Sliders */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '22px 26px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '1.05rem', color: '#ea580c', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 18px 0', fontWeight: 800 }}>
              <Mountain size={20} />
              <span>2. Topographic & Slope Geometry</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Slope Angle Slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                    Slope Angle Gradient:
                  </label>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: slope >= 38 ? '#dc2626' : '#ea580c', fontFamily: 'var(--font-mono)' }}>
                    {slope}°
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="65"
                  step="1"
                  value={slope}
                  onChange={(e) => {
                    setSlope(e.target.value);
                    setActivePreset('custom');
                  }}
                  style={{ width: '100%', accentColor: slope >= 38 ? '#dc2626' : '#ea580c' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.70rem', color: '#64748b', marginTop: '4px' }}>
                  <span>5° (Gentle)</span>
                  <span>30° (Critical Shear Friction)</span>
                  <span>45° (Steep Ridge)</span>
                  <span>65° (Cliff Scarp)</span>
                </div>
              </div>

              {/* Distance to Road Cut Excavation */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 800, color: '#0f172a' }}>
                    Proximity to Highway Toe Cut Excavation:
                  </label>
                  <span style={{ fontSize: '1.15rem', fontWeight: 900, color: distanceRoadCut <= 25 ? '#dc2626' : '#ea580c', fontFamily: 'var(--font-mono)' }}>
                    {distanceRoadCut} m
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={distanceRoadCut}
                  onChange={(e) => {
                    setDistanceRoadCut(e.target.value);
                    setActivePreset('custom');
                  }}
                  style={{ width: '100%', accentColor: '#ea580c' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.70rem', color: '#64748b', marginTop: '4px' }}>
                  <span>5 m (Toe Excavated / Vulnerable)</span>
                  <span>50 m (Standard Setback)</span>
                  <span>150 m (Undisturbed)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lithology & Land Cover Dropdowns */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px 24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
          }}>
            <h3 style={{ fontSize: '1.05rem', color: '#ea580c', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 16px 0', fontWeight: 800 }}>
              <Layers size={20} />
              <span>3. Lithology Bedrock & Land Cover Changes</span>
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.80rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Bedrock Stratigraphy & Shear Strength:
                </label>
                <select
                  value={geology}
                  onChange={(e) => {
                    setGeology(Number(e.target.value));
                    setActivePreset('custom');
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  {geologyOptions.map(g => (
                    <option key={g.code} value={g.code}>{g.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.80rem', color: '#475569', fontWeight: 700, display: 'block', marginBottom: '6px' }}>
                  Vegetation Cover & Root Binding Cohesion:
                </label>
                <select
                  value={landCover}
                  onChange={(e) => {
                    setLandCover(Number(e.target.value));
                    setActivePreset('custom');
                  }}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  {landCoverOptions.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={runSimulation}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '14px',
              borderRadius: '10px',
              fontSize: '0.95rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              boxShadow: '0 4px 18px rgba(234, 88, 12, 0.3)',
              transition: 'all 0.15s ease'
            }}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Re-calculating Digital Twin Matrix...' : '⚡ RE-SIMULATE DIGITAL TWIN SCENARIO'}</span>
          </button>
        </div>

        {/* RIGHT COLUMN: GIS Simulation Map + 3x3 Matrix */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* 🔥 Interactive GIS Digital Twin Simulation Map Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Map Header & View Controls */}
            <div style={{
              background: '#090d16',
              color: '#ffffff',
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="#ea580c" />
                <span style={{ fontSize: '0.84rem', fontWeight: 800, letterSpacing: '0.04em' }}>
                  DIGITAL TWIN GIS SIMULATION MAP
                </span>
              </div>

              {/* Map Mode Toggles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setMapMode('simulated')}
                  style={{
                    background: mapMode === 'simulated' ? '#ea580c' : 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Simulated Stress State ({scenario.risk_percentage}%)
                </button>
                <button
                  onClick={() => setMapMode('baseline')}
                  style={{
                    background: mapMode === 'baseline' ? '#16a34a' : 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  🟢 Baseline State ({baseline.risk_percentage}%)
                </button>
              </div>
            </div>

            {/* Map Canvas */}
            <div style={{ height: '360px', width: '100%', position: 'relative' }}>
              <MapContainer
                center={[currentStationObj.latitude || 27.3389, currentStationObj.longitude || 88.6065]}
                zoom={10}
                style={{ width: '100%', height: '100%' }}
              >
                <ChangeMapView center={[currentStationObj.latitude, currentStationObj.longitude]} zoom={10} />
                
                <TileLayer
                  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                  attribution="Tiles &copy; Esri"
                />

                {/* Simulated Danger Cone / Buffer Rings */}
                {showHazardCone && (
                  <>
                    {/* Simulated High-Risk Core */}
                    <Circle
                      center={[currentStationObj.latitude, currentStationObj.longitude]}
                      radius={mapMode === 'simulated' ? simRadiusMeters : baseRadiusMeters}
                      pathOptions={{
                        color: mapMode === 'simulated' ? scenario.risk_color : baseline.risk_color,
                        fillColor: mapMode === 'simulated' ? scenario.risk_color : baseline.risk_color,
                        fillOpacity: isCritical ? 0.35 : 0.2,
                        weight: 2,
                        dashArray: isCritical ? '6, 6' : undefined
                      }}
                    >
                      <Tooltip permanent direction="top">
                        {mapMode === 'simulated'
                          ? `🔴 Simulated Hazard Perimeter: ${scenario.risk_percentage}% (${(simRadiusMeters/1000).toFixed(1)} km radius)`
                          : `🟢 Baseline Perimeter: ${baseline.risk_percentage}% (${(baseRadiusMeters/1000).toFixed(1)} km radius)`}
                      </Tooltip>
                    </Circle>

                    {/* Secondary Buffer Zone */}
                    {mapMode === 'simulated' && (
                      <Circle
                        center={[currentStationObj.latitude, currentStationObj.longitude]}
                        radius={simRadiusMeters * 1.5}
                        pathOptions={{
                          color: '#f59e0b',
                          fillColor: '#f59e0b',
                          fillOpacity: 0.08,
                          weight: 1,
                          dashArray: '4, 4'
                        }}
                      >
                        <Tooltip>🟠 Secondary Advisory Buffer Area</Tooltip>
                      </Circle>
                    )}
                  </>
                )}

                {/* Target Station Marker */}
                <Marker
                  position={[currentStationObj.latitude, currentStationObj.longitude]}
                  icon={createMapIcon('⛰️', mapMode === 'simulated' ? scenario.risk_color : baseline.risk_color)}
                >
                  <Popup>
                    <div style={{ color: '#0f172a', padding: '4px' }}>
                      <strong>{currentStationObj.name}</strong>
                      <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{currentStationObj.district}, {currentStationObj.state}</div>
                      <div style={{ fontSize: '0.80rem', fontWeight: 800, color: scenario.risk_color, marginTop: '4px' }}>
                        Simulated Risk: {scenario.risk_percentage}% ({scenario.risk_level})
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Overlay Critical Facilities */}
                {showInfrastructure && facilities.slice(0, 12).map(fac => (
                  <Marker
                    key={`fac-${fac.id}`}
                    position={[fac.latitude, fac.longitude]}
                    icon={createMapIcon(
                      fac.facility_type === 'HOSPITAL' ? '🏥' : (fac.facility_type === 'SHELTER' ? '🏠' : '🏫'),
                      '#1e293b'
                    )}
                  >
                    <Popup>
                      <div style={{ color: '#0f172a' }}>
                        <strong>{fac.name}</strong>
                        <div>Type: {fac.facility_type} • Cap: {fac.capacity}</div>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Overlay Evacuation Routes */}
                {showRoutes && routes.slice(0, 3).map(r => (
                  <React.Fragment key={r.id}>
                    {r.safe_waypoints && (
                      <Polyline
                        positions={r.safe_waypoints}
                        pathOptions={{ color: isCritical ? '#ea580c' : '#16a34a', weight: 3, dashArray: '6, 6' }}
                      />
                    )}
                  </React.Fragment>
                ))}
              </MapContainer>

              {/* Map Layer Legend Overlay */}
              <div style={{
                position: 'absolute',
                bottom: 12,
                right: 12,
                zIndex: 500,
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(8px)',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.70rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#dc2626', borderRadius: '50%' }} />
                  <span>Predicted High-Risk Zone</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%' }} />
                  <span>Buffer Advisory Area</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🏥 🏫 🏠</span>
                  <span>Exposed Infrastructure</span>
                </div>
              </div>
            </div>
          </div>

          {/* 🧩 3x3 Micro-Terrain Spatial Stability Matrix (BEFORE vs AFTER) */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '22px 26px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#ea580c" />
                  <span>Spatial Cell Stability Matrix (Before vs After Stress)</span>
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                  Simulates micro-cell terrain shear transitions across 9 surrounding catchment quadrants
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '20px', alignItems: 'center' }}>
              
              {/* BEFORE Matrix (Baseline) */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#16a34a', marginBottom: '10px' }}>
                  🟢 BEFORE (LIVE SENSORS: {rainfall24h > 100 ? '120mm' : '45mm'})
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxWidth: '180px', margin: '0 auto' }}>
                  {beforeMatrix.map((cell, idx) => (
                    <div
                      key={`before-${idx}`}
                      style={{
                        background: cell.color,
                        color: '#ffffff',
                        height: '42px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                      title={`Quadrant ${idx+1}: ${cell.val}% risk`}
                    >
                      <span>{cell.badge}</span>
                      <span style={{ fontSize: '0.62rem' }}>{cell.val}%</span>
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '0.70rem', color: '#64748b', display: 'block', marginTop: '8px' }}>
                  Mean Risk: <strong>{baseline.risk_percentage}%</strong>
                </span>
              </div>

              {/* Transition Indicator Arrow */}
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#fff7ed',
                  border: '1px solid #fdba74',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ea580c',
                  margin: '0 auto'
                }}>
                  <ArrowRight size={20} />
                </div>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ea580c', marginTop: '4px', display: 'block' }}>
                  +{delta}%
                </span>
              </div>

              {/* AFTER Matrix (Simulated Digital Twin) */}
              <div style={{
                background: isCritical ? '#fef2f2' : '#fff7ed',
                border: `1px solid ${isCritical ? '#fca5a5' : '#fed7aa'}`,
                borderRadius: '12px',
                padding: '14px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: scenario.risk_color, marginBottom: '10px' }}>
                  🔴 AFTER (SIMULATED: {rainfall24h}mm)
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', maxWidth: '180px', margin: '0 auto' }}>
                  {afterMatrix.map((cell, idx) => (
                    <div
                      key={`after-${idx}`}
                      style={{
                        background: cell.color,
                        color: '#ffffff',
                        height: '42px',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        boxShadow: `0 2px 8px ${cell.color}44`,
                        animation: cell.level === 'CRITICAL' ? 'pulse 2s infinite' : 'none'
                      }}
                      title={`Quadrant ${idx+1}: ${cell.val}% risk`}
                    >
                      <span>{cell.badge}</span>
                      <span style={{ fontSize: '0.62rem' }}>{cell.val}%</span>
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: '0.70rem', color: scenario.risk_color, fontWeight: 800, display: 'block', marginTop: '8px' }}>
                  Simulated Risk: <strong>{scenario.risk_percentage}%</strong>
                </span>
              </div>

            </div>
          </div>

          {/* 🚨 Actionable Emergency Decision-Support Guidance */}
          <div style={{
            background: isCritical ? '#fef2f2' : '#fff7ed',
            borderLeft: `5px solid ${scenario.risk_color}`,
            borderRadius: '0 14px 14px 0',
            padding: '18px 22px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldAlert size={20} color={scenario.risk_color} />
              <strong style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                ACTIONABLE EMERGENCY DECISION-SUPPORT GUIDANCE
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', lineHeight: '1.5' }}>
              {simulationResult?.decision_support_guidance || (
                isCritical 
                  ? "EMERGENCY SCENARIO ALERT: Immediate pre-emptive evacuation of toe-slope settlements within 2.5km. Mobilize NDRF battalions and initiate preventative vehicular closures on connecting arterial highways."
                  : "HEIGHTENED READINESS: Issue orange-level meteorological warning to district emergency centers. Position heavy clearing earth-movers at strategic road bottlenecks and activate relief shelters."
              )}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};

export default WhatIfSimulatorPage;
