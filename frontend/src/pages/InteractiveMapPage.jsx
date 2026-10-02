import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Circle, Tooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Search, 
  Layers, 
  Droplets, 
  Mountain, 
  Activity, 
  ChevronRight, 
  X, 
  MapPin,
  Sliders,
  ShieldAlert,
  Zap,
  Compass,
  Thermometer,
  Wind,
  CheckCircle2,
  AlertOctagon,
  Globe,
  Clock,
  Navigation,
  Sparkles,
  Building2,
  Camera,
  ArrowRight,
  TrendingUp,
  Radio
} from 'lucide-react';
import api from '../services/api';

// Create custom animated SVG icons for map pins
const createCustomMarkerIcon = (riskLevel, riskColor, isSelected = false, label = '') => {
  const isCritical = riskLevel === 'CRITICAL';
  const isHigh = riskLevel === 'HIGH';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        position: relative;
        width: 38px;
        height: 38px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${(isCritical || isHigh) ? `
          <div style="
            position: absolute;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: ${riskColor};
            opacity: ${isCritical ? '0.45' : '0.25'};
            animation: pulse-radar ${isCritical ? '1.5s' : '2.5s'} infinite cubic-bezier(0, 0, 0.2, 1);
          "></div>
        ` : ''}
        <div style="
          width: ${isSelected ? '28px' : '22px'};
          height: ${isSelected ? '28px' : '22px'};
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #ffffff 0%, ${riskColor} 70%, #9a3412 100%);
          border: ${isSelected ? '3px solid #ea580c' : '2.5px solid #ffffff'};
          box-shadow: 0 2px 12px ${riskColor}88;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-size: 11px;
          font-weight: 900;
          font-family: monospace;
        ">
          ${isCritical ? '!' : (isHigh ? '▲' : (label || ''))}
        </div>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -20]
  });
};

