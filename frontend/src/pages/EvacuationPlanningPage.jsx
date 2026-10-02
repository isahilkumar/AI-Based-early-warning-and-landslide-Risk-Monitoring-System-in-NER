import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  Building2, 
  Hospital, 
  Home, 
  ShieldAlert, 
  AlertOctagon, 
  CheckCircle2, 
  PhoneCall, 
  Compass, 
  MapPin, 
  Clock, 
  Layers, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink,
  Users,
  Bed,
  Phone
} from 'lucide-react';
import api from '../services/api';

export const EvacuationPlanningPage = ({ userRole = 'ADMIN' }) => {
  const [facilities, setFacilities] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedFacilityType, setSelectedFacilityType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [facs, rts, locs] = await Promise.all([
          api.getEmergencyFacilities(),
          api.getSafeRoutes(),
          api.getLocations()
        ]);
        setFacilities(facs);
        setRoutes(rts);
        setLocations(locs);
        if (locs.length > 0) {
          setSelectedStation(locs[0]);
        }
      } catch (err) {
        console.error('Error loading evacuation data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStationChange = async (stationId) => {
    const st = locations.find(l => String(l.id) === String(stationId) || l.code === stationId);
    setSelectedStation(st);
    if (st) {
      try {
        const sortedFacs = await api.getEmergencyFacilities({
          lat: st.latitude,
          lng: st.longitude
        });
        setFacilities(sortedFacs);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredFacilities = selectedFacilityType 
    ? facilities.filter(f => f.facility_type === selectedFacilityType)
    : facilities;

  return (
    <div style={{ maxWidth: '1720px', margin: '0 auto', padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Page Header */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(234, 88, 12, 0.25)',
        borderRadius: '16px',
        padding: '26px 32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{
              background: '#fff7ed',
              color: '#ea580c',
              border: '1px solid #fdba74',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.74rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Navigation size={14} /> DISASTER EVACUATION CORRIDORS & EMERGENCY MATRIX
            </span>
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
            Safe Evacuation Routing & Nearest Emergency Facilities
          </h1>
          <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.92rem', lineHeight: '1.5' }}>
            Dynamic identification of blocked/hazard road corridors versus recommended green ridge bypass paths to Civil Hospitals, Disaster Shelters, and NDRF Staging Camps across all 8 NER states.
          </p>
        </div>

        {/* Station Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 700 }}>Origin Hotspot:</label>
          <select
            value={selectedStation?.id || ''}
            onChange={(e) => handleStationChange(e.target.value)}
            style={{
              background: '#fff7ed',
              color: '#ea580c',
              border: '1px solid #fdba74',
              borderRadius: '8px',
              padding: '9px 16px',
              fontSize: '0.88rem',
              fontWeight: 700,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name} ({loc.district}, {loc.state}) - {loc.live_risk?.risk_percentage || 50}% Risk
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Left Column Route Comparison, Right Column Emergency Facilities Directory */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.15fr) minmax(380px, 0.85fr)', gap: '28px' }}>
        
        {/* Left Column: Recommended Evacuation Corridors & Blocked Road Analysis */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(234, 88, 12, 0.25)',
            borderRadius: '16px',
            padding: '28px 32px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 20px 0', color: '#ea580c', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={22} /> Active Evacuation Route Recommendations
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {routes.map(route => (
                <div
                  key={route.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #fed7aa',
                    borderRadius: '14px',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{
                        background: '#f0fdf4',
                        color: '#16a34a',
                        border: '1px solid #86efac',
                        padding: '3px 9px',
                        borderRadius: '5px',
                        fontSize: '0.72rem',
                        fontWeight: 800
                      }}>
                        🟢 GREEN SAFE CORRIDOR
                      </span>
                      <h3 style={{ margin: '8px 0 3px 0', fontSize: '1.12rem', color: '#0f172a', fontWeight: 900 }}>
                        {route.name}
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                        {route.district}, {route.state} • Destination: <strong style={{ color: '#ea580c' }}>{route.destination_name}</strong>
                      </span>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ea580c' }}>
                        {route.distance_km} km
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>Est. ~{route.estimated_time_mins} mins travel</div>
                    </div>
                  </div>

                  {/* Red Hazard Path vs Green Safe Path Comparison */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{
                      background: '#fef2f2',
                      border: '1px solid #fca5a5',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', fontWeight: 800, marginBottom: '6px' }}>
                        <AlertOctagon size={15} /> 🔴 DIRECT HIGHWAY ROAD (AVOID)
                      </div>
                      <div style={{ color: '#991b1b', lineHeight: '1.35' }}>
                        Status: <strong>BLOCKED BY ACTIVE DEBRIS FLOW</strong>. Saturated toe-slopes, ongoing mass creeping.
                      </div>
                    </div>

                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #86efac',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 800, marginBottom: '6px' }}>
                        <ShieldCheck size={15} /> 🟢 RIDGE BYPASS ROUTE (SAFE)
                      </div>
                      <div style={{ color: '#166534', lineHeight: '1.35' }}>
                        Status: <strong>OPEN & GUARDED BY TRAFFIC POLICE</strong>. High ridge elevation avoiding flood plain.
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', lineHeight: '1.5' }}>
                    💡 <strong>Official Advisory:</strong> {route.advisory_notes}
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      Emergency Hotline: <strong style={{ color: '#ea580c' }}>{route.facility_phone}</strong>
                    </span>
                    <a
                      href={`tel:${route.facility_phone.split('/')[0].trim()}`}
                      className="btn btn-primary"
                      style={{
                        padding: '7px 16px',
                        fontSize: '0.78rem'
                      }}
                    >
                      <PhoneCall size={13} /> Contact Control Desk
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Nearest Emergency Facilities (Hospitals, Shelters, NDRF Bases) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(234, 88, 12, 0.25)',
            borderRadius: '16px',
            padding: '28px 30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={22} color="#ea580c" /> Nearest Emergency Facilities
                </h2>
                <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                  Sorted by live distance from {selectedStation?.name || 'Selected Origin'}
                </span>
              </div>

              {/* Type Filter */}
              <select
                value={selectedFacilityType}
                onChange={(e) => setSelectedFacilityType(e.target.value)}
                style={{
                  background: '#ffffff',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600
                }}
              >
                <option value="">All Facility Types</option>
                <option value="HOSPITAL">🏥 Hospitals / Trauma</option>
                <option value="SHELTER">🏠 Relief Shelters</option>
                <option value="NDRF_CAMP">🚒 NDRF Staging Camps</option>
              </select>
            </div>

            {/* Facility Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '740px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredFacilities.map(fac => {
                const isHosp = fac.facility_type === 'HOSPITAL';
                const isShelter = fac.facility_type === 'SHELTER';
                return (
                  <div
                    key={fac.id}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #fed7aa',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            background: isHosp ? '#e0f2fe' : (isShelter ? '#dcfce7' : '#ffedd5'),
                            color: isHosp ? '#0284c7' : (isShelter ? '#16a34a' : '#ea580c'),
                            border: `1px solid ${isHosp ? '#7dd3fc' : (isShelter ? '#86efac' : '#fdba74')}`,
                            padding: '2px 8px',
                            borderRadius: '5px',
                            fontSize: '0.66rem',
                            fontWeight: 800
                          }}>
                            {isHosp ? '🏥 HOSPITAL' : (isShelter ? '🏠 RELIEF SHELTER' : '🚒 NDRF CAMP')}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700 }}>● {fac.status}</span>
                        </div>
                        <h4 style={{ margin: '6px 0 2px 0', fontSize: '0.96rem', color: '#0f172a', fontWeight: 800 }}>
                          {fac.name}
                        </h4>
                        <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          📍 {fac.district}, {fac.state}
                        </span>
                      </div>

                      {fac.distance_km !== undefined && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ea580c' }}>
                            {fac.distance_km} km
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '2px' }}>~{fac.estimated_drive_time_mins}m drive</div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem', color: '#334155' }}>
                      <span>Capacity: <strong>{fac.capacity} {isHosp ? 'Beds' : 'Persons'}</strong></span>
                      <a
                        href={`tel:${fac.emergency_phone.split('/')[0].trim()}`}
                        style={{ color: '#ea580c', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Phone size={13} /> {fac.emergency_phone}
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default EvacuationPlanningPage;
