# SPACE HEALTH MONITO — System Architecture & Topology

```text
+-----------------------------------------------------------------------------------+
|                        SPACE HEALTH MONITO SYSTEM TOPOLOGY                        |
+-----------------------------------------------------------------------------------+

       +-------------------------------------------------------------+
       |                  REACT 19 SPA CLIENT (VITE)                 |
       |  - Astronaut Dashboard & Live Physiological Trends          |
       |  - Daily Crew Health Briefing (Sections A-H)                |
       |  - Multi-System Context Correlation Explorer                |
       |  - Unified Mission Timeline (Multi-Stream Filtering)        |
       |  - Offline Sync Service (IndexedDB + Exp Backoff + Jitter)  |
       |  - Network Status Indicator (LIVE/CACHED/PENDING/SYNCING)   |
       +------------------------------+------------------------------+
                                      | HTTP REST / JSON-RPC
                                      v
       +-------------------------------------------------------------+
       |               NODE.JS / EXPRESS CORE BACKEND                |
       |  - Security & RBAC Middleware (Astronaut / Surgeon / Admin) |
       |  - Physiological Boundary Validation (28-240 BPM, etc.)     |
       |  - Idempotent Deduplication Engine (SHA-256 Hashing)        |
       |  - Deterministic Daily Briefing Generator                   |
       |  - Multi-System Contextual Correlation Analyzer             |
       |  - Unified Timeline Aggregator                              |
       |  - Subsystem Health & Readiness Probes                      |
       +--------------+------------------------------+---------------+
                      |                              | Reverse Proxy
                      v                              v (/api/ml/*)
       +------------------------------+ +----------------------------+
       |   ACID ATOMIC FILE STORE     | |     PYTHON ML ENGINE       |
       | - atomic .tmp write + rename | | - Vectorized Isolation     |
       | - data/space_health_db.json  | |   Forest on Port 5050      |
       | - In-memory O(1) key indexes | | - Contributing Indicators  |
       | - 14 mission data domains    | | - Dynamic Z-score tuning   |
       +------------------------------+ | - Epistemic uncertainty    |
                                        +----------------------------+
```

## 1. Earth-Independent Resilience
- **Offline First:** Telemetry logging works completely without an internet connection. Records are queued with UUID/timestamp idempotency keys.
- **Exponential Backoff:** If the Deep Space Network (DSN) link suffers an outage or packet drop, the client pauses and retries with exponential backoff:
  $$\text{Delay} = \min(30000, 1000 \times 2^{\text{failures}}) + \text{jitter}(0-500\text{ms})$$
- **Graceful Local Fallback:** When Google Gemini API is offline, MONITO AI switches to the local verified NASA research retrieval engine without stalling the user.
- **Safe Imputation:** If a feature is absent during ML anomaly detection, the Python service applies baseline mean imputation but penalizes the output with explicit epistemic uncertainty, preventing phantom alarms.
