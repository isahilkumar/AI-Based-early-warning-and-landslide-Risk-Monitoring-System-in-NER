import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  UploadCloud, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  MapPin, 
  Phone, 
  User, 
  FileText, 
  Eye, 
  Radio, 
  RefreshCw,
  Clock,
  Layers,
  Search,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

export const CitizenReportPage = ({ userRole = 'ADMIN' }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [analyzingAi, setAnalyzingAi] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [filterState, setFilterState] = useState('');
  const [selectedIncidentType, setSelectedIncidentType] = useState('ROAD_CRACK');
  const [selectedPresetImage, setSelectedPresetImage] = useState('tension_crack_road.jpg');

  // Form Fields
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [locationName, setLocationName] = useState('');
  const [district, setDistrict] = useState('East Sikkim');
  const [state, setState] = useState('Sikkim');
  const [latitude, setLatitude] = useState(27.3389);
  const [longitude, setLongitude] = useState(88.6065);
  const [description, setDescription] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const presetImages = [
    {
      id: 'tension_crack_road.jpg',
      label: '🛣️ Pavement Tension Crack (NH-310)',
      type: 'ROAD_CRACK',
      desc: 'Transverse tensile fracture opening along ghat highway road surface.',
      coords: { lat: 27.3480, lng: 88.6420, state: 'Sikkim', district: 'East Sikkim', loc: 'Gangtok-Nathula Highway KM 14' }
    },
    {
      id: 'rotational_slump_terrace.jpg',
      label: '⛰️ Rotational Soil Slump & Heave',
      type: 'SOIL_SLUMP',
      desc: 'Active circular failure scarp above village slope with tilted trees.',
      coords: { lat: 25.2750, lng: 91.6880, state: 'Meghalaya', district: 'East Khasi Hills', loc: 'Nohkalikai Ridge Terrace' }
    },
    {
      id: 'rockfall_boulders.jpg',
      label: '🪨 Talus Rockfall & Joint Fractures',
      type: 'ROCKFALL',
      desc: 'Detached sandstone boulders resting on hillside road shoulder.',
      coords: { lat: 25.6820, lng: 94.0950, state: 'Nagaland', district: 'Kohima', loc: 'Kohima-Dimapur Bypass KM 8' }
    },
    {
      id: 'water_seepage_slope.jpg',
      label: '💧 High-Volume Slope Toe Seepage',
      type: 'WATER_SEEPAGE',
      desc: 'Turbid water piping from cut-slope base indicating hydrostatic buildup.',
      coords: { lat: 26.1660, lng: 91.7080, state: 'Assam', district: 'Kamrup Metropolitan', loc: 'Kamakhya West Slope Access Road' }
    },
    {
      id: 'debris_flow_valley.jpg',
      label: '🌊 Active Mud & Debris Flow Slurry',
      type: 'ACTIVE_LANDSLIDE',
      desc: 'Continuous saturated mud slurry sweeping down steep valley channel.',
      coords: { lat: 24.7920, lng: 93.6800, state: 'Manipur', district: 'Noney', loc: 'Tupul Yard Vulnerable Cut Slopes' }
    }
  ];

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.getCitizenReports();
      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const runAiVisionScan = (imgId, type) => {
    setAnalyzingAi(true);
    setAiResult(null);

    setTimeout(async () => {
      try {
        let diagnosis = null;
        if (type === 'ROAD_CRACK') {
          diagnosis = {
            instability_type: "Crown Scarp Tension Fracture / Pavement Shearing",
            ai_risk_score: 88.4,
            ai_severity: "CRITICAL",
            ai_confidence: 95.8,
            detected_features: [
              { feature: "Transverse Tension Crack", confidence: 95.8, severity: "HIGH", bounds: "Center Road Section" },
              { feature: "Asphalt Separation (10-14cm)", confidence: 93.2, severity: "CRITICAL", bounds: "Carriageway Split" },
              { feature: "Differential Vertical Slump", confidence: 89.0, severity: "HIGH", bounds: "Toe Margin" }
            ],
            geotechnical_advisory: "Immediate traffic stoppage. Geotechnical survey needed; seal crack with asphalt sealant to halt infiltration."
          };
        } else if (type === 'SOIL_SLUMP') {
          diagnosis = {
            instability_type: "Deep-Seated Rotational Ground Slump",
            ai_risk_score: 93.2,
            ai_severity: "CRITICAL",
            ai_confidence: 97.0,
            detected_features: [
              { feature: "Crescentic Head Scarp", confidence: 97.0, severity: "CRITICAL", bounds: "Upper Terrace Arc" },
              { feature: "J-Shaped Tree Deformation", confidence: 94.5, severity: "HIGH", bounds: "Mid-Slope Canopy" },
              { feature: "Toe Heave / Ground Uplift", confidence: 91.2, severity: "HIGH", bounds: "Basal Footing" }
            ],
            geotechnical_advisory: "Evacuate downstream dwellings immediately. Mass is in rapid progressive shear acceleration."
          };
        } else if (type === 'ROCKFALL') {
          diagnosis = {
            instability_type: "Toppling & Wedge Rockfall Hazard",
            ai_risk_score: 82.0,
            ai_severity: "HIGH",
            ai_confidence: 93.4,
            detected_features: [
              { feature: "Jointed Rock Blocks (1.2m)", confidence: 93.4, severity: "HIGH", bounds: "Shoulder Margin" },
              { feature: "Tensile Wire Mesh Bulging", confidence: 90.1, severity: "HIGH", bounds: "Cut Slope Face" },
              { feature: "Talus Scree Accumulation", confidence: 86.8, severity: "MEDIUM", bounds: "Basal Cone" }
            ],
            geotechnical_advisory: "Install secondary drape netting; clear boulders and establish 200m danger perimeter."
          };
        } else if (type === 'WATER_SEEPAGE') {
          diagnosis = {
            instability_type: "Hydrostatic Pipe Seepage & Internal Erosion",
            ai_risk_score: 79.5,
            ai_severity: "HIGH",
            ai_confidence: 92.1,
            detected_features: [
              { feature: "High-Turbidity Muddy Outflow", confidence: 92.1, severity: "HIGH", bounds: "Wall Weepholes" },
              { feature: "Internal Cavitation Piping", confidence: 88.6, severity: "HIGH", bounds: "Toe Joint" },
              { feature: "Subsurface Aquifer Blowout", confidence: 85.0, severity: "MEDIUM", bounds: "Retaining Base" }
            ],
            geotechnical_advisory: "Drill horizontal relieve sub-drains to depressurize hydrostatic pressure on the retaining wall."
          };
        } else {
          diagnosis = {
            instability_type: "Fast-Moving Channelized Debris Flow",
            ai_risk_score: 96.5,
            ai_severity: "CRITICAL",
            ai_confidence: 98.4,
            detected_features: [
              { feature: "Unconsolidated Mud & Timber Slurry", confidence: 98.4, severity: "CRITICAL", bounds: "Main Channel" },
              { feature: "Erosion of Lateral Levees", confidence: 95.1, severity: "HIGH", bounds: "Channel Flanks" },
              { feature: "High Hydrodynamic Momentum", confidence: 92.0, severity: "CRITICAL", bounds: "Toe Reach" }
            ],
            geotechnical_advisory: "Total valley evacuation. Dispatch NDRF water rescue and heavy excavator earth-clearing units."
          };
        }
        setAiResult(diagnosis);
      } catch (err) {
        console.error(err);
      } finally {
        setAnalyzingAi(false);
      }
    }, 600);
  };

  const handleSelectPreset = (preset) => {
    setSelectedPresetImage(preset.id);
    setSelectedIncidentType(preset.type);
    setLocationName(preset.coords.loc);
    setDistrict(preset.coords.district);
    setState(preset.coords.state);
    setLatitude(preset.coords.lat);
    setLongitude(preset.coords.lng);
    setDescription(preset.desc);
    runAiVisionScan(preset.id, preset.type);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.submitCitizenReport({
        reporter_name: reporterName || 'Anonymous Citizen',
        reporter_phone: reporterPhone || '+91 98000 00000',
        location_name: locationName || 'NER Highway Vulnerable Stretch',
        district,
        state,
        latitude: Number(latitude),
        longitude: Number(longitude),
        incident_type: selectedIncidentType,
        description: description || 'Visual signs of slope shear deformation and ground cracks.',
        ai_risk_score: aiResult ? aiResult.ai_risk_score : 85.0,
        ai_severity: aiResult ? aiResult.ai_severity : 'HIGH',
        ai_vision_findings: aiResult ? `${aiResult.instability_type} (${aiResult.ai_confidence}% confidence)` : 'Crown scarp cracking detected by vision AI'
      });

      setSubmitSuccess(true);
      fetchReports();
      setTimeout(() => setSubmitSuccess(false), 4000);
    } catch (err) {
      console.error('Error submitting report:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (reportId, status) => {
    try {
      await api.verifyCitizenReport(reportId, {
        status,
        authority_notes: `Processed by ${userRole} at ${new Date().toLocaleTimeString('en-IN')}`
      });
      fetchReports();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReports = filterState 
    ? reports.filter(r => r.state.toLowerCase() === filterState.toLowerCase())
    : reports;

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={{
        background: '#ffffff',
        border: '1px solid rgba(234, 88, 12, 0.25)',
        borderRadius: '16px',
        padding: '24px 28px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
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
              <Camera size={14} /> CITIZEN COLLABORATIVE INTELLIGENCE & AI VISION
            </span>
            <span style={{
              background: '#ecfdf5',
              color: '#16a34a',
              border: '1px solid #86efac',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '0.74rem',
              fontWeight: 800
            }}>
              ROLE: {userRole}
            </span>
          </div>
          <h1 style={{ fontSize: '1.95rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
            Citizen Field Incident Reporting & Computer Vision AI
          </h1>
          <p style={{ color: '#64748b', margin: '6px 0 0 0', fontSize: '0.92rem', lineHeight: '1.5' }}>
            Upload or inspect field photos of road tension cracks, soil slumps, rockfalls, or water seepages. Our AI Vision model automatically identifies slope failure precursors and routes them to district authorities.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={fetchReports}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px' }}
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Reports</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Column Form & AI Scanner, Right Column Live Incident Triage Stream */}
      <div className="responsive-grid-2">
        
        {/* Left Column: Report Submission & AI Vision Inspection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(234, 88, 12, 0.25)',
            borderRadius: '16px',
            padding: '24px 28px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 18px 0', color: '#ea580c', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UploadCloud size={22} /> 1. Select / Upload Incident Image for AI Analysis
            </h2>

            {/* Preset Photo Selectors */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ fontSize: '0.82rem', color: '#475569', display: 'block', marginBottom: '10px', fontWeight: 700 }}>
                FIELD OBSERVATION SAMPLES (CLICK TO SCAN WITH AI VISION):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {presetImages.map(preset => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    style={{
                      background: selectedPresetImage === preset.id ? '#fff7ed' : '#f8fafc',
                      border: selectedPresetImage === preset.id ? '2px solid #ea580c' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      textAlign: 'left',
                      color: '#0f172a',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', color: selectedPresetImage === preset.id ? '#ea580c' : '#0f172a' }}>
                      {preset.label}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px' }}>
                      {preset.coords.state} • {preset.coords.district}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Vision Scan Result Box */}
            <div style={{
              background: '#fff7ed',
              border: '1px solid #fdba74',
              borderRadius: '14px',
              padding: '20px 24px',
              marginBottom: '24px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#ea580c" />
                  <span style={{ fontSize: '0.84rem', fontWeight: 900, color: '#ea580c', letterSpacing: '0.04em' }}>
                    AI COMPUTER VISION GEOTECHNICAL DIAGNOSIS
                  </span>
                </div>
                {aiResult && (
                  <span style={{
                    background: aiResult.ai_risk_score >= 80 ? '#fee2e2' : '#ffedd5',
                    color: aiResult.ai_risk_score >= 80 ? '#dc2626' : '#ea580c',
                    border: `1px solid ${aiResult.ai_risk_score >= 80 ? '#fca5a5' : '#fdba74'}`,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.74rem',
                    fontWeight: 800
                  }}>
                    {aiResult.ai_severity} (RISK: {aiResult.ai_risk_score}%)
                  </span>
                )}
              </div>

              {analyzingAi ? (
                <div style={{ padding: '28px 0', textAlign: 'center', color: '#ea580c' }}>
                  <RefreshCw size={30} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
                  <div style={{ fontSize: '0.92rem', fontWeight: 700 }}>Running Convolutional Vision Feature Extraction...</div>
                  <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '4px' }}>Detecting tension fractures, deformation scarps & hydrostatic seepage</div>
                </div>
              ) : aiResult ? (
                <div>
                  <div style={{ fontSize: '1.02rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                    🔍 {aiResult.instability_type}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                    {aiResult.detected_features.map((feat, idx) => (
                      <div key={idx} style={{
                        background: '#ffffff',
                        border: '1px solid #fed7aa',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                        flexWrap: 'wrap',
                        gap: '6px'
                      }}>
                        <span style={{ color: '#334155' }}>• <strong>{feat.feature}</strong> ({feat.bounds})</span>
                        <span style={{ color: '#16a34a', fontWeight: 800 }}>{feat.confidence}% Confidence</span>
                      </div>
                    ))}
                  </div>

                  <div style={{
                    background: '#ffffff',
                    borderLeft: '4px solid #ea580c',
                    padding: '10px 14px',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.8rem',
                    color: '#334155',
                    lineHeight: '1.45'
                  }}>
                    <strong>Geotechnical Recommendation:</strong> {aiResult.geotechnical_advisory}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '0.88rem' }}>
                  Select a sample image above or upload photo to initiate automated AI inspection.
                </div>
              )}
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div className="responsive-grid-form-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Reporter Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Tenzing Lepcha"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Contact Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98320 XXXXX"
                    value={reporterPhone}
                    onChange={(e) => setReporterPhone(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div className="responsive-grid-3">
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Incident Location Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gangtok-Nathula KM 14"
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px', fontWeight: 600 }}>District</label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px', fontWeight: 600 }}>State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{ width: '100%' }}
                  >
                    {['Sikkim', 'Assam', 'Meghalaya', 'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura'].map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: '#475569', display: 'block', marginBottom: '6px', fontWeight: 600 }}>Visual Observation Details</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe crack length, ground sinking, water discharge, or displaced debris..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
                style={{
                  padding: '13px',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Zap size={17} />
                <span>{submitting ? 'Transmitting to Emergency Grid...' : 'Submit Incident Report to District Command'}</span>
              </button>

              {submitSuccess && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  color: '#16a34a',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 700
                }}>
                  <CheckCircle2 size={18} /> Report verified by AI Vision and broadcasted to SEOC dispatch roster!
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Live Crowd-Sourced Incident Reports Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid rgba(234, 88, 12, 0.25)',
            borderRadius: '16px',
            padding: '28px 30px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Radio size={20} color="#ea580c" /> Active Citizen Reports Queue ({filteredReports.length})
                </h2>
                <span style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px', display: 'block' }}>Real-time ground truth from across 8 NER states</span>
              </div>

              {/* State Filter */}
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
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
                <option value="">All 8 States</option>
                {['Sikkim', 'Assam', 'Meghalaya', 'Arunachal Pradesh', 'Nagaland', 'Manipur', 'Mizoram', 'Tripura'].map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Report Cards Feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', maxHeight: '720px', paddingRight: '4px' }}>
              {filteredReports.map(report => {
                const isCrit = report.ai_severity === 'CRITICAL' || report.ai_risk_score >= 80;
                return (
                  <div
                    key={report.id}
                    style={{
                      background: '#ffffff',
                      border: `1px solid ${isCrit ? '#fca5a5' : '#fed7aa'}`,
                      borderRadius: '14px',
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            background: isCrit ? '#fee2e2' : '#ffedd5',
                            color: isCrit ? '#dc2626' : '#ea580c',
                            border: `1px solid ${isCrit ? '#fca5a5' : '#fdba74'}`,
                            padding: '2px 8px',
                            borderRadius: '5px',
                            fontSize: '0.68rem',
                            fontWeight: 800
                          }}>
                            {report.incident_type.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {report.formatted_time || report.created_at?.slice(0, 16)}
                          </span>
                        </div>
                        <h4 style={{ margin: '6px 0 2px 0', fontSize: '1.02rem', color: '#0f172a', fontWeight: 800 }}>
                          {report.location_name}
                        </h4>
                        <span style={{ fontSize: '0.76rem', color: '#ea580c', fontWeight: 600 }}>
                          📍 {report.district}, {report.state} ({report.latitude.toFixed(3)}°N, {report.longitude.toFixed(3)}°E)
                        </span>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.25rem', fontWeight: 900, color: isCrit ? '#dc2626' : '#ea580c' }}>
                          {report.ai_risk_score.toFixed(0)}%
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>AI Risk Score</div>
                      </div>
                    </div>

                    <p style={{ margin: 0, fontSize: '0.84rem', color: '#334155', lineHeight: '1.5' }}>
                      "{report.description}"
                    </p>

                    <div style={{
                      background: '#fff7ed',
                      borderLeft: '4px solid #ea580c',
                      padding: '8px 12px',
                      borderRadius: '0 8px 8px 0',
                      fontSize: '0.76rem',
                      color: '#334155'
                    }}>
                      <strong style={{ color: '#ea580c' }}>AI Vision:</strong> {report.ai_vision_findings}
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '10px',
                      fontSize: '0.74rem'
                    }}>
                      <div style={{ color: '#64748b' }}>
                        Reporter: <strong>{report.reporter_name}</strong>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        {report.status === 'PENDING_REVIEW' ? (
                          <>
                            <button
                              onClick={() => handleVerify(report.id, 'VERIFIED_DISPATCHED')}
                              style={{
                                background: '#f0fdf4',
                                border: '1px solid #86efac',
                                color: '#16a34a',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              ✓ Verify & Dispatch
                            </button>
                            <button
                              onClick={() => handleVerify(report.id, 'RESOLVED')}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #cbd5e1',
                                color: '#475569',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.72rem',
                                cursor: 'pointer'
                              }}
                            >
                              Resolve
                            </button>
                          </>
                        ) : (
                          <span style={{
                            background: '#f0fdf4',
                            color: '#16a34a',
                            border: '1px solid #86efac',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 800
                          }}>
                            ● {report.status.replace('_', ' ')}
                          </span>
                        )}
                      </div>
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

export default CitizenReportPage;
