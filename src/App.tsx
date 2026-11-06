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
import { SystemHealthPage } from './pages/SystemHealthPage';
import { MissionSimulationBar } from './components/MissionSimulationBar';
import { LogVitalsModal } from './components/LogVitalsModal';
import { EmergencyBeaconModal } from './components/EmergencyBeaconModal';
import { ShiftHandoverModal } from './components/ShiftHandoverModal';
import { SplashScreen } from './components/SplashScreen';
import { MissionControlTicker } from './components/MissionControlTicker';
import { AnomalyInjectionState, NOMINAL_HEALTH_STATE } from './components/SimulationAnomalyPanel';
import { MissionAuditLogModal } from './components/MissionAuditLogModal';
import { AutonomousSelfHealingBanner } from './components/AutonomousSelfHealingBanner';
import { DemoAssistantToolbar } from './components/DemoAssistantToolbar';
import { useAlertMonitoring } from './hooks/useAlertMonitoring';
import { telemetryStreamEngine } from './services/telemetryStreamEngine';

const isKioskOrDemoReady = (): boolean => {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash.toLowerCase();
  return hash.includes('demo-ready') || hash.includes('kiosk');
};

export default function App() {
  useAlertMonitoring();
  const [showSplash, setShowSplash] = useState<boolean>(() => !isKioskOrDemoReady());
  const [currentTab, setCurrentTab] = useState<string>(() => (isKioskOrDemoReady() ? 'dashboard' : 'landing'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProvenanceModalOpen, setIsProvenanceModalOpen] = useState(false);
  const [isLogVitalsModalOpen, setIsLogVitalsModalOpen] = useState(false);
  const [isEmergencyBeaconOpen, setIsEmergencyBeaconOpen] = useState(false);
  const [isShiftHandoverOpen, setIsShiftHandoverOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [anomalyState, setAnomalyState] = useState<AnomalyInjectionState>(NOMINAL_HEALTH_STATE);

  useEffect(() => {
    const handleHashCheck = () => {
      if (isKioskOrDemoReady()) {
        setShowSplash(false);
        setCurrentTab('dashboard');
        setIsAuthModalOpen(false);
        telemetryStreamEngine.setTargetState(NOMINAL_HEALTH_STATE);
        setAnomalyState(NOMINAL_HEALTH_STATE);
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

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
    action: 'acknowledge' | 'resolve' | 'review' | 'dismiss',
    dismissalReason?: string
  ) => {
    try {
      const res = await fetch(`/api/alerts/${alertId}/acknowledge`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          acknowledgedBy: currentUser.fullName,
          action,
          dismissalReason,
        }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAlerts((prev) =>
          prev.map((a) => (a.id === alertId ? updated : a))
        );
      }
    } catch (err) {
      console.error('Failed to update alert status:', err);
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
      
      {/* CINEMATIC STARTUP SPLASH SCREEN WITH SMOOTH TRANSITION TO LANDING PAGE */}
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}

      {/* ROW 1 & ROW 2: BRAND HEADER & SECONDARY NAVIGATION STRIP */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProvenanceModal={() => setIsProvenanceModalOpen(true)}
        onOpenLogVitals={() => setIsLogVitalsModalOpen(true)}
        onOpenEmergencyBeacon={() => setIsEmergencyBeaconOpen(true)}
        onOpenShiftHandover={() => setIsShiftHandoverOpen(true)}
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
        onSyncOffline={() => {
          offlineSyncService.startBackgroundSync();
          loadInitialData();
        }}
        activeAlertCount={activeAlertCount}
      />

      {/* ROW 3: MISSION CONTROL LIVE TICKER (MET, TDRS Ka-BAND LATENCY, NASA MCC-H / DSN GOLDSTONE GROUND LOCK, ECLSS, STATUS TOGGLE) */}
      <MissionControlTicker
        missionDay={astronaut.missionDay}
        habitatPressurePsi={anomalyState.cabinPressurePsi}
        cabinCo2MmHg={anomalyState.cabinCo2MmHg}
        emergencyStatus={anomalyState.severity}
        onStatusChange={(newStatus) =>
          setAnomalyState((prev) => ({
            ...prev,
            severity: newStatus,
            isAnomalyActive: newStatus !== 'NOMINAL',
            anomalyName: newStatus === 'NOMINAL' ? 'Nominal Operations' : `Manual Emergency State: ${newStatus}`,
          }))
        }
        onOpenAuditModal={() => setIsAuditModalOpen(true)}
      />

      {/* ROW 4: PERSISTENT MISSION CONTROL SIMULATION BAR (SCENARIOS A-D) */}
      <MissionSimulationBar onNavigateTab={(tab) => setCurrentTab(tab)} />

      {/* AUTONOMOUS ANOMALY SELF-HEALING & FAIL-SAFE MITIGATION PROTOCOL ENGINE */}
      <AutonomousSelfHealingBanner />

      {/* ROW 5: MAIN VIEWPORT STAGE */}
      <div className="flex-1 flex relative w-full overflow-x-hidden">
        <main className="w-full flex-1 min-w-0 transition-all duration-300">
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
              anomalyState={anomalyState}
              onInjectAnomaly={setAnomalyState}
              onResetNominal={() => setAnomalyState(NOMINAL_HEALTH_STATE)}
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

          {/* SUBSYSTEM OBSERVABILITY & SYSTEM HEALTH CONSOLE */}
          {currentTab === 'system-health' && (
            <SystemHealthPage />
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

      {/* QUICK ACTION: DIRECT LOG VITALS MODAL */}
      <LogVitalsModal
        isOpen={isLogVitalsModalOpen}
        onClose={() => setIsLogVitalsModalOpen(false)}
        onLogMeasurement={handleLogMeasurement}
        astronautId={astronaut.id}
      />

      {/* QUICK ACTION: EMERGENCY MEDICAL BEACON MODAL */}
      <EmergencyBeaconModal
        isOpen={isEmergencyBeaconOpen}
        onClose={() => setIsEmergencyBeaconOpen(false)}
        astronautName={astronaut.name}
        astronautId={astronaut.id}
      />

      {/* QUICK ACTION / FLIGHT SURGEON: SHIFT HANDOVER BRIEFING MODAL */}
      <ShiftHandoverModal
        isOpen={isShiftHandoverOpen}
        onClose={() => setIsShiftHandoverOpen(false)}
        astronaut={astronaut}
        alerts={alerts}
        currentUserFullName={currentUser.fullName}
      />

      {/* MISSION AUDIT TRAIL LEDGER & DATA EXPORT MODAL */}
      <MissionAuditLogModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
      />

      {/* HACKATHON DEMO ASSISTANT & QUICK-CHECK SCRIPT SUITE */}
      <DemoAssistantToolbar
        currentTab={currentTab}
        onNavigateTab={(tab) => setCurrentTab(tab)}
        astronaut={astronaut}
        telemetry={telemetry}
        sleepRecords={sleepRecords}
        activityRecords={activityRecords}
        radiation={radiation}
        alerts={alerts}
      />

    </div>
  );
}