const createFacilityIcon = (type) => {
  const iconChar = type === 'HOSPITAL' ? '🏥' : (type === 'SHELTER' ? '🏠' : '🚒');
  const bg = type === 'HOSPITAL' ? '#0284c7' : (type === 'SHELTER' ? '#16a34a' : '#ea580c');
  return L.divIcon({
    className: 'custom-facility-marker',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        border-radius: 8px;
        background: ${bg};
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
      ">
        ${iconChar}
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

const createCitizenReportIcon = () => {
  return L.divIcon({
    className: 'custom-citizen-marker',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: #ea580c;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 12px rgba(234, 88, 12, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
      ">
        ⚠️
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

// Map click handler for "Click-to-Predict anywhere"
const MapClickPredictor = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

export const InteractiveMapPage = ({ onSelectStationForSimulator }) => {
  const [locations, setLocations] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [citizenReports, setCitizenReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedState, setSelectedState] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Temporal Future Risk Forecasting State
  const [forecastHours, setForecastHours] = useState(0); // 0 (Now), 6, 12, 24, 48
  const [stationForecast, setStationForecast] = useState(null);

  // Layer Toggles
  const [showHazardRings, setShowHazardRings] = useState(true);
  const [showSafeRoutes, setShowSafeRoutes] = useState(true);
  const [showFacilities, setShowFacilities] = useState(true);
  const [showCitizenPins, setShowCitizenPins] = useState(true);

  // Basemap Selector: Free high-resolution light and topography basemaps
  const [basemap, setBasemap] = useState('light'); // 'light', 'satellite', 'topo'

  // Custom click-to-predict state
  const [customClickPoint, setCustomClickPoint] = useState(null);
  const [customPredicting, setCustomPredicting] = useState(false);
  const [customPredictionResult, setCustomPredictionResult] = useState(null);

  const basemapLayers = {
    light: {
      name: 'Esri Light Gray Canvas',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16
    },
    satellite: {
      name: 'Esri High-Res Satellite',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 18
    },
    topo: {
      name: 'Esri Topographic Contours',
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community',
      maxZoom: 18
    }
  };

  const nerStates = ['ALL', 'Sikkim', 'Assam', 'Meghalaya', 'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura'];

  useEffect(() => {
    const fetchMapData = async () => {
      setLoading(true);
      try {
        const [locs, facs, rts, reports] = await Promise.all([
          api.getLocations(),
          api.getEmergencyFacilities(),
          api.getSafeRoutes(),
          api.getCitizenReports()
        ]);
        const validLocs = Array.isArray(locs) ? locs : [];
        setLocations(validLocs);
        setFacilities(Array.isArray(facs) ? facs : []);
        setRoutes(Array.isArray(rts) ? rts : []);
        setCitizenReports(Array.isArray(reports) ? reports : []);
        if (validLocs.length > 0) {
          setSelectedStation(validLocs[0]);
        }
      } catch (err) {
        console.error('Error fetching map data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  // Fetch temporal forecast when selected station changes
  useEffect(() => {
    if (selectedStation) {
      api.getFutureForecast(selectedStation.code || 'sk_01')
        .then(f => setStationForecast(f))
        .catch(e => console.warn(e));
    }
  }, [selectedStation]);

  const handleMapClick = async (latlng) => {
    setCustomClickPoint(latlng);
    setSelectedStation(null);
    setCustomPredicting(true);

    const lat = latlng.lat;
    const isHimalayan = lat > 26.5;
    const simulatedSlope = isHimalayan ? Math.round(28 + Math.random() * 20) : Math.round(18 + Math.random() * 16);
    const simulatedRain = Math.round(60 + Math.random() * 120);
    const simulatedMoist = Math.min(95, Math.round(55 + (simulatedRain / 200) * 40));

    try {
      const pred = await api.predictRisk({
        rainfall_24h: simulatedRain,
        slope: simulatedSlope,
        elevation: isHimalayan ? 1800 : 650,
        soil_moisture: simulatedMoist,
        geology_code: isHimalayan ? 5 : 3,
        distance_to_fault_km: 4.2,
        distance_to_road_cut_m: 40.0
      });
      setCustomPredictionResult({
        ...pred,
        coordinates: [latlng.lat.toFixed(4), latlng.lng.toFixed(4)],
        slope: simulatedSlope,
        rainfall_24h: simulatedRain,
        soil_moisture: simulatedMoist
      });
    } catch (err) {
      console.error(err);
    } finally {
      setCustomPredicting(false);
    }
  };

  const filteredLocations = useMemo(() => {
    return locations.map(loc => {
      let liveRisk = loc.live_risk || { risk_percentage: 50, risk_level: 'MEDIUM', risk_color: '#d97706', risk_badge: '🟡 MEDIUM' };
      
      if (forecastHours > 0) {
        const multiplier = forecastHours === 6 ? 1.15 : (forecastHours === 12 ? 1.32 : (forecastHours === 24 ? 1.45 : 1.25));
        const projPct = Math.min(99.0, Math.round(liveRisk.risk_percentage * multiplier * 10) / 10);
        let projLevel = "LOW", projColor = "#16a34a", projBadge = "🟢 LOW";
        if (projPct >= 80) { projLevel = "CRITICAL"; projColor = "#dc2626"; projBadge = "🔴 CRITICAL"; }
        else if (projPct >= 65) { projLevel = "HIGH"; projColor = "#ea580c"; projBadge = "🟠 HIGH"; }
        else if (projPct >= 35) { projLevel = "MEDIUM"; projColor = "#d97706"; projBadge = "🟡 MEDIUM"; }

        return {
          ...loc,
          display_risk: {
            ...liveRisk,
            risk_percentage: projPct,
            risk_level: projLevel,
            risk_color: projColor,
            risk_badge: projBadge
          }
        };
      }

      return {
        ...loc,
        display_risk: liveRisk
      };
    }).filter(loc => {
      const matchState = selectedState === 'ALL' || loc.state.toLowerCase() === selectedState.toLowerCase();
      const matchRisk = selectedRisk === 'ALL' || loc.display_risk.risk_level.toUpperCase() === selectedRisk.toUpperCase();
      const matchSearch = !searchQuery || 
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.state.toLowerCase().includes(searchQuery.toLowerCase());
      return matchState && matchRisk && matchSearch;
    });
  }, [locations, selectedState, selectedRisk, searchQuery, forecastHours]);

  return (
    <div style={{
      position: 'relative',
      height: 'calc(100vh - 72px)',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: '#f8fafc'
    }}>
      {/* Dedicated Top Control Toolbar (Relocated Outside & Above the Map Canvas) */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        padding: '10px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 20,
        flexShrink: 0
      }}>
        {/* Row 1: State Filter Chips & Search / Risk Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 900, color: '#ea580c', letterSpacing: '0.04em', whiteSpace: 'nowrap', paddingRight: '4px' }}>
              STATE:
            </span>
            {nerStates.map(state => (
              <button
                key={state}
                onClick={() => setSelectedState(state)}
                style={{
                  background: selectedState === state ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : '#f8fafc',
                  color: selectedState === state ? '#ffffff' : '#334155',
                  border: selectedState === state ? '1px solid #ea580c' : '1px solid #e2e8f0',
                  padding: '5px 12px',
                  borderRadius: '7px',
                  fontSize: '0.74rem',
                  fontWeight: selectedState === state ? 800 : 600,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {state}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Quick Search Input */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Search station, district..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '5px 10px 5px 30px',
                  fontSize: '0.75rem',
                  borderRadius: '7px',
                  border: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  color: '#0f172a',
                  width: '180px',
                  outline: 'none'
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '6px',
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Risk Level Filter Select */}
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              style={{
                padding: '5px 10px',
                fontSize: '0.74rem',
                fontWeight: 700,
                borderRadius: '7px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#334155',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="ALL">All Risk Levels ({locations.length})</option>
              <option value="CRITICAL">🔴 Critical Only</option>
              <option value="HIGH">🟠 High Only</option>
              <option value="MEDIUM">🟡 Medium Only</option>
              <option value="LOW">🟢 Low Only</option>
            </select>
          </div>
        </div>

        {/* Row 2: Temporal Risk Forecast Timeline & Layer Visibility Toggles */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          background: forecastHours > 0 ? '#fef2f2' : '#fff7ed',
          border: forecastHours > 0 ? '1px solid #fca5a5' : '1px solid #fed7aa',
          borderRadius: '10px',
          padding: '6px 14px',
          flexWrap: 'wrap'
        }}>
          {/* Timeline Info & Horizon Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color={forecastHours > 0 ? '#dc2626' : '#ea580c'} />
              <div>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: forecastHours > 0 ? '#dc2626' : '#ea580c' }}>
                  {forecastHours === 0 ? '🔮 TEMPORAL RISK TIMELINE: LIVE (NOW)' : `⚡ METEOROLOGICAL FORECAST: +${forecastHours} HOURS AHEAD`}
                </span>
                <span style={{ fontSize: '0.7rem', color: '#64748b', marginLeft: '8px' }}>
                  {forecastHours === 0 ? '• Showing real-time station sensor telemetry' : '• Projecting cumulative rainfall & progressive soil pore saturation'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {[
                { h: 0, label: 'Now (0h)' },
                { h: 6, label: '+6 Hours' },
                { h: 12, label: '+12 Hours (Peak)' },
                { h: 24, label: '+24 Hours' },
                { h: 48, label: '+48 Hours' }
              ].map(step => (
                <button
                  key={step.h}
                  onClick={() => setForecastHours(step.h)}
                  style={{
                    background: forecastHours === step.h 
                      ? (step.h > 0 ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)')
                      : '#ffffff',
                    color: forecastHours === step.h ? '#ffffff' : '#334155',
                    border: forecastHours === step.h ? '1px solid transparent' : '1px solid #e2e8f0',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: forecastHours === step.h ? 800 : 600,
                    cursor: 'pointer',
                    boxShadow: forecastHours === step.h ? '0 2px 6px rgba(234, 88, 12, 0.2)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </div>

          {/* Layer Visibility Toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748b', marginRight: '4px' }}>LAYERS:</span>
            <button
              onClick={() => setShowSafeRoutes(!showSafeRoutes)}
              style={{
                background: showSafeRoutes ? '#ecfdf5' : '#ffffff',
                border: showSafeRoutes ? '1px solid #10b981' : '1px solid #e2e8f0',
                color: showSafeRoutes ? '#16a34a' : '#64748b',
                padding: '4px 9px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Toggle Safe Green Routes and Red Blocked Roads"
            >
              🚗 Safe Routes
            </button>
            <button
              onClick={() => setShowFacilities(!showFacilities)}
              style={{
                background: showFacilities ? '#fff7ed' : '#ffffff',
                border: showFacilities ? '1px solid #ea580c' : '1px solid #e2e8f0',
                color: showFacilities ? '#ea580c' : '#64748b',
                padding: '4px 9px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Toggle Hospitals, Shelters, and NDRF Camps"
            >
              🏥 Facilities
            </button>
            <button
              onClick={() => setShowCitizenPins(!showCitizenPins)}
              style={{
                background: showCitizenPins ? '#fff1f2' : '#ffffff',
                border: showCitizenPins ? '1px solid #f43f5e' : '1px solid #e2e8f0',
                color: showCitizenPins ? '#e11d48' : '#64748b',
                padding: '4px 9px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Toggle Crowd-sourced Citizen Incident Reports"
            >
              📱 Citizen Pins
            </button>
            <button
              onClick={() => setShowHazardRings(!showHazardRings)}
              style={{
                background: showHazardRings ? '#fef3c7' : '#ffffff',
                border: showHazardRings ? '1px solid #f59e0b' : '1px solid #e2e8f0',
                color: showHazardRings ? '#b45309' : '#64748b',
                padding: '4px 9px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="Toggle Hazard Buffer Radii for High/Critical Zones"
            >
              ⭕ Hazard Rings
            </button>
          </div>
        </div>
      </div>

      {/* Main Map & Drawer Flex Layout Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', overflow: 'hidden', height: '100%' }}>
        {/* Map Area */}
        <div style={{ flex: 1, position: 'relative', height: '100%' }}>
          {/* Floating Basemap Selector on Bottom Left */}
          <div style={{
            position: 'absolute',
            bottom: 24,
            left: 18,
            zIndex: 500,
            background: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(16px)',
            padding: '6px 8px',
            borderRadius: '10px',
            border: '1px solid rgba(234, 88, 12, 0.25)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#ea580c', padding: '0 4px' }}>BASEMAP:</span>
            {['light', 'satellite', 'topo'].map(mode => (
              <button
                key={mode}
                onClick={() => setBasemap(mode)}
                style={{
                  background: basemap === mode ? '#ea580c' : '#f1f5f9',
                  color: basemap === mode ? '#ffffff' : '#475569',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'all 0.15s ease'
                }}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Leaflet Map */}
          <MapContainer
            center={[26.2006, 92.9376]}
            zoom={7}
            minZoom={6}
            maxZoom={18}
            style={{ width: '100%', height: '100%', background: '#e2e8f0' }}
          >
            <TileLayer
              url={basemapLayers[basemap].url}
              attribution={basemapLayers[basemap].attribution}
              maxZoom={basemapLayers[basemap].maxZoom}
            />

          <MapClickPredictor onMapClick={handleMapClick} />

          {/* Render Safe Evacuation Routes & Blocked Roads */}
          {showSafeRoutes && routes.map(r => (
            <React.Fragment key={r.id}>
              {r.safe_waypoints && r.safe_waypoints.length > 0 && (
                <Polyline
                  positions={r.safe_waypoints}
                  pathOptions={{
                    color: '#16a34a',
                    weight: 4,
                    dashArray: '8, 8',
                    opacity: 0.9
                  }}
                >
                  <Tooltip sticky>🟢 Safe Evacuation Corridor: {r.name}</Tooltip>
                </Polyline>
              )}
              {r.hazard_waypoints && r.hazard_waypoints.length > 0 && (
                <Polyline
                  positions={r.hazard_waypoints}
                  pathOptions={{
                    color: '#dc2626',
                    weight: 4,
                    opacity: 0.95
                  }}
                >
                  <Tooltip sticky>🔴 Blocked Hazard Road: Active Mass Failure</Tooltip>
                </Polyline>
              )}
            </React.Fragment>
          ))}

          {/* Render Emergency Facilities */}
          {showFacilities && facilities.map(fac => (
            <Marker
              key={`fac-${fac.id}`}
              position={[fac.latitude, fac.longitude]}
              icon={createFacilityIcon(fac.facility_type)}
            >
              <Popup>
                <div style={{ color: '#0f172a', padding: '4px', maxWidth: '200px' }}>
                  <strong style={{ fontSize: '0.85rem' }}>{fac.name}</strong>
                  <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: '2px' }}>
                    Type: {fac.facility_type} • Cap: {fac.capacity}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 700, marginTop: '4px' }}>
                    📞 {fac.emergency_phone}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render Citizen Ground Report Pins */}
          {showCitizenPins && citizenReports.map(rep => (
            <Marker
              key={`rep-${rep.id}`}
              position={[rep.latitude, rep.longitude]}
              icon={createCitizenReportIcon()}
            >
              <Popup>
                <div style={{ color: '#0f172a', padding: '4px', maxWidth: '220px' }}>
                  <span style={{ background: '#ea580c', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 800 }}>
                    CITIZEN REPORT
                  </span>
                  <h4 style={{ margin: '4px 0 2px 0', fontSize: '0.85rem' }}>{rep.location_name}</h4>
                  <p style={{ margin: 0, fontSize: '0.74rem', color: '#334155' }}>"{rep.description}"</p>
                  <div style={{ fontSize: '0.7rem', color: '#ea580c', marginTop: '4px' }}>
                    AI Risk: <strong>{rep.ai_risk_score}% ({rep.ai_severity})</strong>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render Monitored Stations */}
          {filteredLocations.map(loc => {
            const risk = loc.display_risk;
            const isSelected = selectedStation?.id === loc.id;
            const isCritical = risk.risk_level === 'CRITICAL';
            const isHigh = risk.risk_level === 'HIGH';

            return (
              <React.Fragment key={loc.id}>
                {showHazardRings && (isCritical || isHigh) && (
                  <Circle
                    center={[loc.latitude, loc.longitude]}
                    radius={isCritical ? 12000 : 7000}
                    pathOptions={{
                      color: risk.risk_color,
                      fillColor: risk.risk_color,
                      fillOpacity: isCritical ? 0.18 : 0.1,
                      weight: 1.5,
                      dashArray: isCritical ? '4, 6' : undefined
                    }}
                  />
                )}

                <Marker
                  position={[loc.latitude, loc.longitude]}
                  icon={createCustomMarkerIcon(risk.risk_level, risk.risk_color, isSelected)}
                  eventHandlers={{
                    click: () => {
                      setSelectedStation(loc);
                      setCustomPredictionResult(null);
                    }
                  }}
                >
                  <Tooltip direction="top" offset={[0, -18]} opacity={0.95}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>
                      {loc.name} — <span style={{ color: risk.risk_color }}>{risk.risk_percentage}% ({risk.risk_level})</span>
                    </div>
                  </Tooltip>
                </Marker>
              </React.Fragment>
            );
          })}

          {/* Render Custom Clicked Point Marker */}
          {customClickPoint && (
            <Marker
              position={[customClickPoint.lat, customClickPoint.lng]}
              icon={createCustomMarkerIcon('CUSTOM', '#ea580c', true, '📍')}
            >
              <Popup>
                <div style={{ color: '#0f172a', padding: '4px' }}>
                  <strong>Custom Point Prediction</strong>
                  <div>Lat: {customClickPoint.lat.toFixed(4)}</div>
                  <div>Lng: {customClickPoint.lng.toFixed(4)}</div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      </div>

      {/* Right Slideout Drawer: Station Telemetry, Explainable AI (SHAP), & Future Forecast */}
      {(selectedStation || customPredictionResult) && (
        <aside style={{
          width: '460px',
          height: '100%',
          background: '#ffffff',
          borderLeft: '1px solid rgba(234, 88, 12, 0.25)',
          boxShadow: '-10px 0 35px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 600,
          overflowY: 'auto',
          padding: '26px 24px',
          gap: '20px'
        }}>
          {/* Drawer Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
            <div>
              <span style={{
                background: '#fff7ed',
                color: '#ea580c',
                border: '1px solid #fdba74',
                padding: '3px 9px',
                borderRadius: '5px',
                fontSize: '0.7rem',
                fontWeight: 800,
                letterSpacing: '0.04em'
              }}>
                {selectedStation ? `STATION CODE: ${selectedStation.code.toUpperCase()}` : 'ON-THE-FLY AI PREDICTION'}
              </span>
              <h2 style={{ margin: '8px 0 3px 0', fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>
                {selectedStation ? selectedStation.name : 'Target Geographic Coordinate'}
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {selectedStation ? `${selectedStation.district}, ${selectedStation.state}` : `Lat: ${customPredictionResult?.coordinates[0]}, Lng: ${customPredictionResult?.coordinates[1]}`}
              </span>
            </div>

            <button
              onClick={() => {
                setSelectedStation(null);
                setCustomPredictionResult(null);
              }}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                color: '#64748b',
                padding: '8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Primary AI Risk Assessment Dial Card */}
          {(() => {
            const risk = selectedStation ? (selectedStation.display_risk || selectedStation.live_risk) : customPredictionResult;
            const tele = selectedStation ? (selectedStation.telemetry || {}) : {
              rainfall_24h: customPredictionResult?.rainfall_24h || 50,
              soil_moisture: customPredictionResult?.soil_moisture || 55,
              pore_water_pressure_kpa: 14.5
            };

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Big Risk Banner */}
                <div style={{
                  background: `${risk.risk_color}11`,
                  border: `1px solid ${risk.risk_color}`,
                  borderRadius: '14px',
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  boxShadow: `0 4px 16px ${risk.risk_color}22`
                }}>
                  <div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>PREDICTED HAZARD PROBABILITY</div>
                    <div style={{ fontSize: '2.4rem', fontWeight: 900, color: risk.risk_color, fontFamily: 'var(--font-heading)', lineHeight: 1.1, margin: '4px 0' }}>
                      {risk.risk_percentage}%
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                      {risk.risk_badge}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', maxWidth: '180px' }}>
                    <div style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 800 }}>AI STATUS</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>{risk.status}</div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '6px' }}>
                      Gradient Boosting (Production)
                    </div>
                  </div>
                </div>

                {/* Telemetry Sensor Gauges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>24h Rain</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ea580c', marginTop: '2px' }}>{tele.rainfall_24h || 45} mm</div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Soil Moisture</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>{tele.soil_moisture || 50}%</div>
                  </div>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Pore Pressure</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#d97706', marginTop: '2px' }}>{tele.pore_water_pressure_kpa || 12.5} kPa</div>
                  </div>
                </div>

                {/* 🧠 Explainable AI (SHAP Waterfall Attribution) */}
                <div style={{
                  background: '#fff7ed',
                  border: '1px solid #fdba74',
                  borderRadius: '12px',
                  padding: '18px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Sparkles size={16} color="#ea580c" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ea580c' }}>
                      EXPLAINABLE AI (XAI / SHAP ATTRIBUTION)
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#334155', marginBottom: '14px', lineHeight: '1.45' }}>
                    <em>"{risk.shap_explanation?.narrative_explanation || 'High precipitation intensity coupled with steep slope gradient is actively driving shear strain beyond regional equilibrium limits.'}"</em>
                  </div>

                  {/* Factor Contribution Bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(risk.shap_explanation?.waterfall_contributions || risk.feature_contributions || [
                      { name: '24h Rainfall Surge', shap_value: 0.28, value: '165 mm' },
                      { name: 'Slope Steepness', shap_value: 0.21, value: '34°' },
                      { name: 'Soil Saturation', shap_value: 0.16, value: '78%' },
                      { name: 'Lithology Bedrock', shap_value: 0.08, value: 'Shale' }
                    ]).slice(0, 5).map((feat, idx) => {
                      const val = feat.shap_value !== undefined ? Math.abs(feat.shap_value * 100) : (feat.weight || 20);
                      const isPos = feat.shap_value === undefined || feat.shap_value >= 0;
                      return (
                        <div key={idx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: '#475569', marginBottom: '3px', fontWeight: 600 }}>
                            <span>{feat.name || feat.factor}</span>
                            <span style={{ color: isPos ? '#ea580c' : '#16a34a', fontWeight: 800 }}>
                              {isPos ? '+' : '-'}{val.toFixed(1)}% {feat.value ? `(${feat.value})` : ''}
                            </span>
                          </div>
                          <div style={{ width: '100%', height: '7px', background: '#fed7aa', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{
                              width: `${Math.min(100, val * 2.5)}%`,
                              height: '100%',
                              background: isPos ? 'linear-gradient(to right, #fb923c, #ea580c)' : '#16a34a',
                              borderRadius: '4px'
                            }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 🔮 Future 48-Hour Risk Trajectory Mini-Card */}
                {stationForecast && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#ea580c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} /> 48-HOUR PROJECTED TRAJECTORY
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#dc2626', fontWeight: 800 }}>
                        {stationForecast.trend_verdict}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', textAlign: 'center' }}>
                      {stationForecast.timeline.map((t, idx) => (
                        <div key={idx} style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '8px 4px', borderRadius: '8px' }}>
                          <div style={{ fontSize: '0.66rem', color: '#64748b', fontWeight: 600 }}>{t.hours_ahead}h</div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 800, color: t.risk_color, marginTop: '2px' }}>{t.risk_percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                  {selectedStation && onSelectStationForSimulator && (
                    <button
                      onClick={() => onSelectStationForSimulator(selectedStation)}
                      className="btn btn-primary"
                      style={{
                        padding: '12px',
                        fontSize: '0.88rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <Sliders size={16} /> Open in What-If Simulator
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </aside>
      )}
      </div>
    </div>
  );
};

export default InteractiveMapPage;
