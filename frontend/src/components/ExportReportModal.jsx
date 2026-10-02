import React, { useState, useEffect } from 'react';
import { X, Printer, Download, ShieldCheck, AlertOctagon, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import api from '../services/api';

export const ExportReportModal = ({ isOpen = true, onClose }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getExportReport().then(data => {
      setReportData(data);
      setLoading(false);
    });
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    if (!reportData) return;
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LANDSAFE-NER-Advisory-Bulletin-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay">
      <div 
        className="modal-dialog"
        style={{
          maxWidth: '960px',
          background: '#ffffff',
          border: '1px solid #fdba74'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff7ed',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ea580c, #f97316)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={22} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: '#0f172a', fontWeight: 800 }}>Official Disaster Advisory Bulletin</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                North Eastern Region Geospatial AI Early Warning Cell
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={handlePrint} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              <Printer size={15} />
              <span>Print / PDF</span>
            </button>
            <button onClick={handleDownloadJSON} className="btn btn-secondary" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
              <Download size={15} />
              <span>JSON Export</span>
            </button>
            <button 
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                color: '#64748b',
                padding: '8px',
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

        {/* Modal Body / Official Document */}
        <div className="printable-bulletin" style={{ padding: '32px', overflowY: 'auto', flex: 1, color: '#0f172a' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#ea580c', fontSize: '0.95rem' }}>
              Generating official bulletin data...
            </div>
          ) : reportData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Official Seal & Header Banner */}
              <div style={{
                textAlign: 'center',
                borderBottom: '2px solid #ea580c',
                paddingBottom: '20px'
              }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#ea580c', letterSpacing: '0.1em' }}>
                  GOVERNMENT DISASTER MITIGATION & RESILIENCE BULLETIN
                </span>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: '6px 0 4px 0' }}>
                  {reportData.report_title}
                </h2>
                <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                  Issuing Authority: <strong>{reportData.issuing_authority}</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px' }}>
                  Generated on: <strong>{reportData.date_generated}</strong> • Active Model: <strong>{reportData.active_model}</strong>
                </div>
              </div>

              {/* High-Level Executive Summary Metrics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px'
              }}>
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '16px 20px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 700 }}>TOTAL STATIONS MONITORED</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', marginTop: '2px' }}>{reportData.monitored_stations_count}</div>
                </div>
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '16px 20px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.74rem', color: '#dc2626', fontWeight: 700 }}>CRITICAL / HIGH HOTSPOTS</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#dc2626', marginTop: '2px' }}>{reportData.critical_high_count}</div>
                </div>
                <div style={{ background: '#fff7ed', border: '1px solid #fdba74', padding: '16px 20px', borderRadius: '10px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 700 }}>COVERAGE JURISDICTION</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ea580c', marginTop: '6px' }}>All 8 NER States</div>
                </div>
              </div>

              {/* Critical Hotspots Table */}
              <div>
                <h4 style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 800, marginBottom: '14px' }}>
                  1. Monitored Catchments in Emergency / High Risk State (&ge;65% Probability)
                </h4>

                <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ background: '#fff7ed', borderBottom: '1px solid #fed7aa', textAlign: 'left' }}>
                        <th style={{ padding: '12px 14px', color: '#ea580c' }}>Station Name</th>
                        <th style={{ padding: '12px 14px', color: '#ea580c' }}>District / State</th>
                        <th style={{ padding: '12px 14px', color: '#ea580c' }}>Slope / Elevation</th>
                        <th style={{ padding: '12px 14px', color: '#ea580c' }}>24h Rain</th>
                        <th style={{ padding: '12px 14px', color: '#ea580c' }}>AI Risk</th>
                        <th style={{ padding: '12px 14px', color: '#ea580c' }}>Operational Directive</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.critical_stations?.map((st, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>{st.location_name}</td>
                          <td style={{ padding: '12px 14px', color: '#475569' }}>{st.district}, {st.state}</td>
                          <td style={{ padding: '12px 14px', color: '#64748b' }}>{st.slope}° / {st.elevation}m</td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: st.rainfall_24h >= 140 ? '#dc2626' : '#ea580c' }}>
                            {st.rainfall_24h} mm
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span className={`badge badge-${st.risk_level.toLowerCase()}`}>
                              {st.risk_percentage}% ({st.risk_level})
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', color: '#334155' }}>{st.advisory}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Standard Operating Procedures (SOP) */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                padding: '20px 24px',
                borderRadius: '10px'
              }}>
                <h4 style={{ fontSize: '0.98rem', color: '#0f172a', fontWeight: 800, margin: '0 0 12px 0' }}>
                  2. Immediate Mandatory Disaster Management Directives (SOP)
                </h4>
                <ul style={{ margin: 0, paddingLeft: '22px', fontSize: '0.84rem', color: '#334155', lineHeight: 1.65, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {reportData.standard_operating_procedure?.map((sop, idx) => (
                    <li key={idx}>{sop}</li>
                  ))}
                </ul>
              </div>

              {/* Signature / Disclaimer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                borderTop: '1px solid #e2e8f0',
                paddingTop: '20px',
                fontSize: '0.78rem',
                color: '#64748b'
              }}>
                <div>
                  <div>Automated AI Geotechnical Intelligence</div>
                  <div>LANDSAFE-NER Geospatial Engine v2.4</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>Director General of Disaster Operations</div>
                  <div>State Emergency Operation Centre (SEOC)</div>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ExportReportModal;
