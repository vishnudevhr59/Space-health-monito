/**
 * SPACE HEALTH MONITO — Comprehensive Automated Test Suite
 * Validates Database, Telemetry Pipeline, Python ML Isolation Forest,
 * Security RBAC, Data Provenance, and System Health.
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
  console.log('   SPACE HEALTH MONITO — AUTOMATED ACCEPTANCE TEST SUITE');
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
  // SUITE 2: TELEMETRY VALIDATION & PIPELINE (SECTION 3, 4)
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 2: Telemetry Validation & Ingestion Pipeline...');
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
    assert(validData.status === 'INGESTED' && validData.record.heartRate === 64, 'Telemetry Validation', 'Record correctly stored with verified heart rate');

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
    assert(impossibleRes.status === 422, 'Telemetry Validation', 'Impossible heart rate (340 BPM) rejected with HTTP 422');
    const impossibleData = await impossibleRes.json();
    assert(impossibleData.error.includes('Payload rejected'), 'Telemetry Validation', 'Rejection message clearly states payload rejected');

    // 2.3 Rejection of Impossible SpO2 (> 100%)
    const badSpo2Res = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        astronautId: 'astro-1',
        heartRate: 72,
        spo2: 115,
      }),
    });
    assert(badSpo2Res.status === 422, 'Telemetry Validation', 'Impossible SpO2 (115%) rejected with HTTP 422');

    // 2.4 Rejection of Future Timestamp (Clock Drift > 5m)
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
    assert(futureRes.status === 422, 'Telemetry Validation', 'Future timestamp (>5m drift) rejected with HTTP 422');

    // 2.5 Rejection of Missing Astronaut ID
    const missingIdRes = await fetch(`${BASE_URL}/api/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        heartRate: 70,
        spo2: 98.0,
      }),
    });
    assert(missingIdRes.status === 422, 'Telemetry Validation', 'Missing astronautId rejected with HTTP 422');

    // 2.6 Idempotency & Deduplication Check
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
    assert(idemp2Data.isDuplicate === true, 'Telemetry Idempotency', 'Flag isDuplicate set to true without creating ghost duplicate');
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
    assert(typeof anomData.anomalyScore === 'number' && anomData.anomalyScore >= 0 && anomData.anomalyScore <= 1, 'ML Anomaly Detection', 'Anomaly score is normalized between 0.0 and 1.0');
    assert(anomData.triageLevel === 'PRIORITY REVIEW', 'ML Anomaly Detection', 'Multi-variate deviation correctly triaged as PRIORITY REVIEW');
    assert(Array.isArray(anomData.contributingIndicators) && anomData.contributingIndicators.length === 4, 'ML Contributing Indicators', 'All 4 biometrics decomposed into contributing indicators');
    
    // Check indicator ranking
    const topDriver = anomData.contributingIndicators[0];
    assert(topDriver.contributionWeight > 0 && typeof topDriver.zScore === 'number', 'ML Contributing Indicators', `Primary driver (${topDriver.feature}) has quantified contribution weight (${topDriver.contributionWeight}%) and Z-score (${topDriver.zScore}σ)`);

    // 4.3 Missing Feature Adaptive Imputation
    const partialRes = await fetch(`${BASE_URL}/api/ml/anomaly-detection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sample: {
          heartRate: 62,
          // SpO2, bodyTemperature, HRV missing
        },
        threshold: 2.0,
      }),
    });
    assert(partialRes.status === 200, 'ML Missing Features', 'Missing features handled gracefully without crash');
    const partialData = await partialRes.json();
    assert(partialData.status === 'SUCCESS', 'ML Missing Features', 'Adaptive baseline imputation succeeded');
    assert(partialData.epistemicUncertainty > 0.05, 'ML Missing Features', 'Epistemic uncertainty penalizes imputed metrics');

    // 4.4 Insufficient Data Rejection
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
  // SUITE 5: BASELINES & 3-PHASE COMPARISON (SECTION 6)
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
  // SUITE 6: SCIENTIFIC DATA PROVENANCE & TRACEABILITY (SECTION 7)
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 6: Scientific Data Provenance & Traceability...');
  try {
    const provRes = await fetch(`${BASE_URL}/api/provenance`);
    assert(provRes.status === 200, 'Data Provenance', 'Provenance endpoint returns HTTP 200');
    const provData = await provRes.json();
    assert(provData.provenanceStandards.REAL_RESEARCH_DATA !== undefined, 'Data Provenance', 'Defines REAL_RESEARCH_DATA standard');
    assert(provData.provenanceStandards.SIMULATED_TELEMETRY !== undefined, 'Data Provenance', 'Defines SIMULATED_TELEMETRY standard');
    assert(provData.provenanceStandards.ILLUSTRATIVE_REFERENCE !== undefined, 'Data Provenance', 'Defines ILLUSTRATIVE_REFERENCE standard');
    assert(Array.isArray(provData.verifiedDatasets) && provData.verifiedDatasets.length >= 3, 'Data Provenance', 'Contains verified NASA datasets with source URLs');
    assert(provData.verifiedDatasets.some((d: any) => d.datasetId === 'NASA OSDR GL-DS-8841'), 'Data Provenance', 'Contains NASA OSDR Twins Study dataset reference');
  } catch (err: any) {
    assert(false, 'Data Provenance', 'Failed provenance test', err.message);
  }

  // -----------------------------------------------------------------
  // SUITE 7: SECURITY & ROLE-BASED ACCESS CONTROL (RBAC) (SECTION 12)
  // -----------------------------------------------------------------
  console.log('\nRunning Suite 7: Security & Role-Based Access Control...');
  try {
    // 7.1 Rejection of Unauthorized Mission Creation by non-admin role
    const unauthRes = await fetch(`${BASE_URL}/api/missions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Token for Astronaut role (not Mission Administrator)
        Authorization: `Bearer shm_jwt_${Buffer.from(JSON.stringify({ userId: 'usr-1', role: 'Astronaut', exp: Date.now() + 100000 })).toString('base64')}`,
      },
      body: JSON.stringify({ name: 'Unauthorized Mission', code: 'UNAUTH-01' }),
    });
    assert(unauthRes.status === 403, 'Security RBAC', 'Astronaut role forbidden from creating missions (HTTP 403)');

    // 7.2 Allowed Mission Creation by Mission Administrator
    const authAdminRes = await fetch(`${BASE_URL}/api/missions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer shm_jwt_${Buffer.from(JSON.stringify({ userId: 'usr-3', role: 'Mission Administrator', exp: Date.now() + 100000 })).toString('base64')}`,
      },
      body: JSON.stringify({ name: 'Mars Transit Expedition 01', code: 'MTE-01', orbitTarget: 'Heliocentric Transfer' }),
    });
    assert(authAdminRes.status === 201, 'Security RBAC', 'Mission Administrator successfully creates mission (HTTP 201)');

    // 7.3 Expired Token Rejection
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
