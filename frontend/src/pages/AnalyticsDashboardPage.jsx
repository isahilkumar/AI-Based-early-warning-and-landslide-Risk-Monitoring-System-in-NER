import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon, 
  History, 
  ShieldAlert, 
  CloudRain, 
  Mountain, 
  Download,
  Search,
  Filter,
  Activity,
  Layers
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import api from '../services/api';

export const AnalyticsDashboardPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [historicalIncidents, setHistoricalIncidents] = useState([]);
  const [historicalComp, setHistoricalComp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Historical table filters
  const [searchIncident, setSearchIncident] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');
  const [selectedSeverityFilter, setSelectedSeverityFilter] = useState('ALL');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    const [summary, trends, incidents, comp] = await Promise.all([
      api.getAnalyticsSummary(),
      api.getAnalyticsTrends(),
      api.getHistoricalIncidents(),
      api.getHistoricalComparison('sk_01')
    ]);
    setSummaryData(summary);
    setTrendsData(trends);
    setHistoricalIncidents(incidents);
    setHistoricalComp(comp);
    setLoading(false);
  };

  const filteredIncidents = historicalIncidents.filter(inc => {
    const matchSearch = !searchIncident || 
      inc.incident_name.toLowerCase().includes(searchIncident.toLowerCase()) ||
      inc.district.toLowerCase().includes(searchIncident.toLowerCase());
    const matchState = selectedStateFilter === 'ALL' || inc.state.toLowerCase() === selectedStateFilter.toLowerCase();
    const matchSeverity = selectedSeverityFilter === 'ALL' || inc.severity === selectedSeverityFilter;
    return matchSearch && matchState && matchSeverity;
  });

  const cards = summaryData?.summary_cards || {
    total_monitored_locations: 37,
    critical_areas: 4,
    high_risk_areas: 8,
    medium_risk_areas: 14,
    low_risk_areas: 11,
    active_alerts: 4,
    average_rainfall_24h: 78.4,
    max_rainfall_24h: 195.0
  };

  const stateData = summaryData?.state_vulnerability_breakdown || [];
  const riskPie = summaryData?.risk_distribution_pie || [
    { name: 'Critical (≥80%)', value: 4, color: '#dc2626' },
    { name: 'High (65-79%)', value: 8, color: '#ea580c' },
    { name: 'Medium (35-64%)', value: 14, color: '#d97706' },
    { name: 'Low (<35%)', value: 11, color: '#16a34a' }
  ];

  const timeline7d = trendsData?.seven_day_timeline || [];
  const radarFactors = trendsData?.susceptibility_radar || [];

  return (
    <div style={{ maxWidth: '1720px', margin: '0 auto', padding: '28px 36px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fdba74', padding: '4px 12px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 800 }}>
            📊 Decision Support System
          </span>
          <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
            Geotechnical Analytics & Historical Landslide Intelligence
          </span>
        </div>
        <h1 style={{ fontSize: '1.95rem', fontWeight: 900, margin: 0, color: '#0f172a' }}>
          Risk Analytics & Landslide Hazard Forecasting
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#475569', margin: '6px 0 0 0', lineHeight: '1.5' }}>
          Regional vulnerability trends, precipitation-risk correlation models, and historical incident records across the 8 NER states.
        </p>
      </div>

      {/* Top 4 KPI StatCards */}
      <div className="stats-grid">
        <StatCard
          title="Monitored Stations"
          value={cards.total_monitored_locations}
          subtitle="All 8 NER States Active"
          icon={Mountain}
          color="#ea580c"
        />
        <StatCard
          title="Critical Zones"
          value={cards.critical_areas}
          subtitle="Failure Probability ≥ 80%"
          icon={ShieldAlert}
          color="#dc2626"
          glow={true}
        />
        <StatCard
          title="High Risk Zones"
          value={cards.high_risk_areas}
          subtitle="Probability 65 – 79%"
          icon={TrendingUp}
          color="#f97316"
        />
        <StatCard
          title="Regional 24h Rain"
          value={cards.average_rainfall_24h}
          unit="mm avg"
          subtitle={`Peak Station: ${cards.max_rainfall_24h} mm`}
          icon={CloudRain}
          color="#0284c7"
        />
      </div>

      {/* Row 1: State Vulnerability Index (Bar) + 7-Day Trend (Area) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)', gap: '28px' }}>
        {/* State Vulnerability Bar Chart */}
        <div className="glass-panel" style={{ padding: '28px 32px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ea580c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
            <BarChart3 size={20} />
            <span>State-by-State Average Landslide Risk Index (%)</span>
          </h3>

          <div style={{ width: '100%', height: '310px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="state" stroke="#64748b" fontSize={12} angle={-25} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                <RechartsTooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #fdba74', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Bar dataKey="average_risk_score" name="Avg Risk (%)" fill="#ea580c" radius={[6, 6, 0, 0]}>
                  {stateData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.average_risk_score >= 70 ? '#dc2626' : (entry.average_risk_score >= 50 ? '#ea580c' : '#16a34a')} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Rainfall vs Risk Trend */}
        <div className="glass-panel" style={{ padding: '28px 32px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ea580c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
            <TrendingUp size={20} />
            <span>7-Day Timeline: Rainfall vs Risk Surge</span>
          </h3>

          <div style={{ width: '100%', height: '310px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline7d} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRisk" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorRain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ea580c" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <RechartsTooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #fdba74', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }} />
                <Area type="monotone" dataKey="avg_risk" name="Avg AI Risk (%)" stroke="#dc2626" fillOpacity={1} fill="url(#colorRisk)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="avg_rainfall" name="Precipitation (mm)" stroke="#ea580c" fillOpacity={1} fill="url(#colorRain)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Risk Pie + Susceptibility Radar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)', gap: '28px' }}>
        {/* Risk Distribution Pie */}
        <div className="glass-panel" style={{ padding: '28px 32px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ea580c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
            <PieIcon size={20} />
            <span>Station Risk Level Distribution</span>
          </h3>

          <div style={{ width: '100%', height: '290px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskPie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #fdba74', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Susceptibility Radar Chart */}
        <div className="glass-panel" style={{ padding: '28px 32px' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#ea580c', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800 }}>
            <ShieldAlert size={20} />
            <span>NER Geotechnical Multi-Factor Radar</span>
          </h3>

          <div style={{ width: '100%', height: '290px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarFactors}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="factor" stroke="#334155" fontSize={11} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#94a3b8" fontSize={10} />
                <Radar name="Regional Factor Weight" dataKey="score" stroke="#ea580c" fill="#ea580c" fillOpacity={0.25} />
                <RechartsTooltip
                  contentStyle={{ background: '#ffffff', border: '1px solid #fdba74', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Historical Baseline vs Live Telemetry Comparison Card */}
      {historicalComp && (
        <div className="glass-panel" style={{ padding: '28px 32px', borderLeft: '5px solid #ea580c' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: 800 }}>
                <TrendingUp size={22} color="#ea580c" />
                <span>Historical Baseline vs Live Monsoonal Telemetry Comparison</span>
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
                Benchmarking current sensor observations against 10-year monsoonal baseline for {historicalComp.location_name}.
              </p>
            </div>
            <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fdba74', padding: '4px 12px', borderRadius: '999px', fontSize: '0.74rem', fontWeight: 800 }}>
              10-YEAR HISTORICAL DIVERGENCE MODEL
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '18px' }}>
            {historicalComp.metrics?.map((m, idx) => (
              <div key={idx} style={{
                background: '#ffffff',
                border: '1px solid #fed7aa',
                borderRadius: '12px',
                padding: '16px 18px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
              }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 700 }}>{m.metric}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', margin: '10px 0 6px 0' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Historical (10y Avg)</div>
                    <div style={{ fontSize: '1.02rem', fontWeight: 700, color: '#475569' }}>{m.historical_baseline}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: '#ea580c', fontWeight: 700 }}>Current Live</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a' }}>{m.current_live}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '8px', fontSize: '0.74rem' }}>
                  <span style={{ color: '#dc2626', fontWeight: 800 }}>Delta: {m.delta_percentage}</span>
                  <span style={{ color: '#ea580c', fontWeight: 600 }}>{m.status}</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: '#fff7ed',
            borderLeft: '4px solid #ea580c',
            padding: '12px 16px',
            borderRadius: '0 8px 8px 0',
            fontSize: '0.82rem',
            color: '#334155',
            lineHeight: '1.45'
          }}>
            💡 <strong>Geotechnical Synthesis:</strong> {historicalComp.conclusion}
          </div>
        </div>
      )}

      {/* Historical Landslide Disasters Repository */}
      <div className="glass-panel" style={{ padding: '28px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: 900 }}>
              <History size={22} color="#ea580c" />
              <span>Historical Landslide Disasters Archive (NER)</span>
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Documented mass movement disasters used for AI calibration & hazard mapping.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Search event name or district..."
                value={searchIncident}
                onChange={(e) => setSearchIncident(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '34px'
                }}
              />
            </div>

            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              style={{ padding: '10px 14px' }}
            >
              <option value="ALL">All States</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Manipur">Manipur</option>
              <option value="Assam">Assam</option>
              <option value="Meghalaya">Meghalaya</option>
              <option value="Mizoram">Mizoram</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>District / State</th>
                <th>Date</th>
                <th>Severity</th>
                <th>Precipitation</th>
                <th>Casualties</th>
                <th>Road Blocked</th>
                <th>Primary Trigger</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map(inc => (
                <tr key={inc.id}>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>
                    {inc.incident_name}
                  </td>
                  <td style={{ color: '#334155' }}>
                    {inc.district}, {inc.state}
                  </td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                    {inc.incident_date}
                  </td>
                  <td>
                    <span className={`badge badge-${inc.severity === 'CATASTROPHIC' || inc.severity === 'MAJOR' ? 'critical' : 'medium'}`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td style={{ color: inc.rainfall_amount_mm >= 200 ? '#dc2626' : '#ea580c', fontWeight: 800 }}>
                    {inc.rainfall_amount_mm} mm
                  </td>
                  <td style={{ color: inc.casualties > 0 ? '#dc2626' : '#64748b', fontWeight: 800 }}>
                    {inc.casualties}
                  </td>
                  <td>
                    {inc.road_blocked_days} days
                  </td>
                  <td style={{ color: '#64748b', maxWidth: '300px' }}>
                    {inc.trigger_type}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
