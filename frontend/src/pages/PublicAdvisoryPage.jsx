import React, { useState } from 'react';
import { 
  PhoneCall, 
  ShieldCheck, 
  AlertTriangle, 
  MapPin, 
  FileText, 
  Send, 
  CheckCircle,
  ExternalLink,
  LifeBuoy,
  Info,
  Flame,
  Copy,
  Check
} from 'lucide-react';

export const PublicAdvisoryPage = ({ userRole = 'ADMIN' }) => {
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [reportForm, setReportForm] = useState({
    locationName: '',
    state: 'Sikkim',
    hazardType: 'Crack on Road / Slope Failure',
    description: '',
    reporterName: '',
    reporterPhone: ''
  });

  const nerEmergencyContacts = [
    { state: 'National Disaster Helpline (NDMA / NDRF)', phone: '1078 / 112', emergency: '24x7 All-India Emergency' },
    { state: 'Sikkim SEOC Control Room (Gangtok)', phone: '03592-202022', emergency: 'State Disaster Management Authority' },
    { state: 'Meghalaya SEOC (Shillong)', phone: '0364-2501001', emergency: 'Revenue & Disaster Management Dept' },
    { state: 'Assam State Disaster Mgmt (Guwahati)', phone: '0361-2237011', emergency: 'ASDMA Emergency Operations' },
    { state: 'Manipur Disaster Helpline (Imphal)', phone: '0385-2450112', emergency: 'Manipur Relief & Disaster Cell' },
    { state: 'Mizoram Disaster Control (Aizawl)', phone: '0389-2334455', emergency: 'Disaster Management & Rehabilitation' },
    { state: 'Nagaland NSDMA (Kohima)', phone: '0370-2270050', emergency: 'Nagaland State Disaster Authority' },
    { state: 'Arunachal Pradesh SDMA (Itanagar)', phone: '0360-2212345', emergency: 'Disaster Management Directorate' },
    { state: 'Tripura TDMA (Agartala)', phone: '0381-2416045', emergency: 'State Emergency Operation Centre' }
  ];

  const handleCitizenSubmit = (e) => {
    e.preventDefault();
    setReportSubmitted(true);
    setTimeout(() => {
      setReportSubmitted(false);
      setReportForm({
        locationName: '',
        state: 'Sikkim',
        hazardType: 'Crack on Road / Slope Failure',
        description: '',
        reporterName: '',
        reporterPhone: ''
      });
    }, 4000);
  };

  const handleCopyPhone = (phone, idx) => {
    navigator.clipboard.writeText(phone.replace(/\s+/g, ''));
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
          <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fdba74', padding: '4px 12px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 800 }}>
            🛡️ Citizen Safety & SOS Directory
          </span>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            Himalayan & North Eastern Region Public Advisory Portal
          </span>
        </div>
        <h1 style={{ fontSize: '1.95rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
          Citizen Safety Advisory & Emergency Directory
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#475569', margin: '6px 0 0 0', lineHeight: '1.5' }}>
          Essential protocols, early warning signs, state emergency helplines, and community hazard safety guide.
        </p>
      </div>

      {/* 2-Column Layout */}
      <div className="responsive-grid-2">
        {/* Left Column: Safety Protocols (Before, During, After) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Before */}
          <div className="glass-panel" style={{ padding: '26px 30px', borderLeft: '5px solid #ea580c' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#ea580c', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
              <Info size={20} />
              <span>Recognizing Pre-Landslide Early Warning Signs</span>
            </h3>
            <ul style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.65', paddingLeft: '22px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Ground Cracks:</strong> New widening fissures appearing on hill slopes, foundations, roads, or pavements.</li>
              <li><strong>Tilting Structures:</strong> Trees, utility poles, retaining walls, or fences tilting downslope.</li>
              <li><strong>Water Discoloration:</strong> Hill streams and mountain springs suddenly turning muddy brown.</li>
              <li><strong>Subsurface Rumbling:</strong> Faint cracking trees or grinding boulder sounds indicating active slope creep.</li>
            </ul>
          </div>

          {/* During */}
          <div className="glass-panel" style={{ padding: '26px 30px', borderLeft: '5px solid #dc2626' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#dc2626', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
              <AlertTriangle size={20} />
              <span>Immediate Actions During a Landslide Incident</span>
            </h3>
            <ul style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.65', paddingLeft: '22px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Evacuate Immediately:</strong> Move laterally away from the direct debris path to stable ridges or spur crests.</li>
              <li><strong>Avoid River Valleys:</strong> Do not seek shelter in low-lying gully channels or riverbeds prone to damming blowouts.</li>
              <li><strong>If Trapped Indoors:</strong> Move to upper floors away from hillside walls, curl into a tight ball and protect your head.</li>
              <li><strong>Do Not Drive Across Mudslides:</strong> Debris flows accelerate rapidly; cars provide zero protection against boulder impacts.</li>
            </ul>
          </div>

          {/* After */}
          <div className="glass-panel" style={{ padding: '26px 30px', borderLeft: '5px solid #16a34a' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#16a34a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 800 }}>
              <ShieldCheck size={20} />
              <span>Post-Disaster Precautions</span>
            </h3>
            <ul style={{ fontSize: '0.88rem', color: '#334155', lineHeight: '1.65', paddingLeft: '22px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Beware of Secondary Slides:</strong> Saturated scarps frequently trigger secondary retrogressive collapses.</li>
              <li><strong>Inspect Damaged Utilities:</strong> Report severed electric cables and broken water mains immediately to local authorities.</li>
              <li><strong>Tune into SEOC Broadcasts:</strong> Rely only on official state disaster management advisories.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: 24/7 State Emergency Helplines Directory */}
        <div>
          <div className="glass-panel" style={{ padding: '28px 32px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: 800 }}>
                <PhoneCall size={22} color="#ea580c" />
                <span>24/7 Emergency Operation Helplines</span>
              </h3>
              <span className="badge badge-orange" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>
                ALL 8 NER STATES
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {nerEmergencyContacts.map((contact, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #fed7aa',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>
                      {contact.state}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>
                      {contact.emergency}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <a
                      href={`tel:${contact.phone.split('/')[0].trim()}`}
                      style={{
                        background: '#fff7ed',
                        border: '1px solid #fdba74',
                        color: '#ea580c',
                        padding: '7px 12px',
                        borderRadius: '7px',
                        fontSize: '0.82rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {contact.phone}
                    </a>
                    <button
                      onClick={() => handleCopyPhone(contact.phone, idx)}
                      style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '7px',
                        padding: '7px 9px',
                        cursor: 'pointer',
                        color: copiedIndex === idx ? '#16a34a' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Copy Number"
                    >
                      {copiedIndex === idx ? <Check size={15} /> : <Copy size={15} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicAdvisoryPage;
