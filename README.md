# SPACE HEALTH MONITO
### AI-Powered Astronaut Health Monitoring & Clinical Decision Support System
**NASA Space Apps Challenge 2026** — *"Monitoring Human Health Beyond Earth."*

---

## 1. System Architecture

```text
                                  +-------------------------------------------------------------+
                                  |                 ASTRONAUT WEARABLES & BIOSENSORS            |
                                  |   (Zephyr BioHarness 4, PulseOx, Core Temp, Dosimeters)     |
                                  +-------------------------------------------------------------+
                                                                 |
                                                                 v
+-------------------------------------------------------------------------------------------------------------------------------+
|                                                CLIENT LAYER (React 19 + TypeScript)                                           |
|  +--------------------------------+  +--------------------------------+  +-------------------------------------------------+  |
|  |       Mission Dashboard        |  |     AI Analysis & Anomaly      |  |           Live Physiological Trends             |  |
|  |  (8 Primary Metric Biosensors) |  |   (Z-Score Slider + XAI Cards) |  |   (24h Recharts with Dashed Reference Baselines)|  |
|  +--------------------------------+  +--------------------------------+  +-------------------------------------------------+  |
|  +-------------------------------------------------------------------------------------------------------------------------+  |
|  |                         Offline Sync Engine (localStorage/IndexedDB Queue + Idempotency Tokens)                         |  |
|  |                         - Distinguishes LIVE, CACHED, PENDING_SYNC, SYNCING, SYNC_FAILED, STALE                         |  |
|  +-------------------------------------------------------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------------------------------------------------------+
                                                                 |
                                            HTTPS / REST (Express Gateway Port 3000)
                                                                 |
                                                                 v
+-------------------------------------------------------------------------------------------------------------------------------+
|                                            PRIMARY BACKEND GATEWAY (Node.js / Express)                                        |
|  +--------------------------+  +--------------------------+  +--------------------------+  +-------------------------------+  |
|  |    Authentication & RBAC |  |   Validation Pipeline    |  |  System Health & Probes  |  |    Google Gemini Client       |  |
|  | (Astronaut, Surgeon, Adm)|  | (Physiological Bounds)   |  | (/api/system/health)     |  | (@google/genai 3.8-flash)     |  |
|  +--------------------------+  +--------------------------+  +--------------------------+  +-------------------------------+  |
+-------------------------------------------------------------------------------------------------------------------------------+
                    |                                                                    |
    Reverse Proxy /api/ml/* (Timeout: 6000ms)                          ACID-Compliant Persistent Storage
                    |                                                                    |
                    v                                                                    v
+-----------------------------------------------+                +-----------------------------------------------+
|         PYTHON ML MICROSERVICE (Port 5050)    |                |          ATOMIC PERSISTENT DATABASE           |
|  +-----------------------------------------+  |                |          (data/space_health_db.json)          |
|  | Pure-Python Vectorized Isolation Forest |  |                |  - 14 Domain Collections                      |
|  | (50 Decision Trees, Subsample 128)      |  |                |  - In-Memory Indexing (ID, Astronaut, Sol)   |
|  +-----------------------------------------+  |                |  - Atomic Temporary Swap File Write (.tmp)    |
|  | Contributing Indicators Attribution     |  |                |  - Idempotency Hash Deduplication             |
|  | (Weight % = z_i^2 / sum(z_j^2) * 100)   |  |                |  - Immutable Audit Logging                    |
|  +-----------------------------------------+  |                +-----------------------------------------------+
|  | Adaptive Baseline Feature Imputation    |  |
|  +-----------------------------------------+  |
|  | NASA OSDR & Twins Study Calibrations    |  |
|  +-----------------------------------------+  |
+-----------------------------------------------+
```

---

## 2. Telemetry Ingestion & Validation Pipeline

All biotelemetry sent to `POST /api/telemetry` is validated against clinical spaceflight physiological envelopes:

| Indicator | Valid Physical Envelope | Clinical Warning Envelope | Unit | Action on Breach |
| :--- | :--- | :--- | :--- | :--- |
| **Resting Heart Rate** | $28 - 240\text{ BPM}$ | $< 45\text{ or } > 110\text{ BPM}$ | $\text{BPM}$ | Rejected if impossible ($422$); Alert created if outside envelope |
| **Arterial Oxygenation ($\text{SpO}_2$)** | $70.0 - 100.0\%$ | $< 95.0\%$ | $\%$ | Rejected if impossible ($422$); Hypoxic alert created |
| **Core Body Temperature** | $33.0 - 42.5^\circ\text{C}$ | $< 35.8\text{ or } > 37.8^\circ\text{C}$ | $^\circ\text{C}$ | Auto-converts $^\circ\text{F}$ if entered; Warning logged |
| **Heart Rate Variability (HRV)** | $5.0 - 250.0\text{ ms}$ | $< 20.0\text{ ms}$ | $\text{ms}$ | Parasympathetic attenuation flag |
| **Blood Pressure** | Sys: $60-240$, Dia: $35-150$ | Sys $> 140$, Dia $> 90$ | $\text{mmHg}$ | Rejected if $\text{Systolic} < \text{Diastolic}$ |

- **Duplicate Prevention:** Incoming measurements compute a SHA-256 idempotency hash `hash(astronautId + timestamp + heartRate + spo2)` or honor client `X-Idempotency-Key` headers to ensure zero ghost duplicates.

