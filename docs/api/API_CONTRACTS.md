# SPACE HEALTH MONITOR — API Contracts & Documentation
**Host:** `http://127.0.0.1:3000` (Reverse Proxied to Python ML at `http://127.0.0.1:5050`)

---

## 1. System & Health Probes

### `GET /api/system/health`
Returns health status of all 5 subsystems:
- **Application:** Port, uptime seconds.
- **Database:** Atomic persistence status, total telemetry record count.
- **Python ML Engine:** Port 5050 readiness, model architecture.
- **Gemini AI:** Online / Offline fallback status.
- **Data Ingestion:** Validation boundary engine status.

### `GET /api/system/readiness`
- **Response 200:** `{ "ready": true, "message": "Space Health Monitor is ready to accept mission telemetry." }`
- **Response 503:** `{ "ready": false, "message": "Database initialization in progress." }`

---

## 2. Telemetry Ingestion & Querying

### `POST /api/telemetry` or `POST /api/telemetry/:astronautId`
- **Headers:** `Content-Type: application/json`, `X-Idempotency-Key` (Optional, auto-generated if omitted).
- **Body:**
```json
{
  "astronautId": "astro-1",
  "heartRate": 68,
  "spo2": 98.4,
  "bodyTemperature": 36.6,
  "hrv": 62,
  "bloodPressure": { "systolic": 114, "diastolic": 72 },
  "respiratoryRate": 14,
  "provenance": "USER_ENTERED"
}
```
- **Validation Rules:**
  - `heartRate`: 28 to 240 BPM (Reject with 422 if outside)
  - `spo2`: 70% to 100% (Reject with 422 if > 100% or < 70%)
  - `bodyTemperature`: 33.0°C to 42.5°C
  - `timestamp`: Reject if clock drift > 5 minutes in future.
- **Response 201 Created:** `{ "status": "INGESTED", "record": {...}, "isDuplicate": false }`
- **Response 200 OK (Duplicate detected):** `{ "status": "DUPLICATE_ACCEPTED", "record": {...}, "isDuplicate": true }`

### `GET /api/telemetry`
- **Query Params:** `astronautId`, `missionId`, `startDate`, `endDate`, `dataQuality`, `provenance`, `page` (default 1), `limit` (default 50).
- **Response 200:** Paginated list with `{ data: [...], pagination: { total, page, limit, totalPages } }`.

---

## 3. Daily Astronaut Health Briefing

### `GET /api/briefing/:astronautId`
Returns deterministic daily health briefing comprising sections A to H:
- `importantObservations`: Array of significant physiological deviations with baseline comparisons.
- `reportingPeriodChanges`: Delta comparison between last 24h and prior 24h (resting HR, SpO2, sleep, exercise).
- `persistentTrends`: Multi-sol longitudinal indicators (HRV sympathetic shift, bone mineral density mitigation).
- `dataQualityAndIntegrity`: Missing sensor counts, unverified readings, sensor status.
- `environmentalContext`: Cabin CO2, cabin temp, cabin pressure, cumulative radiation dose & percentage of mission limit.
- `scheduledTasks`: Next planned countermeasure sessions (ARED, CEVIS, sleep pod ventilation check).
- `unacknowledgedReviewItems`: Active alerts with associated operational checklists.
- `systemAndSyncStatus`: DSN link status, last sync timestamp, offline queue count, Python ML engine status.

### `POST /api/briefing/:astronautId/acknowledge/:itemId`
Acknowledges a clinical observation or checklist item in the briefing.

---

## 4. Multi-System Context Correlation

### `GET /api/context/correlation`
- **Query Params:** `astronautId`, `metricA`, `metricB`, `windowDays`
- **Response 200:**
```json
{
  "astronautId": "astro-1",
  "metricA": "sleepDurationHours",
  "metricB": "heartRate",
  "windowDays": 7,
  "pairedObservationCount": 7,
  "pearsonCorrelationR": -0.68,
  "interpretation": "Moderate negative association observed",
  "missingDataCount": 0,
  "alignedData": [
    { "date": "2026-11-01", "valA": 6.8, "valB": 62 },
    { "date": "2026-11-02", "valA": 5.9, "valB": 68 }
  ],
  "disclaimer": "Statistical correlation does not imply clinical causation. Multi-system spaceflight variables interact under altered gravity and circadian phase shifts."
}
```

---

## 5. Unified Mission Timeline

### `GET /api/timeline/:astronautId`
- **Query Params:** `categories` (comma-separated: `telemetry,sleep,exercise,radiation,environment,alerts,ml`), `limit`
- **Response 200:** Chronologically ordered array of mission events with timestamps, severity, and source references.

---

## 6. Python ML Analytics Engine

### `POST /api/ml/anomaly-detection`
- **Body:** `{ "sample": { "heartRate": 88, "spo2": 94.8, "bodyTemperature": 37.5, "hrv": 28 }, "threshold": 2.0 }`
- **Response 200:**
```json
{
  "status": "SUCCESS",
  "anomalyScore": 0.68,
  "isOutlier": true,
  "triageLevel": "PRIORITY REVIEW",
  "epistemicUncertainty": 0.04,
  "contributingIndicators": [
    { "feature": "hrv", "observedValue": 28, "baselineMean": 65, "zScore": -3.2, "contributionWeight": 58.4, "direction": "REDUCED", "unit": "ms" }
  ]
}
```
