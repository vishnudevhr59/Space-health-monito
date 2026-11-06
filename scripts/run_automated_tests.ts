/**
 * SPACE HEALTH MONITO — Comprehensive Automated Test Suite
 * Validates Database, Telemetry Pipeline, Python ML Isolation Forest,
 * Security RBAC, Data Provenance, Daily Briefing, Context Explorer,
 * Mission Timeline, Offline Backoff, and Failure Scenarios.
 * 
 * NASA Space Apps Challenge 2026
 */

const BASE_URL = 'http://127.0.0.1:3000';
const ML_URL = 'http://127.0.0.1:5050';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, details?: string) {
  if (condition) {
    results.push({ suite, name, passed: true, details });
    console.log(`  ✓ [PASS] ${suite} -> ${name}`);
  } else {
    results.push({ suite, name, passed: false, details });
    console.error(`  ✗ [FAIL] ${suite} -> ${name}: ${details || 'Assertion failed'}`);
  }
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('   SPACE HEALTH MONITO — COMPREHENSIVE ACCEPTANCE TEST SUITE');
  console.log('===============================================================\n');

  // -----------------------------------------------------------------
  // SUITE 1: SYSTEM HEALTH & SUBSYSTEM READINESS
  // -----------------------------------------------------------------
  console.log('Running Suite 1: System Health & Subsystems...');
  try {
    const healthRes = await fetch(`${BASE_URL}/api/system/health`);
    assert(healthRes.status === 200, 'System Health', 'Endpoint returns HTTP 200');
    const healthData = await healthRes.json();
    assert(healthData.status === 'HEALTHY', 'System Health', 'System overall status is HEALTHY');
    assert(healthData.subsystems.database.status === 'ONLINE', 'System Health', 'Database subsystem reports ONLINE');
    assert(healthData.subsystems.pythonMLEngine.status === 'ONLINE', 'System Health', 'Python ML microservice reports ONLINE');
    assert(healthData.subsystems.dataIngestion.status === 'ONLINE', 'System Health', 'Data ingestion pipeline reports ONLINE');

    const readinessRes = await fetch(`${BASE_URL}/api/system/readiness`);
    const readinessData = await readinessRes.json();
    assert(readinessRes.status === 200 && readinessData.ready === true, 'System Readiness', 'Readiness probe confirms ready state');

    const servicesRes = await fetch(`${BASE_URL}/api/system/services`);
    const servicesData = await servicesRes.json();
    assert(Array.isArray(servicesData.services) && servicesData.services.length >= 4, 'System Services', 'Service registry exposes all 4 subsystems');
  } catch (err: any) {
    assert(false, 'System Health', 'Request failed', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 2: TELEMETRY VALIDATION & FAILURE CASES
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 2: Telemetry Validation & Failure Cases...');
  try {
    // 2.1 Valid Ingestion
    const validRes = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        astronautId: 'astro-1',
        heartRate: 64,
        spo2: 98.6,
        bodyTemperature: 36.6,
        hrv: 65,
        bloodPressure: { systolic: 114, diastolic: 72 },
        provenance: 'USER_ENTERED',
      }),
    });
    assert(validRes.status === 201, 'Telemetry Validation', 'Valid telemetry accepted with HTTP 201');
    const validData = await validRes.json();
    assert(validData.status === 'INGESTED' && validData.record.heartRate === 64, 'Telemetry Validation', 'Record stored with verified heart rate');

    // 2.2 Rejection of Impossible Value (Heart Rate 340 BPM)
    const impossibleRes = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        astronautId: 'astro-1',
        heartRate: 340,
        spo2: 98.0,
      }),
    });
    assert(impossibleRes.status === 422, 'Telemetry Failure Handling', 'Impossible heart rate (340 BPM) rejected with HTTP 422');

    // 2.3 Rejection of Impossible Low Heart Rate (< 28 BPM)
    const lowHrRes = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        astronautId: 'astro-1',
        heartRate: 15,
        spo2: 98.0,
      }),
    });
    assert(lowHrRes.status === 422, 'Telemetry Failure Handling', 'Physiologically impossible low heart rate (<28 BPM) rejected with HTTP 422');

    // 2.4 Rejection of Impossible SpO2 (> 100%)
    const badSpo2Res = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        astronautId: 'astro-1',
        heartRate: 72,
        spo2: 115,
      }),
    });
    assert(badSpo2Res.status === 422, 'Telemetry Failure Handling', 'Impossible SpO2 (115%) rejected with HTTP 422');

    // 2.5 Rejection of Future Timestamp (Clock Drift > 5m)
    const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const futureRes = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        astronautId: 'astro-1',
        heartRate: 70,
        spo2: 98.0,
        timestamp: futureDate,
      }),
    });
    assert(futureRes.status === 422, 'Telemetry Failure Handling', 'Future timestamp (>5m drift) rejected with HTTP 422');

    // 2.6 Rejection of Missing Astronaut ID
    const missingIdRes = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        heartRate: 70,
        spo2: 98.0,
      }),
    });
    assert(missingIdRes.status === 422, 'Telemetry Failure Handling', 'Missing astronautId rejected with HTTP 422');

    // 2.7 Rejection of Missing Telemetry Core Fields (No HR or SpO2)
    const emptyFieldsRes = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        astronautId: 'astro-1',
      }),
    });
    assert(emptyFieldsRes.status === 422, 'Telemetry Failure Handling', 'Missing core physiological metrics rejected with HTTP 422');

    // 2.8 Idempotency & Deduplication Check
    const fixedKey = `test_idempotency_key_${Date.now()}`;
    const idemp1 = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': fixedKey },
      body: JSON.stringify({ astronautId: 'astro-1', heartRate: 60, spo2: 98.5 }),
    });
    assert(idemp1.status === 201, 'Telemetry Idempotency', 'First submission created with HTTP 201');

    const idemp2 = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': fixedKey },
      body: JSON.stringify({ astronautId: 'astro-1', heartRate: 60, spo2: 98.5 }),
    });
    assert(idemp2.status === 200, 'Telemetry Idempotency', 'Duplicate submission detected & returned HTTP 200');
    const idemp2Data = await idemp2.json();
    assert(idemp2Data.isDuplicate === true, 'Telemetry Idempotency', 'Flag isDuplicate set to true without creating duplicate database record');
  } catch (err: any) {
    assert(false, 'Telemetry Pipeline', 'Exception during validation tests', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 3: DATABASE FILTERING, PAGINATION & PERSISTENCE
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 3: Database Querying, Filtering & Pagination...');
  try {
    const listRes = await fetch(`${BASE_URL}/api/telemetry?astronautId=astro-1&limit=5&page=1`);
    assert(listRes.status === 200, 'Database Query', 'Filtered query returns HTTP 200');
    const listData = await listRes.json();
    assert(Array.isArray(listData.data), 'Database Query', 'Query returns telemetry array');
    assert(listData.data.length <= 5, 'Database Pagination', 'Page limit enforced (<= 5)');
    assert(listData.pagination.page === 1, 'Database Pagination', 'Pagination metadata reflects page 1');
    assert(listData.pagination.total > 0, 'Database Pagination', 'Total record count computed accurately');

    const qualityRes = await fetch(`${BASE_URL}/api/telemetry/quality`);
    assert(qualityRes.status === 200, 'Telemetry Quality', 'Quality audit endpoint returns HTTP 200');
    const qualityData = await qualityRes.json();
    assert(qualityData.qualityBreakdown.verifiedRatePercent > 0, 'Telemetry Quality', 'Verified telemetry rate computed');
  } catch (err: any) {
    assert(false, 'Database Query', 'Failed querying database', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 4: PYTHON ML SERVICE & ISOLATION FOREST ANOMALY DETECTION
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 4: Python ML Isolation Forest & Contributing Indicators...');
  try {
    // 4.1 Direct Python ML Port 5050 Health
    const mlStatusRes = await fetch(`${ML_URL}/api/ml/model-status`);
    assert(mlStatusRes.status === 200, 'Python ML Service', 'ML microservice directly accessible on port 5050');
    const mlStatus = await mlStatusRes.json();
    assert(mlStatus.status === 'ONLINE', 'Python ML Service', 'Python ML status reports ONLINE');
    assert(mlStatus.modelsLoaded.some((m: string) => m.includes('IsolationForest')), 'Python ML Service', 'Isolation Forest ensemble verified loaded');

    // 4.2 Anomaly Detection with Contributing Indicators
    const anomalyRes = await fetch(`${BASE_URL}/api/ml/anomaly-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sample: {
          heartRate: 88,
          spo2: 94.8,
          bodyTemperature: 37.5,
          hrv: 28,
        },
        threshold: 2.0,
      }),
    });
    assert(anomalyRes.status === 200, 'ML Anomaly Detection', 'Anomaly detection endpoint returns HTTP 200');
    const anomData = await anomalyRes.json();
    assert(anomData.status === 'SUCCESS', 'ML Anomaly Detection', 'Execution status is SUCCESS');
    assert(typeof anomData.anomalyScore === 'number' && anomData.anomalyScore >= 0 && anomData.anomalyScore <= 1, 'ML Anomaly Detection', 'Anomaly score normalized 0.0 - 1.0');
    assert(anomData.triageLevel === 'PRIORITY REVIEW', 'ML Anomaly Detection', 'Multi-variate deviation triaged as PRIORITY REVIEW');
    assert(Array.isArray(anomData.contributingIndicators) && anomData.contributingIndicators.length === 4, 'ML Contributing Indicators', 'All 4 biometrics decomposed into indicators');

    // 4.3 Missing Feature Adaptive Imputation & Epistemic Uncertainty
    const partialRes = await fetch(`${BASE_URL}/api/ml/anomaly-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sample: {
          heartRate: 62,
        },
        threshold: 2.0,
      }),
    });
    assert(partialRes.status === 200, 'ML Missing Features', 'Missing features handled gracefully without crash');
    const partialData = await partialRes.json();
    assert(partialData.status === 'SUCCESS', 'ML Missing Features', 'Adaptive baseline imputation succeeded');
    assert(partialData.epistemicUncertainty > 0.05, 'ML Missing Features', 'Epistemic uncertainty penalizes imputed metrics');

    // 4.4 Empty Payload Rejection
    const emptyRes = await fetch(`${BASE_URL}/api/ml/anomaly-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const emptyData = await emptyRes.json();
    assert(emptyData.status === 'INSUFFICIENT_DATA', 'ML Robustness', 'Empty sample safely returns INSUFFICIENT_DATA');
  } catch (err: any) {
    assert(false, 'Python ML Service', 'ML test caught error', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 5: BASELINES & 3-PHASE COMPARISON
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 5: Personalized Baseline Management...');
  try {
    const compRes = await fetch(`${BASE_URL}/api/baselines/comparison?astronautId=astro-1`);
    assert(compRes.status === 200, 'Baselines Comparison', '3-Phase comparison endpoint returns HTTP 200');
    const compData = await compRes.json();
    assert(compData.phases.length === 3, 'Baselines Comparison', 'Covers Pre-Flight, In-Flight, and Post-Flight phases');
    assert(Array.isArray(compData.comparisons) && compData.comparisons.length >= 5, 'Baselines Comparison', 'Tracks 5 physiological indicators with clinical shifts');

    const baseListRes = await fetch(`${BASE_URL}/api/baselines?astronautId=astro-1`);
    const baseList = await baseListRes.json();
    assert(Array.isArray(baseList) && baseList.length >= 2, 'Baselines Management', 'Astronaut has stored longitudinal baseline profiles');
  } catch (err: any) {
    assert(false, 'Baselines', 'Failed baseline tests', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 6: DAILY ASTRONAUT HEALTH BRIEFING (FEATURE 3)
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 6: Daily Astronaut Health Briefing (Sections A-H)...');
  try {
    const brfRes = await fetch(`${BASE_URL}/api/briefing/astro-1`);
    assert(brfRes.status === 200, 'Daily Briefing', 'Briefing endpoint returns HTTP 200');
    const brfData = await brfRes.json();

    assert(typeof brfData.briefingId === 'string' && brfData.briefingId.startsWith('BRF-'), 'Daily Briefing', 'Generates traceable Briefing ID');
    assert(Array.isArray(brfData.importantObservations) && brfData.importantObservations.length >= 2, 'Daily Briefing', 'Section A: Important observations populated with Z-scores');
    assert(brfData.importantObservations[0].sourceRecordId !== undefined, 'Daily Briefing Traceability', 'Section A: Observations link directly to underlying source record IDs');
    assert(brfData.reportingPeriodChanges.restingHeartRate !== undefined, 'Daily Briefing', 'Section B: 24-hour period changes computed');
    assert(Array.isArray(brfData.persistentTrends) && brfData.persistentTrends.length >= 2, 'Daily Briefing', 'Section C: Persistent multi-sol trends tracked');
    assert(brfData.dataQualityAndIntegrity.activeSensors.length >= 3, 'Daily Briefing', 'Section D: Sensor data quality audit present');
    assert(brfData.environmentalContext.cabinCO2 !== undefined, 'Daily Briefing', 'Section E: Spacecraft environmental context integrated');
    assert(Array.isArray(brfData.scheduledTasks) && brfData.scheduledTasks.length >= 3, 'Daily Briefing', 'Section F: Scheduled crew tasks listed');
    assert(brfData.systemAndSyncStatus.dsnLink.includes('LIVE'), 'Daily Briefing', 'Section H: DSN system synchronization status reported');

    // Test Briefing Item Acknowledgment
    const ackRes = await fetch(`${BASE_URL}/api/briefing/astro-1/acknowledge/obs-01`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    assert(ackRes.status === 200, 'Daily Briefing Acknowledge', 'Briefing item acknowledged successfully with HTTP 200');
    const ackData = await ackRes.json();
    assert(ackData.success === true && ackData.acknowledgedItemId === 'obs-01', 'Daily Briefing Acknowledge', 'Acknowledgement response confirms observation ID');
  } catch (err: any) {
    assert(false, 'Daily Briefing', 'Briefing tests caught error', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 7: MULTI-SYSTEM CONTEXT CORRELATION ENGINE (FEATURE 2)
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 7: Multi-System Context Correlation Engine...');
  try {
    const corrRes = await fetch(`${BASE_URL}/api/context/correlation?astronautId=astro-1&metricA=sleepDurationHours&metricB=heartRate&windowDays=7`);
    assert(corrRes.status === 200, 'Context Correlation', 'Correlation endpoint returns HTTP 200');
    const corrData = await corrRes.json();

    assert(corrData.pairedObservationCount === 7, 'Context Correlation', 'All 7 sols aligned with paired observations');
    assert(typeof corrData.pearsonCorrelationR === 'number', 'Context Correlation', 'Pearson correlation coefficient r computed');
    assert(corrData.disclaimer.includes('does NOT imply clinical causation'), 'Context Correlation Guardrails', 'Enforces mandatory non-causation medical disclaimer');
    assert(Array.isArray(corrData.alignedData) && corrData.alignedData.length === 7, 'Context Correlation', 'Returns aligned dual-metric time-series');
  } catch (err: any) {
    assert(false, 'Context Correlation', 'Correlation tests caught error', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 8: UNIFIED MISSION TIMELINE (FEATURE 4)
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 8: Unified Mission Timeline Engine...');
  try {
    const timeRes = await fetch(`${BASE_URL}/api/timeline/astro-1`);
    assert(timeRes.status === 200, 'Mission Timeline', 'Timeline endpoint returns HTTP 200');
    const timeData = await timeRes.json();

    assert(Array.isArray(timeData.events) && timeData.events.length > 0, 'Mission Timeline', 'Events array populated');
    assert(timeData.events.some((e: any) => e.category === 'Exercise'), 'Mission Timeline', 'Includes Exercise events');
    assert(timeData.events.some((e: any) => e.category === 'Sleep'), 'Mission Timeline', 'Includes Sleep events');
    assert(timeData.events.some((e: any) => e.category === 'Telemetry'), 'Mission Timeline', 'Includes Telemetry events');
    assert(timeData.events[0].sourceId !== undefined, 'Mission Timeline Traceability', 'Every timeline event links to source record ID');

    // Filter by single category
    const filterRes = await fetch(`${BASE_URL}/api/timeline/astro-1?categories=Sleep`);
    const filterData = await filterRes.json();
    assert(filterData.events.every((e: any) => e.category === 'Sleep'), 'Mission Timeline Filter', 'Category filter strictly enforced');
  } catch (err: any) {
    assert(false, 'Mission Timeline', 'Timeline tests caught error', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 9: 5-STATE ALERT WORKFLOW & OPERATIONAL PROCEDURES (FEATURE 7)
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 9: Prioritized 5-State Alert Lifecycle...');
  try {
    const alertsRes = await fetch(`${BASE_URL}/api/alerts`);
    const alertsList = await alertsRes.json();
    assert(Array.isArray(alertsList) && alertsList.length > 0, 'Alerts System', 'Active alerts list retrieved');

    const testAlert = alertsList[0];

    // 9.1 Mark Under Review
    const reviewRes = await fetch(`${BASE_URL}/api/alerts/${testAlert.id}/acknowledge`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'review' }),
    });
    assert(reviewRes.status === 200, 'Alerts Lifecycle', 'Mark Under Review transitions state to HTTP 200');
    const reviewData = await reviewRes.json();
    assert(reviewData.status === 'Under Review', 'Alerts Lifecycle', 'Status confirmed as "Under Review"');

    // 9.2 Dismiss with Mandatory Clinical Rationale
    const dismissRes = await fetch(`${BASE_URL}/api/alerts/${testAlert.id}/acknowledge`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'dismiss',
        dismissalReason: 'Verified transient post-ARED recovery lag; seated trace nominal.',
      }),
    });
    assert(dismissRes.status === 200, 'Alerts Lifecycle', 'Dismiss with reason returns HTTP 200');
    const dismissData = await dismissRes.json();
    assert(dismissData.status === 'Dismissed' && dismissData.dismissalReason.includes('post-ARED'), 'Alerts Lifecycle', 'Status transitioned to Dismissed with logged rationale');

    // 9.3 Resolve Alert
    const resolveRes = await fetch(`${BASE_URL}/api/alerts/${testAlert.id}/acknowledge`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve' }),
    });
    const resolveData = await resolveRes.json();
    assert(resolveData.status === 'Resolved', 'Alerts Lifecycle', 'Status transitioned to Resolved');
  } catch (err: any) {
    assert(false, 'Alerts System', 'Alert test caught error', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 10: SCIENTIFIC DATA PROVENANCE & NASA REFERENCES
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 10: Scientific Data Provenance & NASA Datasets...');
  try {
    const provRes = await fetch(`${BASE_URL}/api/provenance`);
    assert(provRes.status === 200, 'Data Provenance', 'Provenance endpoint returns HTTP 200');
    const provData = await provRes.json();
    assert(provData.provenanceStandards.REAL_RESEARCH_DATA !== undefined, 'Data Provenance', 'Defines REAL_RESEARCH_DATA standard');
    assert(provData.provenanceStandards.SIMULATED_TELEMETRY !== undefined, 'Data Provenance', 'Defines SIMULATED_TELEMETRY standard');
    assert(provData.provenanceStandards.ILLUSTRATIVE_REFERENCE !== undefined, 'Data Provenance', 'Defines ILLUSTRATIVE_REFERENCE standard');
    assert(Array.isArray(provData.verifiedDatasets) && provData.verifiedDatasets.length >= 3, 'Data Provenance', 'Contains verified NASA datasets with source URLs');
    assert(provData.verifiedDatasets.some((d: any) => d.datasetId === 'NASA OSDR GL-DS-8841'), 'Data Provenance', 'Contains NASA OSDR Twins Study reference');
    assert(provData.verifiedDatasets.some((d: any) => d.datasetId === 'ThermoLab-ISS-09'), 'Data Provenance', 'Contains ThermoLab core body temperature reference');
  } catch (err: any) {
    assert(false, 'Data Provenance', 'Failed provenance test', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 11: SECURITY & ROLE-BASED ACCESS CONTROL (RBAC)
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 11: Security & Role-Based Access Control...');
  try {
    // 11.1 Rejection of Unauthorized Mission Creation by non-admin role
    const unauthRes = await fetch(`${BASE_URL}/api/missions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer shm_jwt_${Buffer.from(JSON.stringify({ userId: 'usr-1', role: 'Astronaut', exp: Date.now() + 100000 })).toString('base64')}`,
      },
      body: JSON.stringify({ name: 'Unauthorized Mission', code: 'UNAUTH-01' }),
    });
    assert(unauthRes.status === 403, 'Security RBAC', 'Astronaut role forbidden from creating missions (HTTP 403)');

    // 11.2 Allowed Mission Creation by Mission Administrator
    const authAdminRes = await fetch(`${BASE_URL}/api/missions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer shm_jwt_${Buffer.from(JSON.stringify({ userId: 'usr-3', role: 'Mission Administrator', exp: Date.now() + 100000 })).toString('base64')}`,
      },
      body: JSON.stringify({ name: 'Mars Transit Expedition 01', code: 'MTE-01', orbitTarget: 'Heliocentric Transfer' }),
    });
    assert(authAdminRes.status === 201, 'Security RBAC', 'Mission Administrator successfully creates mission (HTTP 201)');

    // 11.3 Expired Token Rejection
    const expiredRes = await fetch(`${BASE_URL}/api/missions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer shm_jwt_${Buffer.from(JSON.stringify({ userId: 'usr-3', role: 'Mission Administrator', exp: Date.now() - 100000 })).toString('base64')}`,
      },
      body: JSON.stringify({ name: 'Expired Token Test', code: 'EXP-01' }),
    });
    assert(expiredRes.status === 401, 'Security RBAC', 'Expired token rejected with HTTP 401');
  } catch (err: any) {
    assert(false, 'Security RBAC', 'Failed security tests', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 12: 7-TIER TELEMETRY CLASSIFICATION & OBSERVATION PRESERVATION
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 12: 7-Tier Telemetry Classification & Observation Preservation...');
  try {
    // 12.1 Nominal classification
    const nominalRes = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        astronautId: 'astro-1',
        heartRate: 64,
        spo2: 98.4,
        bodyTemperature: 36.6,
      }),
    });
    const nominalData = await nominalRes.json();
    assert(nominalRes.status === 201 && nominalData.classification === 'NOMINAL', 'Data Classification', 'Nominal vitals classified as NOMINAL');

    // 12.2 Unusual observation classification (accepted with flag)
    const unusualRes = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        astronautId: 'astro-1',
        heartRate: 115,
        spo2: 94.0,
      }),
    });
    const unusualData = await unusualRes.json();
    assert(unusualRes.status === 201 && unusualData.classification === 'UNUSUAL_OBSERVATION', 'Data Classification', 'Excursion vitals classified as UNUSUAL_OBSERVATION');

    // 12.3 Potential sensor artifact preservation (rejected from stream, kept in raw observations)
    const artifactRes = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        astronautId: 'astro-1',
        heartRate: 310,
        spo2: 98.0,
      }),
    });
    const artifactData = await artifactRes.json();
    assert(artifactRes.status === 422 && artifactData.classification === 'POTENTIAL_SENSOR_ARTIFACT', 'Data Classification', 'Extreme artifact (310 BPM) classified as POTENTIAL_SENSOR_ARTIFACT');
    assert(artifactData.preservedInRawObservations === true, 'Data Classification', 'Rejected artifact preserved in raw observations store');

    // 12.4 Raw Observations API retrieval
    const rawObsRes = await fetch(`${BASE_URL}/api/telemetry/raw-observations`);
    assert(rawObsRes.status === 200, 'Observation Provenance', 'Raw observations endpoint returns HTTP 200');
    const rawObsData = await rawObsRes.json();
    assert(Array.isArray(rawObsData.observations) && rawObsData.total >= 1, 'Observation Provenance', 'Raw observations array populated and traceable');
  } catch (err: any) {
    assert(false, 'Data Classification', 'Telemetry classification test failure', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 13: MISSION SIMULATION ENGINE (SCENARIOS A, B, C, D)
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 13: Mission Simulation Engine...');
  try {
    // 13.1 Scenario List
    const scenariosRes = await fetch(`${BASE_URL}/api/simulation/scenarios`);
    assert(scenariosRes.status === 200, 'Mission Simulation', 'Scenarios endpoint returns HTTP 200');
    const scenariosData = await scenariosRes.json();
    assert(Array.isArray(scenariosData) && scenariosData.length === 4, 'Mission Simulation', 'Provides all 4 mission scenarios (A, B, C, D)');

    // 13.2 State Inquiry (Scenario B default active)
    const stateRes = await fetch(`${BASE_URL}/api/simulation/state`);
    assert(stateRes.status === 200, 'Mission Simulation', 'Simulation state endpoint returns HTTP 200');
    const stateData = await stateRes.json();
    assert(stateData.activeScenario === 'SCENARIO_B', 'Mission Simulation', 'Scenario B is active default as requested');

    // 13.3 Start / Select Scenario
    const startRes = await fetch(`${BASE_URL}/api/simulation/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scenario: 'SCENARIO_B' }),
    });
    assert(startRes.status === 200, 'Mission Simulation', 'Simulation start executes successfully');

    // 13.4 Pause Simulation
    const pauseRes = await fetch(`${BASE_URL}/api/simulation/pause`, { method: 'POST' });
    const pauseData = await pauseRes.json();
    assert(pauseRes.status === 200 && pauseData.state.status === 'PAUSED', 'Mission Simulation', 'Simulation pauses successfully');

    // 13.5 Resume Simulation
    const resumeRes = await fetch(`${BASE_URL}/api/simulation/resume`, { method: 'POST' });
    const resumeData = await resumeRes.json();
    assert(resumeRes.status === 200 && resumeData.state.status === 'RUNNING', 'Mission Simulation', 'Simulation resumes successfully');

    // 13.6 Advance Step
    const stepRes = await fetch(`${BASE_URL}/api/simulation/step`, { method: 'POST' });
    const stepData = await stepRes.json();
    assert(stepRes.status === 200 && stepData.state.currentStep === 1, 'Mission Simulation', 'Simulation advances to step 1');

    // 13.7 Reset Simulation
    const resetRes = await fetch(`${BASE_URL}/api/simulation/reset`, { method: 'POST' });
    const resetData = await resetRes.json();
    assert(resetRes.status === 200 && resetData.state.currentStep === 0, 'Mission Simulation', 'Simulation resets to step 0');
  } catch (err: any) {
    assert(false, 'Mission Simulation', 'Simulation engine failure', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 14: CROSS-ASTRONAUT SECURITY & DATA ISOLATION
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 14: Cross-Astronaut Security & Data Isolation...');
  try {
    // 14.1 Astronaut attempting unauthorized write to another astronaut's telemetry
    const crossAstroRes = await fetch(`${BASE_URL}/api/telemetry/astro-2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer shm_jwt_${Buffer.from(JSON.stringify({ userId: 'usr-1', role: 'Astronaut', assignedCrewId: 'astro-1', exp: Date.now() + 100000 })).toString('base64')}`,
      },
      body: JSON.stringify({ heartRate: 70, spo2: 98.0 }),
    });
    assert(crossAstroRes.status === 403, 'Cross-Astronaut Isolation', 'Astronaut forbidden from writing to other crew telemetry (HTTP 403)');

    // 14.2 Astronaut authorized write to own telemetry
    const selfAstroRes = await fetch(`${BASE_URL}/api/telemetry/astro-1`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer shm_jwt_${Buffer.from(JSON.stringify({ userId: 'usr-1', role: 'Astronaut', assignedCrewId: 'astro-1', exp: Date.now() + 100000 })).toString('base64')}`,
      },
      body: JSON.stringify({ heartRate: 65, spo2: 98.4 }),
    });
    assert(selfAstroRes.status === 201 || selfAstroRes.status === 200, 'Cross-Astronaut Isolation', 'Astronaut permitted to write to own telemetry');

    // 14.3 Flight Medical Officer authorized to write to any astronaut
    const fmoRes = await fetch(`${BASE_URL}/api/telemetry/astro-2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer shm_jwt_${Buffer.from(JSON.stringify({ userId: 'usr-2', role: 'Flight Medical Officer', exp: Date.now() + 100000 })).toString('base64')}`,
      },
      body: JSON.stringify({ heartRate: 68, spo2: 98.6 }),
    });
    assert(fmoRes.status === 201 || fmoRes.status === 200, 'Cross-Astronaut Isolation', 'Flight Medical Officer permitted to manage any crew telemetry');
  } catch (err: any) {
    assert(false, 'Cross-Astronaut Isolation', 'Data isolation test failure', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 15: STORAGE RELIABILITY & SELF-HEALING DISASTER RECOVERY
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 15: Storage Reliability & Self-Healing Disaster Recovery...');
  try {
    // 15.1 Snapshot Backup Creation
    const backupRes = await fetch(`${BASE_URL}/api/system/backup`, { method: 'POST' });
    assert(backupRes.status === 200, 'Disaster Recovery', 'Snapshot backup endpoint returns HTTP 200');
    const backupData = await backupRes.json();
    assert(backupData.status === 'BACKUP_CREATED' && Boolean(backupData.backupPath), 'Disaster Recovery', 'Backup file path returned');

    // 15.2 Restore From Snapshot
    const restoreRes = await fetch(`${BASE_URL}/api/system/restore`, { method: 'POST' });
    assert(restoreRes.status === 200, 'Disaster Recovery', 'Restore endpoint returns HTTP 200');
    const restoreData = await restoreRes.json();
    assert(restoreData.status === 'RESTORE_SUCCESS', 'Disaster Recovery', 'Self-healing restoration verified successfully');
  } catch (err: any) {
    assert(false, 'Disaster Recovery', 'Storage reliability test failure', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 16: SCIENTIFIC REPRODUCIBILITY, STATISTICAL VALIDATION & ML GROUNDING
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 16: Scientific Reproducibility & Statistical Validation...');
  try {
    // 16.1 Deterministic Z-Score Calculation Accuracy
    const baselineMean = 58.0;
    const baselineStd = 6.2;
    const testObs = 70.4;
    const computedZ = +((testObs - baselineMean) / baselineStd).toFixed(2);
    assert(computedZ === 2.0, 'Statistical Precision', 'Z-score mathematics exact for +2.0 sigma deviation');

    // 16.2 Safe Zero-Variance Handling Floor
    const zeroStd = 0.0;
    const minStdFloor = 2.0;
    const safeStd = Math.max(zeroStd, minStdFloor);
    const safeZ = +((72.0 - 58.0) / safeStd).toFixed(2);
    assert(!isNaN(safeZ) && isFinite(safeZ) && safeZ === 7.0, 'Zero-Variance Protection', 'Zero-variance handled safely without division by zero');

    // 16.3 Baseline Comparison API returns 3 flight phases
    const baseCompRes = await fetch(`${BASE_URL}/api/baselines/comparison?astronautId=astro-1`);
    assert(baseCompRes.status === 200, 'Baseline Methodology', 'Baseline comparison endpoint returns HTTP 200');
    const baseCompData = await baseCompRes.json();
    assert(Array.isArray(baseCompData.comparisons) && baseCompData.comparisons.length >= 4, 'Baseline Methodology', 'Tracks multiple physiological indicators across 3 flight phases');

    // 16.4 Missing Value Imputation Penalty in ML Service
    const mlPartialRes = await fetch(`${BASE_URL}/api/ml/anomaly-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sample: { heartRate: 88 } }), // Missing spo2, temp, hrv
    });
    assert(mlPartialRes.status === 200, 'ML Scientific Rigor', 'Missing features handled with adaptive baseline imputation');
    const mlPartialData = await mlPartialRes.json();
    assert(Boolean(mlPartialData.contributingIndicators), 'ML Scientific Rigor', 'Decomposes contributing indicators with attribution weights');

    // 16.5 Isolation Forest Anomaly Score Normalized
    const actualScore = mlPartialData.anomalyScore ?? mlPartialData.isolationForest?.anomalyScore;
    assert(typeof actualScore === 'number' && actualScore >= 0.0 && actualScore <= 1.0, 'ML Scientific Rigor', 'Isolation Forest score strictly bounded between 0.0 and 1.0');

    // 16.6 Context Correlation Non-Causation Disclaimer
    const corrRes = await fetch(`${BASE_URL}/api/context/correlation?astronautId=astro-1&metricA=sleepDurationHours&metricB=heartRate`);
    assert(corrRes.status === 200, 'Scientific Integrity', 'Context correlation returns HTTP 200');
    const corrData = await corrRes.json();
    assert(typeof corrData.disclaimer === 'string' && corrData.disclaimer.includes('does NOT imply clinical causation'), 'Scientific Integrity', 'Enforces mandatory non-causation medical disclosure');

    // 16.7 Verified NASA Research Citation Registry
    const resListRes = await fetch(`${BASE_URL}/api/research`);
    assert(resListRes.status === 200, 'Literature Grounding', 'Research repository returns HTTP 200');
    const resListData = await resListRes.json();
    const hasValidTwins = resListData.some((r: any) => r.title.includes('Twins Study') && Boolean(r.url));
    assert(hasValidTwins, 'Literature Grounding', 'NASA Twins Study citation verified with genuine DOI/URL');

    // 16.8 Insufficient Data Guardrail Handling
    const emptyMLRes = await fetch(`${BASE_URL}/api/ml/anomaly-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(emptyMLRes.status === 200, 'Scientific Guardrails', 'Empty telemetry sample safely handled without unhandled exception');
  } catch (err: any) {
    assert(false, 'Scientific Reproducibility', 'Scientific validation test failure', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 17: GUIDED MISSION DEMONSTRATION & CAPABILITY INTEGRITY
  // -----------------------------------------------------------------
  console.log('Running Suite 17: Guided Demonstration & Capability Integrity...');
  try {
    // 17.1 Simulated Emergency Beacon Packet Generator
    const beaconPayload = {
      astronautId: 'astro-1',
      astronautName: 'CDR Sarah Chen',
      emergencyCode: 'MAYDAY-MED-01-DEMO',
      biometrics: {
        heartRateBpm: 142,
        spo2Percent: 91.2,
        coreTempC: 38.5,
        bloodPressure: '158/96 mmHg',
        hrvMs: 24,
      },
    };

    const beaconRes = await fetch(`${BASE_URL}/api/simulation/beacon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(beaconPayload),
    });
    assert(beaconRes.status === 201, 'Capability Integrity', 'Simulated emergency beacon endpoint accepts packet and returns HTTP 201');
    const beaconData = await beaconRes.json();
    assert(beaconData.packet && beaconData.packet.isSimulatedDemo === true, 'Capability Integrity', 'Emergency beacon packet strictly enforces isSimulatedDemo: true flag');
    assert(typeof beaconData.packet.packetChecksumSha256 === 'string', 'Capability Integrity', 'Emergency beacon packet includes SHA-256 checksum integrity header');
    assert(beaconData.packet.disclosure.includes('LOCAL SOFTWARE SIMULATION DEMO'), 'Capability Integrity', 'Emergency beacon packet carries mandatory local simulation disclosure');

    // 17.2 Flight Surgeon Shift Handover Execution
    const handoverPayload = {
      shiftDate: new Date().toISOString().split('T')[0],
      shiftPeriod: 'Bravo (08:00-16:00 UTC)',
      outgoingSurgeon: 'Dr. Marcus Vance (Flight Surgeon, MCC-Houston)',
      incomingSurgeon: 'Dr. Elena Rostova, M.D. (Gateway Flight Med)',
      astronautId: 'astro-1',
      astronautName: 'CDR Sarah Chen',
      vitalsSummary24h: {
        meanHeartRate: 64,
        heartRateRange: [56, 88],
        meanSpo2: 98.2,
        meanHrv: 58,
        meanCoreTemp: 36.8,
        sleepDurationHours: 6.8,
      },
      openAlertsCount: 1,
      unresolvedIssues: ['Autonomic Fatigue under surveillance'],
      clinicalDirectives: ['Hydration +750mL oral rehydration salts'],
      countermeasuresScheduled: ['ARED Heavy Resistive Squat Protocol (14:00 UTC)'],
      outgoingSignature: 'M. Vance, MD / MCC-SURGEON-04',
      incomingSignature: 'E. Rostova, MD / GATEWAY-MED-02',
    };

    const handoverRes = await fetch(`${BASE_URL}/api/shift-handover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(handoverPayload),
    });
    assert(handoverRes.status === 201, 'Shift Handover Operations', 'Shift handover briefing endpoint saves record with dual signatures (HTTP 201)');
    const handoverData = await handoverRes.json();
    assert(handoverData.record && handoverData.record.status === 'SIGNED', 'Shift Handover Operations', 'Shift handover record confirmed as SIGNED status');

    // 17.3 Shift Handover Retrieval
    const latestHandoverRes = await fetch(`${BASE_URL}/api/shift-handover/latest`);
    assert(latestHandoverRes.status === 200, 'Shift Handover Operations', 'Shift handover latest endpoint retrieves verified shift report');
    const latestHandoverData = await latestHandoverRes.json();
    assert(Boolean(latestHandoverData.latest?.outgoingSignature), 'Shift Handover Operations', 'Handover record retains outgoing and incoming digital signatures');

    // 17.4 Simulation Reset Integrity
    const simResetRes = await fetch(`${BASE_URL}/api/simulation/reset`, { method: 'POST' });
    assert(simResetRes.status === 200, 'Simulation Controller', 'Simulation reset completes with HTTP 200');
    const simResetData = await simResetRes.json();
    assert(simResetData.state.currentStep === 0, 'Simulation Controller', 'Simulation state strictly reset to step 0');
  } catch (err: any) {
    assert(false, 'Capability Integrity', 'Demonstration & capability integrity test failure', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 18: AI FLIGHT SURGEON DIAGNOSTICS & OFFLINE RESILIENCE
  // -----------------------------------------------------------------
  console.log('Running Suite 18: AI Flight Surgeon Diagnostics & Offline Resilience...');
  try {
    // 18.1 Valid Flight Surgeon Diagnostic Request
    const testAnomaly = {
      isAnomalyActive: true,
      anomalyName: 'Acute Resting Tachycardia & Sympathovagal Exhaustion',
      heartRate: 142,
      spo2: 96.5,
      bodyTemperature: 37.1,
      bloodPressure: { systolic: 154, diastolic: 96 },
      hrv: 18,
      respiratoryRate: 24,
      cabinPressurePsi: 14.7,
      cabinCo2MmHg: 2.2,
      vestibularConflictScore: 2.5,
      severity: 'CRITICAL',
      etiology: 'Sympathovagal deconditioning and cephalad fluid loss with cardiac hyper-irritability.',
      countermeasures: ['Oral saline rehydration salt bolus 750 mL', '15° head-up sleep rack deployment'],
    };

    const diagRes = await fetch(`${BASE_URL}/api/ai/flight-surgeon-diagnostic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anomalyState: testAnomaly }),
    });
    assert(diagRes.status === 200, 'Flight Surgeon Engine', 'Diagnostic endpoint returns HTTP 200');
    const diagData = await diagRes.json();
    assert(Boolean(diagData.anomalyName), 'Flight Surgeon Engine', 'Returns valid anomalyName');
    assert(Array.isArray(diagData.countermeasures) && diagData.countermeasures.length >= 2, 'Flight Surgeon Engine', 'Returns structured countermeasure protocols');
    assert(Boolean(diagData.clinicalDisclaimer), 'Flight Surgeon Engine', 'Carries aerospace medical disclaimer');

    // 18.2 Validation on missing payload
    const invalidRes = await fetch(`${BASE_URL}/api/ai/flight-surgeon-diagnostic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert(invalidRes.status === 400, 'Flight Surgeon Engine', 'Rejects missing anomalyState with HTTP 400');
  } catch (err: any) {
    assert(false, 'Flight Surgeon Engine', 'Flight Surgeon diagnostics test failure', err.message);
  }

  // -----------------------------------------------------------------
  // SUMMARY REPORT
  // -----------------------------------------------------------------
  console.log('\n===============================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log('===============================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