---

## 3. Python ML Isolation Forest & Contributing Indicators

- **Model Execution:** `POST /api/ml/anomaly-detection` processes incoming biometrics through a 50-tree randomized Isolation Forest ensemble ($s(x,n) = 2^{-E(h)/c(n)}$).
- **Contributing Indicators Attribution:**
  $$\text{Contribution Weight}_i = \frac{z_i^2}{\sum_{j} z_j^2} \times 100\%$$
- **Adaptive Missing Feature Imputation:** If any feature is unavailable, it is automatically imputed using the astronaut's personalized baseline, while increasing the model's `epistemicUncertainty` penalty score.
- **Insufficient Data Handling:** Empty or malformed inputs return structured `INSUFFICIENT_DATA` envelopes without crashing.

---

## 4. Scientific Data Provenance & Traceability

Every dataset and reference distribution is classified into 5 distinct categories (`GET /api/provenance`):

1. `REAL_RESEARCH_DATA`: Peer-reviewed published scientific data (e.g., NASA OSDR `GL-DS-8841`, Twins Study *Science 2019*, HRP Bone Loss `HRP-BONE-2021`, ThermoLab ISS).
2. `SIMULATED_TELEMETRY`: Synthetically generated biotelemetry calibrated with NASA Human Research Program population parameters.
3. `ILLUSTRATIVE_REFERENCE`: Established clinical benchmarks and flight medicine guidelines used for target goals.
4. `USER_ENTERED`: Manual clinical observations logged on-console by astronaut or flight medical team.
5. `AI_GENERATED`: Inference and decision-support insights formulated by algorithmic models.

---

## 5. Security & Role-Based Access Control (RBAC)

The backend enforces 4 distinct clearance tiers:

- `Astronaut`: Full access to personal telemetry, logging vitals, wellness self-assessments, and MONITO AI. Restricted from modifying mission parameters.
- `Flight Medical Officer`: Full clinical access to all crew members, baseline editing, alert dispositioning, and diagnostic report generation.
- `Mission Administrator`: Full administrative clearance for creating missions, registering crew accounts, and inspecting audit logs.
- `Researcher`: Access restricted to authorized, de-identified research datasets and provenance records.

---

## 6. Offline & Intermittent Connectivity Engine

- **Queue Management:** When network connection drops, vitals are saved to local storage with cryptographically unique idempotency tokens.
- **Automatic Reconnection Flush:** Upon link recovery, the queue automatically syncs with `POST /api/telemetry`.
- **Status Indicators:** Clearly displays `LIVE`, `CACHED (OFFLINE)`, `X QUEUED OFFLINE`, `SYNCHRONIZING`, `SYNC INTERRUPTED`.

---

## 7. Local Development & Testing Instructions

### Prerequisites
- Node.js $\ge 20$ / Bun
- Python 3.10+ (Standard library only; zero external pip dependencies needed)

### Running the Application
```bash
# Start Express and Python ML microservice together:
npm run dev

# The server automatically checks and spawns server_ml.py on port 5050 if not running.
# Access the web application at: http://localhost:3000
```

### Running Automated Test Suite
```bash
npm run test
# Executes 103 comprehensive automated tests across 15 suites verifying:
# - Subsystem Health Probes & Readiness
# - Telemetry Validation & Failure Cases (Clock Drift, Sensor Artifacts, Extreme Limits)
# - Database Querying, Filtering & Pagination
# - Pure-Python Isolation Forest & Epistemic Attribution (Port 5050)
# - Personalized Baseline Management (3-Phase Comparison)
# - Daily Astronaut Health Briefings (Sections A-H)
# - Multi-System Context Correlation Engine (Pearson r + Medical Non-Causation Guardrails)
# - Unified Mission Timeline Engine (Filterable Event Streams)
# - Prioritized 5-State Alert Lifecycle (New, Acknowledged, Under Review, Resolved, Dismissed)
# - Scientific Data Provenance & NASA Datasets (OSDR, Twins Study, ThermoLab)
# - Security Role-Based Access Control (RBAC) & Token Lifecycle
# - 7-Tier Telemetry Classification & Observation Preservation
# - Mission Simulation Engine (Scenarios A, B, C, D)
# - Cross-Astronaut Security & Data Isolation
# - Storage Reliability & Self-Healing Disaster Recovery
```

### Running Production Build & Lint Checks
```bash
npm run build   # Production Vite bundle
npm run lint    # TypeScript typecheck (tsc --noEmit)
```

---

## 8. Integrated Mission Simulation Environment
Accessible via the persistent top Mission Control bar across all views:
- **Scenario A:** Normal Mission Operations (nominal circadian rhythm, 100% verified data quality, zero unsupported alerts).
- **Scenario B (Active Default):** Gradual Health Deviation (subtle autonomic drift -> statistical anomaly score 0.72 -> context correlation with sleep loss and high ARED workload -> alert triage review).
- **Scenario C:** Sensor Failure & Poor Data Quality (optical coupling degradation -> stale packets -> out-of-bounds artifact classified as `POTENTIAL_SENSOR_ARTIFACT` and preserved in raw observations -> sensor offline flag).
- **Scenario D:** Deep-Space Comm Interruption (DSN link cut -> transition to local cached baselines -> offline queueing -> link restoration -> exponential backoff sync with zero duplicates).
