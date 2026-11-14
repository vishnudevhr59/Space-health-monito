/**
 * SPACE HEALTH MONITO — Standalone Software Unit & Component Test Suite
 * Runs fast, isolated tests with zero network or server dependency:
 *  - Unit Suite A: Edge Mission Readiness Score & DTN Packet Serialization
 *  - Unit Suite B: DTN Bundle Queue, Exponential Backoff & SHA-256 Cryptographic Ledger
 *  - Unit Suite C: MQTT IoT Pub/Sub Broker & Telemetry Topic Streaming
 *  - Component Suite D: Responsive Mobile/Tablet/PC UI & Layering Contracts
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import { calculateEdgeReadinessScore, buildDtnTelemetryPacket } from '../src/utils/readinessScore';
import { offlineSyncService } from '../src/services/offlineSyncService';
import { mqttClientService, mqttTopicMatches } from '../src/services/mqttClientService';
import { telemetryStreamEngine } from '../src/services/telemetryStreamEngine';
import { DashboardPage } from '../src/pages/DashboardPage';
import { HealthMonitoringPage } from '../src/pages/HealthMonitoringPage';
import { Navbar } from '../src/components/Navbar';
import { MissionSimulationBar } from '../src/components/MissionSimulationBar';
import { BottomNavBar } from '../src/components/BottomNavBar';
import { DemoAssistantToolbar } from '../src/components/DemoAssistantToolbar';
import { EdgeMissionReadinessCard } from '../src/components/EdgeMissionReadinessCard';
import { D3Sparkline } from '../src/components/D3Sparkline';
import { IotEdgeHardwareGrid } from '../src/components/IotEdgeHardwareGrid';
import { NOMINAL_HEALTH_STATE } from '../src/components/SimulationAnomalyPanel';
import { AstronautProfile, HealthMeasurement, User } from '../src/types';

interface UnitTestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: UnitTestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: string) {
  if (condition) {
    results.push({ suite, name, passed: true, details });
    console.log(`  ✓ [PASS] ${suite} -> ${name}`);
  } else {
    results.push({ suite, name, passed: false, details });
    console.error(`  ✗ [FAIL] ${suite} -> ${name}: ${details || 'Assertion failed'}`);
  }
}

async function runUnitAndComponentTests() {
  console.log('\n===============================================================');
  console.log('   SPACE HEALTH MONITO — UNIT & COMPONENT SOFTWARE TEST SUITE');
  console.log('===============================================================\n');

  // -----------------------------------------------------------------
  // UNIT SUITE A: EDGE MISSION READINESS SCORE & DTN SERIALIZATION
  // -----------------------------------------------------------------
  console.log('Running Unit Suite A: Edge Mission Readiness & DTN Serialization...');
  try {
    // A.1 Nominal baseline yields GREEN (>= 80)
    const nominalEval = calculateEdgeReadinessScore({
      heartRate: 58,
      hrv: 68,
      sleepHours: 7.5,
      sleepEfficiency: 92,
      skinTempC: 36.6,
      baselineHrv: 65,
      baselineRhr: 58,
      baselineTempC: 36.6,
    });
    assert(nominalEval.status === 'GREEN', 'Unit: Edge Readiness', 'Nominal baseline telemetry evaluates to GREEN');
    assert(nominalEval.readinessScore >= 90 && nominalEval.readinessScore <= 100, 'Unit: Edge Readiness', 'Nominal composite score falls in 90-100 optimal band');

    // A.2 Composite weights strictly sum to 100% (35 + 25 + 25 + 15)
    const maxFactorsEval = calculateEdgeReadinessScore({
      heartRate: 50,
      hrv: 100,
      sleepHours: 9.0,
      sleepEfficiency: 100,
      skinTempC: 36.6,
      baselineHrv: 65,
      baselineRhr: 58,
      baselineTempC: 36.6,
    });
    const weightedSum =
      maxFactorsEval.readinessFactors.hrv.weighted_points +
      maxFactorsEval.readinessFactors.rhr.weighted_points +
      maxFactorsEval.readinessFactors.sleep.weighted_points +
      maxFactorsEval.readinessFactors.temp.weighted_points;
    assert(Math.abs(weightedSum - 100) < 0.01, 'Unit: Edge Readiness', '4-factor weighted points sum strictly to 100.0 max');

    // A.3 Moderate fatigue / tachycardia yields YELLOW (60-79.9)
    const warningEval = calculateEdgeReadinessScore({
      heartRate: 72, // +14 bpm -> -56 pts -> RHR score 44
      hrv: 52,       // 0.80x -> HRV score 80
      sleepHours: 6.2,
      sleepEfficiency: 80,
      skinTempC: 36.8,
      baselineHrv: 65,
      baselineRhr: 58,
      baselineTempC: 36.6,
    });
    assert(warningEval.status === 'YELLOW', 'Unit: Edge Readiness', 'Moderate autonomic fatigue evaluates to YELLOW (60-79.9)');
    assert(warningEval.readinessScore >= 60 && warningEval.readinessScore < 80, 'Unit: Edge Readiness', 'YELLOW score accurately bounded [60, 80)');

    // A.4 Severe excursion yields RED (< 60) and clamps lower bounds at 0
    const criticalEval = calculateEdgeReadinessScore({
      heartRate: 118, // +60 bpm -> clamped to 0 RHR score
      hrv: 20,        // depressed HRV
      sleepHours: 4.0,
      sleepEfficiency: 60,
      skinTempC: 38.6, // +2.0°C -> clamped to 0 Temp score
      baselineHrv: 65,
      baselineRhr: 58,
      baselineTempC: 36.6,
    });
    assert(criticalEval.status === 'RED', 'Unit: Edge Readiness', 'Acute cardiorespiratory strain evaluates to RED (<60)');
    assert(criticalEval.rhrScore === 0 && criticalEval.tempScore === 0, 'Unit: Edge Readiness', 'RHR and Thermal scores clamp safely at 0 without going negative');
    assert(criticalEval.readinessScore < 60 && criticalEval.readinessScore >= 0, 'Unit: Edge Readiness', 'RED readiness score bounded [0, 60)');

    // A.5 HRV ceiling clamping at 1.15 ratio -> 100 pts max
    assert(maxFactorsEval.hrvRatio === 1.15 && maxFactorsEval.hrvScore === 100, 'Unit: Edge Readiness', 'HRV ratio caps at 1.15x and HRV factor score caps at 100');

    // A.6 DTN Packet Serialization & Sync Status Flags
    const dtnPacket = buildDtnTelemetryPacket({
      astronautId: 'astro-1',
      crewName: 'Sarah Chen',
      mission: 'Artemis Gateway Expedition 04',
      missionDay: 142,
      locationModule: 'GATEWAY_HALO_01',
      syncStatus: 'PENDING_DOWNLINK',
      heartRate: 58,
      hrv: 68,
      spo2: 98.4,
      respirationRpm: 14,
      skinTempC: 36.6,
      bloodGlucoseMgDl: 94,
      sleepHours: 7.5,
      sleepEfficiency: 92,
      cabinCo2Ppm: 2100,
      evaluation: nominalEval,
      timestamp: new Date('2026-11-14T12:00:00Z'),
    });
    assert(dtnPacket.packet_id.startsWith('ax4-crew-astro-1-20261114') || dtnPacket.packet_id.includes('ax4-crew-astro-1-2026-11-14'), 'Unit: DTN Serialization', 'DTN packet ID embeds crew ID and UTC timestamp');
    assert(dtnPacket.sync_status === 'PENDING_DOWNLINK', 'Unit: DTN Serialization', 'DTN packet preserves PENDING_DOWNLINK custody flag');
    assert(dtnPacket.edge_ai_output.readiness_factors.hrv.weight === '35%', 'Unit: DTN Serialization', 'Serialized edge_ai_output carries weighted Readiness Factors');

    const ackPacket = buildDtnTelemetryPacket({
      astronautId: 'astro-2',
      crewName: 'Marcus Vance',
      mission: 'Artemis Gateway Expedition 04',
      missionDay: 142,
      locationModule: 'ISS_HARMONY_NODE2',
      syncStatus: 'ACK_GROUND',
      heartRate: 62,
      hrv: 64,
      spo2: 98.5,
      respirationRpm: 14,
      skinTempC: 36.6,
      bloodGlucoseMgDl: 92,
      sleepHours: 7.4,
      sleepEfficiency: 90,
      cabinCo2Ppm: 1900,
      evaluation: nominalEval,
    });
    assert(ackPacket.sync_status === 'ACK_GROUND', 'Unit: DTN Serialization', 'DTN packet supports ACK_GROUND ground acknowledgment flag');
  } catch (err: any) {
    assert(false, 'Unit: Edge Readiness', 'Exception in readiness unit tests', err.message);
  }

  // -----------------------------------------------------------------
  // UNIT SUITE B: DTN SYNC, BACKOFF & SHA-256 CRYPTOGRAPHIC LEDGER
  // -----------------------------------------------------------------
  console.log('\nRunning Unit Suite B: DTN Backoff, Occultation & SHA-256 Ledger...');
  try {
    // B.1 Exponential backoff bounds + ceiling protection
    const d0 = offlineSyncService.calculateBackoffDelay(0);
    const d2 = offlineSyncService.calculateBackoffDelay(2);
    const d9 = offlineSyncService.calculateBackoffDelay(9);
    assert(d0 >= 1000 && d0 < 1500, 'Unit: DTN Backoff', 'Failure 0 delay stays within [1000ms, 1500ms) jitter band');
    assert(d2 >= 4000 && d2 < 4500, 'Unit: DTN Backoff', 'Failure 2 delay doubles exponentially to [4000ms, 4500ms)');
    assert(d9 >= 30000 && d9 < 30500, 'Unit: DTN Backoff', 'Failure 9 delay respects 30s ceiling + max 500ms jitter');

    // B.2 Cryptographic SHA-256 determinism & collision resistance
    const h1 = await offlineSyncService.computeSha256('telemetry_frame_alpha');
    const h2 = await offlineSyncService.computeSha256('telemetry_frame_alpha');
    const h3 = await offlineSyncService.computeSha256('telemetry_frame_beta');
    assert(h1.length === 64 && /^[0-9a-f]{64}$/.test(h1), 'Unit: DTN Crypto', 'SHA-256 digest produces valid 64-character hex string');
    assert(h1 === h2 && h1 !== h3, 'Unit: DTN Crypto', 'SHA-256 digest is deterministic and sensitive to payload changes');

    // B.3 Ledger block hash chaining & integrity verification
    const b1 = await offlineSyncService.createLedgerBlock('TELEMETRY_BATCH', [{ hr: 64, spo2: 98.4 }], 'Unit Test Batch 1');
    const b2 = await offlineSyncService.createLedgerBlock('ANOMALY_RECORD', [{ hr: 112, spo2: 94.1 }], 'Unit Test Batch 2');
    assert(b2.previousHash === b1.blockHash, 'Unit: DTN Crypto', 'Consecutive ledger blocks chain previousHash to prior blockHash');
    const integrityOk = await offlineSyncService.verifyLedgerIntegrity();
    assert(integrityOk.isValid === true && integrityOk.blockCount >= 2, 'Unit: DTN Crypto', 'Ledger chain passes cryptographic integrity verification');

    // B.4 Orbital occultation DTN buffer state transition
    const occOn = offlineSyncService.toggleOccultation(true);
    const occState = offlineSyncService.getState();
    assert(occOn === true && occState.isOccultationSimulated === true && occState.isOnline === false, 'Unit: DTN Occultation', 'Occultation mode suspends DSN uplink and sets offline DTN buffering');
    assert(occState.status === 'CACHED' || occState.status === 'PENDING_SYNC', 'Unit: DTN Occultation', 'Occultation sync status transitions to CACHED / PENDING_SYNC');
    offlineSyncService.toggleOccultation(false);
    const liveState = offlineSyncService.getState();
    assert(liveState.isOccultationSimulated === false, 'Unit: DTN Occultation', 'Restoring DSN lock exits orbital occultation mode');
  } catch (err: any) {
    assert(false, 'Unit: DTN Crypto', 'Exception in DTN sync tests', err.message);
  }

  // -----------------------------------------------------------------
  // UNIT SUITE C: MQTT IOT CLIENT & TELEMETRY TOPIC STREAMING
  // -----------------------------------------------------------------
  console.log('\nRunning Unit Suite C: MQTT IoT Client & Telemetry Topic Routing...');
  try {
    // C.1 Standard MQTT + and # wildcard topic matching
    assert(mqttTopicMatches('space/crew/+/vitals', 'space/crew/astro-1/vitals'), 'Unit: MQTT Broker', 'Single-level + wildcard matches valid crew vitals topic');
    assert(!mqttTopicMatches('space/crew/+/vitals', 'space/crew/astro-1/metabolic'), 'Unit: MQTT Broker', 'Single-level + wildcard rejects mismatched leaf topic');
    assert(mqttTopicMatches('space/habitat/#', 'space/habitat/eclss/air'), 'Unit: MQTT Broker', 'Multi-level # wildcard matches nested habitat topics');
    assert(mqttTopicMatches('space/#', 'space/crew/astro-3/vitals'), 'Unit: MQTT Broker', 'Root # wildcard matches multi-level crew telemetry');

    // C.2 Retained message delivery + crew-switch topic propagation
    const receivedVitals: any[] = [];
    const receivedHabitat: any[] = [];
    const unsubV = telemetryStreamEngine.subscribeTopic('space/crew/+/vitals', (m) => receivedVitals.push(m));
    const unsubH = telemetryStreamEngine.subscribeTopic('space/habitat/#', (m) => receivedHabitat.push(m));

    telemetryStreamEngine.setActiveCrewId('astro-3');
    assert(receivedVitals.some((m) => m.topic === 'space/crew/astro-3/vitals'), 'Unit: MQTT Engine', 'Crew ID switch immediately emits crew-scoped vitals topic');
    assert(receivedHabitat.some((m) => m.topic === 'space/habitat/eclss/air'), 'Unit: MQTT Engine', 'Habitat ECLSS air topic delivered via retained/live subscription');
    assert(receivedHabitat.some((m) => m.topic === 'space/habitat/cpds/radiation'), 'Unit: MQTT Engine', 'Habitat CPDS radiation topic delivered via subscription');

    const brokerStats = telemetryStreamEngine.getMqttBrokerStats();
    assert(brokerStats.state === 'CONNECTED', 'Unit: MQTT Engine', 'MQTT client reports CONNECTED broker state');
    assert(brokerStats.messagesPublished >= 4 && brokerStats.retainedTopicsCount >= 4, 'Unit: MQTT Engine', 'Broker stats track published frames and retained topics');

    unsubV();
    unsubH();
    telemetryStreamEngine.setActiveCrewId('astro-1');
  } catch (err: any) {
    assert(false, 'Unit: MQTT Broker', 'Exception in MQTT tests', err.message);
  }

  // -----------------------------------------------------------------
  // COMPONENT SUITE D: RESPONSIVE MOBILE/TABLET/PC & LAYERING CONTRACTS
  // -----------------------------------------------------------------
  console.log('\nRunning Component Suite D: Responsive UI & Z-Index Layering...');
  try {
    const mockAstro: AstronautProfile = {
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
    };

    const mockUser: User = {
      id: 'usr-1',
      email: 'sarah.chen@spacehealth.nasa.gov',
      fullName: 'CDR Sarah Chen, Ph.D.',
      role: 'Astronaut',
      badgeNumber: 'EXP-72-CDR',
      assignedCrewId: 'astro-1',
    };

    const mockTelemetry: HealthMeasurement[] = [
      {
        id: 'm-unit-1',
        astronautId: 'astro-1',
        timestamp: new Date().toISOString(),
        heartRate: 64,
        spo2: 98.4,
        bodyTemperature: 36.6,
        bloodPressure: { systolic: 114, diastolic: 72 },
        hrv: 64,
        respiratoryRate: 14,
        perfusionIndex: 3.8,
        isSimulated: false,
        dataQuality: 'High',
      },
    ];

    // D.1 HealthMonitoringPage mobile stacking + no forced horizontal overflow
    const monHtml = renderToString(
      React.createElement(HealthMonitoringPage, {
        astronaut: mockAstro,
        telemetry: mockTelemetry,
        sleepRecords: [],
        activityRecords: [],
      })
    );
    assert(monHtml.includes('overflow-x-hidden') && monHtml.includes('grid-cols-1'), 'Component: Responsive Monitoring', 'HealthMonitoringPage enforces overflow-x-hidden and responsive vertical stacking');
    assert(monHtml.includes('CSA Bio-Monitor') && monHtml.includes('D3') || monHtml.includes('ESP32-S3'), 'Component: Responsive Monitoring', 'HealthMonitoringPage embeds responsive IoT hardware diagnostics');

    // D.2 D3Sparkline & IotEdgeHardwareGrid responsive SVG & hardware nodes
    const sparkHtml = renderToString(
      React.createElement(D3Sparkline, { data: [60, 62, 64, 63, 65], color: '#00E5FF', unit: 'BPM' })
    );
    assert(sparkHtml.includes('preserveAspectRatio="xMidYMid meet"') && sparkHtml.includes('max-w-full'), 'Component: Responsive Charts', 'D3Sparkline uses aspect-preserving responsive SVG sizing');

    const iotHtml = renderToString(
      React.createElement(IotEdgeHardwareGrid, {
        astronautId: 'astro-1',
        latestFrame: telemetryStreamEngine.getCurrentFrame(),
        transportMode: telemetryStreamEngine.getTransportMode(),
        orbitalSnapshot: null,
      })
    );
    assert(iotHtml.includes('CSA Bio-Monitor Vest') && iotHtml.includes('Cabin Air Quality Node') && iotHtml.includes('MQTT / WebSocket') && iotHtml.includes('DTN Buffer (Blackout)'), 'Component: IoT Hardware Grid', 'IotEdgeHardwareGrid renders wearable BLE/MQTT nodes and protocol inspector');

    // D.3 DashboardPage responsive metric grid & MQTT subscriber panel
    const dashHtml = renderToString(
      React.createElement(DashboardPage, {
        astronaut: mockAstro,
        telemetry: mockTelemetry,
        sleepRecords: [],
        activityRecords: [],
        radiation: [],
        alerts: [],
        onRefreshTelemetry: () => {},
        onLogMeasurement: () => {},
        onNavigate: () => {},
        anomalyState: NOMINAL_HEALTH_STATE,
        onInjectAnomaly: () => {},
        onResetNominal: () => {},
        onSelectAstronaut: () => {},
      })
    );
    assert(dashHtml.includes('grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'), 'Component: Responsive Dashboard', 'Dashboard metric grid scales 1 -> 2 -> 4 columns across mobile/tablet/PC');
    assert(dashHtml.includes('Habitat &amp; Biometric MQTT Topic Stream'), 'Component: Dashboard MQTT', 'Dashboard renders interactive MQTT Topic Subscriber Panel');

    // D.4 EdgeMissionReadinessCard interactive breakdown
    const readinessHtml = renderToString(
      React.createElement(EdgeMissionReadinessCard, { astronaut: mockAstro, latestVital: mockTelemetry[0] })
    );
    assert(readinessHtml.includes('35% Weight') && readinessHtml.includes('25% Weight') && readinessHtml.includes('15% Weight') && readinessHtml.includes('READINESS LEVEL:'), 'Component: Readiness Breakdown', 'EdgeMissionReadinessCard displays 4-factor weighted readiness breakdown');

    // D.5 Z-index & header collapse contract across Navbar, MissionSimulationBar, BottomNavBar, DemoAssistant
    const navHtml = renderToString(
      React.createElement(Navbar, {
        currentTab: 'dashboard',
        onSelectTab: () => {},
        currentUser: mockUser,
        onOpenAuthModal: () => {},
        onOpenProvenanceModal: () => {},
        onOpenLogVitals: () => {},
        onOpenEmergencyBeacon: () => {},
        onSyncOffline: () => {},
        activeAlertCount: 1,
      })
    );
    assert(navHtml.includes('z-[70]') && navHtml.includes('min-w-0 shrink') && navHtml.includes('TAP TO HIDE TOP NAVIGATION BAR'), 'Component: Navbar Layering', 'Navbar sits at z-[70] with shrink-safe logo and one-tap hide pull bar');

    const simHtml = renderToString(React.createElement(MissionSimulationBar, { onNavigateTab: () => {} }));
    assert(!simHtml.includes('sticky top-0') && simHtml.includes('relative z-20'), 'Component: Simulation Bar', 'MissionSimulationBar uses relative z-20 without sticky overlap');

    const botHtml = renderToString(React.createElement(BottomNavBar, { currentTab: 'dashboard', onSelectTab: () => {}, activeAlertCount: 2 }));
    assert(botHtml.includes('z-50') && botHtml.includes('grid-cols-5'), 'Component: Bottom Navigation', 'BottomNavBar uses z-50 with 5 core mobile tabs');

    const demoHtml = renderToString(
      React.createElement(DemoAssistantToolbar, {
        currentTab: 'dashboard',
        onNavigateTab: () => {},
        astronaut: mockAstro,
        telemetry: mockTelemetry,
        sleepRecords: [],
        activityRecords: [],
        radiation: [],
        alerts: [],
      })
    );
    assert(demoHtml.includes('z-30'), 'Component: Demo Assistant', 'Collapsed DemoAssistantToolbar sits at z-30 below Navbar dropdowns');
  } catch (err: any) {
    assert(false, 'Component: Responsive UI', 'Exception during component rendering tests', err.message);
  }

  console.log('\n===============================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`UNIT & COMPONENT TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log('===============================================================\n');

  telemetryStreamEngine.stopStreaming();
  if (failedCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runUnitAndComponentTests();
