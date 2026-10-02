import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { AlertBanner } from './components/AlertBanner';
import { ExportReportModal } from './components/ExportReportModal';
import { InteractiveMapPage } from './pages/InteractiveMapPage';
import { WhatIfSimulatorPage } from './pages/WhatIfSimulatorPage';
import { EarlyWarningPage } from './pages/EarlyWarningPage';
import { AnalyticsDashboardPage } from './pages/AnalyticsDashboardPage';
import { ModelBenchmarkingPage } from './pages/ModelBenchmarkingPage';
import { PublicAdvisoryPage } from './pages/PublicAdvisoryPage';
import { CitizenReportPage } from './pages/CitizenReportPage';
import { EvacuationPlanningPage } from './pages/EvacuationPlanningPage';
import { GuidedDemoTourModal } from './components/GuidedDemoTourModal';
import api from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState('map');
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [selectedStationForSim, setSelectedStationForSim] = useState(null);
  const [userRole, setUserRole] = useState('ADMIN');

  // Fetch initial alerts
  useEffect(() => {
    fetchLiveAlerts();
    const timer = setInterval(() => {
      fetchLiveAlerts();
    }, 45000);
    return () => clearInterval(timer);
  }, []);

  const fetchLiveAlerts = async () => {
    const alerts = await api.getAlerts({ status: 'ACTIVE' });
    setActiveAlerts(alerts);
  };

  // Web Audio API Synthesized Siren Alert
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + 0.3);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  };

  const handleRefreshTelemetry = async () => {
    setRefreshing(true);
    try {
      const res = await api.refreshTelemetry();
      await fetchLiveAlerts();
      if (res?.new_alerts_triggered > 0) {
        playAlertSound();
      }
    } catch (err) {
      console.warn('Refresh error:', err);
    } finally {
      setTimeout(() => setRefreshing(false), 800);
    }
  };

  const handleSelectStationForSimulator = (station) => {
    setSelectedStationForSim(station);
    setActiveTab('simulator');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeAlertCount={activeAlerts.length}
        onRefreshTelemetry={handleRefreshTelemetry}
        refreshing={refreshing}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenTourModal={() => setIsTourModalOpen(true)}
        userRole={userRole}
        setUserRole={setUserRole}
      />

      {/* Emergency Alert Banner (shown across all pages if critical alerts active) */}
      {activeAlerts.length > 0 && (
        <AlertBanner
          alerts={activeAlerts}
          onViewAlerts={() => setActiveTab('alerts')}
        />
      )}

      {/* Main Content View Switcher */}
      <main style={{ flex: 1 }}>
        {activeTab === 'map' && (
          <InteractiveMapPage
            onSelectStationForSimulator={handleSelectStationForSimulator}
            userRole={userRole}
          />
        )}

        {activeTab === 'citizen-reports' && (
          <CitizenReportPage
            userRole={userRole}
          />
        )}

        {activeTab === 'evacuation' && (
          <EvacuationPlanningPage
            userRole={userRole}
          />
        )}

        {activeTab === 'simulator' && (
          <WhatIfSimulatorPage
            preloadedStation={selectedStationForSim}
            userRole={userRole}
          />
        )}

        {activeTab === 'alerts' && (
          <EarlyWarningPage
            alerts={activeAlerts}
            onAlertAcknowledged={fetchLiveAlerts}
            userRole={userRole}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboardPage
            userRole={userRole}
          />
        )}

        {activeTab === 'benchmark' && (
          <ModelBenchmarkingPage
            userRole={userRole}
          />
        )}

        {activeTab === 'advisory' && (
          <PublicAdvisoryPage
            userRole={userRole}
          />
        )}
      </main>

      {/* 10-Step Guided Demo Presentation Modal */}
      {isTourModalOpen && (
        <GuidedDemoTourModal
          isOpen={isTourModalOpen}
          onClose={() => setIsTourModalOpen(false)}
          onNavigateTab={(tab) => {
            setActiveTab(tab);
          }}
        />
      )}

      {/* Official Disaster Bulletin Export Modal */}
      {isExportModalOpen && (
        <ExportReportModal
          onClose={() => setIsExportModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
