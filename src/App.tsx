import React, { useState, useEffect } from 'react';
import {
  User,
  AstronautProfile,
  HealthMeasurement,
  SleepRecord,
  ActivityRecord,
  RadiationRecord,
  HealthAlert,
  ResearchReference,
} from './types';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { DataProvenanceModal } from './components/DataProvenanceModal';
import { offlineSyncService } from './services/offlineSyncService';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { HealthMonitoringPage } from './pages/HealthMonitoringPage';
import { AiAnalysisPage } from './pages/AiAnalysisPage';
import { MonitoAiPage } from './pages/MonitoAiPage';
import { EnvironmentPage } from './pages/EnvironmentPage';
import { BoneMusclePage } from './pages/BoneMusclePage';
import { SleepWellnessPage } from './pages/SleepWellnessPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { ResearchPage } from './pages/ResearchPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProvenanceModalOpen, setIsProvenanceModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Active User session (Default: CDR Sarah Chen)
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-1',
    email: 'sarah.chen@spacehealth.nasa.gov',
    fullName: 'CDR Sarah Chen, Ph.D.',
    role: 'Astronaut',
    badgeNumber: 'EXP-72-CDR',
    assignedCrewId: 'astro-1',
  });

  // Astronaut Profile
  const [astronaut, setAstronaut] = useState<AstronautProfile>({
    id: 'astro-1',
    userId: 'usr-1',
    name: 'Sarah Chen',
    callsign: 'Nova',
    mission: 'Artemis Gateway Expedition 04',
    destination: 'Lunar Orbital Gateway',
    missionDay: 142,
    totalDaysInSpace: 326,
    bloodType: 'O-Positive',
    age: 38,
    heightCm: 172,
    weightKg: 64.5,
    baselineVitals: {
      restingHeartRate: 58,
      systolicBP: 114,
      diastolicBP: 72,
      spo2: 98.4,
      bodyTempC: 36.6,
      hrvMs: 65,
    },
    radiationCumulativeMSv: 78.4,
    radiationMissionLimitMSv: 250.0,
    boneDensityLossRatePercentPerMonth: 0.85,
    currentStatus: 'Nominal',
  });

  const [telemetry, setTelemetry] = useState<HealthMeasurement[]>([]);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);
  const [radiation, setRadiation] = useState<RadiationRecord[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);
  const [researchList, setResearchList] = useState<ResearchReference[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Fetch
  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [
        telemetryRes,
        sleepRes,
        activityRes,
        radRes,
        alertsRes,
        researchRes,
      ] = await Promise.all([
        fetch(`/api/telemetry/${astronaut.id}`).then((r) => r.json()).catch(() => ({ history: offlineSyncService.getCachedTelemetry() })),
        fetch(`/api/sleep/${astronaut.id}`).then((r) => r.json()).catch(() => []),
        fetch(`/api/activity/${astronaut.id}`).then((r) => r.json()).catch(() => []),
        fetch(`/api/radiation/${astronaut.id}`).then((r) => r.json()).catch(() => ({ records: [] })),
        fetch('/api/alerts').then((r) => r.json()).catch(() => []),
        fetch('/api/research').then((r) => r.json()).catch(() => []),
      ]);

      if (telemetryRes.history && telemetryRes.history.length > 0) {
        setTelemetry(telemetryRes.history);
        offlineSyncService.cacheTelemetry(telemetryRes.history);
      } else {
        const cached = offlineSyncService.getCachedTelemetry();
        if (cached.length > 0) setTelemetry(cached);
      }

      if (Array.isArray(sleepRes)) setSleepRecords(sleepRes);
      if (Array.isArray(activityRes)) setActivityRecords(activityRes);
      if (radRes.records) setRadiation(radRes.records);
      if (Array.isArray(alertsRes)) setAlerts(alertsRes);
      if (Array.isArray(researchRes)) setResearchList(researchRes);
    } catch (err) {
      console.warn('Network unavailable, falling back to local station cache:', err);
      const cached = offlineSyncService.getCachedTelemetry();
      if (cached.length > 0) setTelemetry(cached);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [astronaut.id]);

  // Log new measurement with offline queuing support
  const handleLogMeasurement = async (meas: Partial<HealthMeasurement>) => {
    if (!navigator.onLine) {
      // Offline mode: queue locally with idempotency key
      const queued = offlineSyncService.enqueueMeasurement({
        astronautId: astronaut.id,
        timestamp: new Date().toISOString(),
        heartRate: Number(meas.heartRate) || 68,
        spo2: Number(meas.spo2) || 98.4,
        bodyTemperature: Number(meas.bodyTemperature) || 36.6,
        bloodPressure: meas.bloodPressure,
        hrv: meas.hrv,
        respiratoryRate: meas.respiratoryRate,
      });

      // Optimistically display in UI
      setTelemetry((prev) => [
        ...prev,
        {
          id: queued.idempotencyKey,
          astronautId: astronaut.id,
          timestamp: queued.timestamp,
          heartRate: queued.heartRate,
          spo2: queued.spo2,
          bodyTemperature: queued.bodyTemperature,
          bloodPressure: queued.bloodPressure || { systolic: 114, diastolic: 72 },
          hrv: queued.hrv || 62,
          respiratoryRate: queued.respiratoryRate || 14,
          perfusionIndex: 3.8,
          isSimulated: false,
          dataQuality: 'High' as const,
        },
      ]);
      return;
    }

    try {
      const res = await fetch(`/api/telemetry/${astronaut.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meas),
      });
      if (res.ok) {
        const data = await res.json();
        const record = data.record || data;
        setTelemetry((prev) => [...prev, record]);
        offlineSyncService.cacheTelemetry([...telemetry, record]);
        // Refresh alerts if a threshold was triggered
        fetch('/api/alerts')
          .then((r) => r.json())
          .then((d) => Array.isArray(d) && setAlerts(d));
      } else {
        // Enqueue if server rejected due to temporary upstream issues
        offlineSyncService.enqueueMeasurement({
          astronautId: astronaut.id,
          timestamp: new Date().toISOString(),
          heartRate: Number(meas.heartRate) || 68,
          spo2: Number(meas.spo2) || 98.4,
          bodyTemperature: Number(meas.bodyTemperature) || 36.6,
          bloodPressure: meas.bloodPressure,
          hrv: meas.hrv,
          respiratoryRate: meas.respiratoryRate,
        });
      }
    } catch (err) {
      console.warn('Network error during logging, queued locally:', err);
      offlineSyncService.enqueueMeasurement({
        astronautId: astronaut.id,
        timestamp: new Date().toISOString(),
        heartRate: Number(meas.heartRate) || 68,
        spo2: Number(meas.spo2) || 98.4,
        bodyTemperature: Number(meas.bodyTemperature) || 36.6,
        bloodPressure: meas.bloodPressure,
        hrv: meas.hrv,
        respiratoryRate: meas.respiratoryRate,
      });
    }
  };

  // Log wellness assessment
  const handleLogWellness = async (well: any) => {
    try {
      await fetch(`/api/wellness/${astronaut.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(well),
      });
    } catch (err) {
      console.error('Failed to log wellness:', err);
    }
  };

  // Alert acknowledgment
  const handleAcknowledgeAlert = async (
    alertId: string,
    action: 'acknowledge' | 'resolve'
  ) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acknowledgedBy: currentUser.fullName,
          action,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? updated : a))
        );
      }
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const handleUpdateAstronaut = (updated: Partial<AstronautProfile>) => {
    setAstronaut((prev) => ({
      ...prev,
      ...updated,
    }));
  };

  const activeAlertCount = alerts.filter((a) => a.status === 'Active').length;

  const isConsoleView = currentTab !== 'landing' && currentTab !== 'auth';

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 flex flex-col font-sans selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]">
      
      {/* NAVIGATION BAR */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProvenanceModal={() => setIsProvenanceModalOpen(true)}
        activeAlertCount={activeAlertCount}
      />

      {/* BODY WITH OPTIONAL SIDEBAR FOR CONSOLE VIEWS */}
      <div className="flex-1 flex relative">
        
        {/* SIDEBAR FOR MISSION CONTROL VIEWS */}
        {isConsoleView && (
          <Sidebar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            activeAlertCount={activeAlertCount}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            currentUser={currentUser}
          />
        )}

        {/* MAIN VIEWPORT STAGE */}
        <main
          className={`flex-1 transition-all duration-300 ${
            isConsoleView ? (isSidebarCollapsed ? 'ml-16' : 'ml-16 md:ml-64') : ''
          }`}
        >
          {/* PAGE 1: LANDING PAGE */}
          {currentTab === 'landing' && (
            <LandingPage
              onNavigate={setCurrentTab}
              onOpenAuth={() => setCurrentTab('auth')}
            />
          )}

          {/* PAGE 2: AUTH PAGE */}
          {currentTab === 'auth' && (
            <AuthPage
              onLogin={(newUser) => setCurrentUser(newUser)}
              onNavigate={setCurrentTab}
              currentUser={currentUser}
            />
          )}

          {/* PAGE 3: OVERVIEW / MAIN ASTRONAUT DASHBOARD */}
          {(currentTab === 'overview' || currentTab === 'dashboard') && (
            <DashboardPage
              astronaut={astronaut}
              telemetry={telemetry}
              sleepRecords={sleepRecords}
              activityRecords={activityRecords}
              radiation={radiation}
              alerts={alerts}
              onRefreshTelemetry={loadInitialData}
              onLogMeasurement={handleLogMeasurement}
              onNavigate={setCurrentTab}
            />
          )}

          {/* PAGE 4: HEALTH MONITORING (DETAILED TELEMETRY) */}
          {currentTab === 'monitoring' && (
            <HealthMonitoringPage
              astronaut={astronaut}
              telemetry={telemetry}
              sleepRecords={sleepRecords}
              activityRecords={activityRecords}
            />
          )}

          {/* PAGE 5: AI HEALTH ANALYSIS */}
          {(currentTab === 'ai-analysis' || currentTab === 'analytics') && (
            <AiAnalysisPage
              astronaut={astronaut}
              telemetry={telemetry}
              onNavigate={setCurrentTab}
            />
          )}

          {/* PAGE 6: SPACE ENVIRONMENT */}
          {currentTab === 'environment' && (
            <EnvironmentPage radiation={radiation} />
          )}

          {/* PAGE 7: BONE & MUSCLE HEALTH */}
          {currentTab === 'bone-muscle' && (
            <BoneMusclePage
              astronaut={astronaut}
              activityRecords={activityRecords}
            />
          )}

          {/* PAGE 8: SLEEP & WELLNESS */}
          {currentTab === 'sleep-wellness' && (
            <SleepWellnessPage
              astronaut={astronaut}
              sleepRecords={sleepRecords}
              onLogWellness={handleLogWellness}
            />
          )}

          {/* PAGE 9: MONITO AI ASSISTANT */}
          {currentTab === 'monito-ai' && (
            <MonitoAiPage
              astronaut={astronaut}
              telemetry={telemetry}
            />
          )}

          {/* PAGE 10: HEALTH REPORTS */}
          {currentTab === 'reports' && (
            <ReportsPage
              astronaut={astronaut}
              telemetry={telemetry}
              sleepRecords={sleepRecords}
              activityRecords={activityRecords}
              radiation={radiation}
              alerts={alerts}
            />
          )}

          {/* PAGE 11: SETTINGS */}
          {currentTab === 'settings' && (
            <SettingsPage
              astronaut={astronaut}
              currentUser={currentUser}
              onUpdateAstronaut={handleUpdateAstronaut}
            />
          )}

          {/* ALERTS SYSTEM */}
          {currentTab === 'alerts' && (
            <AlertsPage
              alerts={alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
            />
          )}

          {/* NASA RESEARCH REPOSITORY */}
          {currentTab === 'research' && (
            <ResearchPage researchList={researchList} />
          )}
        </main>
      </div>

      {/* MISSION CONTROL FOOTER */}
      <Footer />

      {/* RBAC AUTHENTICATION & QUICK DEMO ROLE SWITCHER MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={(newUser) => setCurrentUser(newUser)}
      />

      {/* NASA DATA PROVENANCE & SCIENTIFIC TRACEABILITY REGISTRY MODAL */}
      <DataProvenanceModal
        isOpen={isProvenanceModalOpen}
        onClose={() => setIsProvenanceModalOpen(false)}
      />

    </div>
  );
}
