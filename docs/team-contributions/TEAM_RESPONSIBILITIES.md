# SPACE HEALTH MONITO — Team Responsibilities & Matrix
**Competition:** NASA Space Apps Challenge 2026  
**Project:** SPACE HEALTH MONITO — AI-Powered Astronaut Health Monitoring & Decision Support System  
**Tagline:** "Monitoring Human Health Beyond Earth."  

---

## 1. Five-Member Team Structure

SPACE HEALTH MONITO is engineered by an interdisciplinary team combining full-stack web engineering, biomedical data science, machine learning, and spaceflight domain expertise.

| Team Member | Role Title | Core Specialization | Primary Deliverables |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Web Developer 1** | Frontend Architecture & Human Factors UI/UX | React 19 SPA, Tailwind CSS design system, Recharts visualizations, Daily Health Briefing, Context Explorer, Offline indicators, WCAG 2.1 AA accessibility. |
| **Member 2** | **Web Developer 2** | Backend & Database Engineering | Node.js/Express REST APIs, ACID atomic persistence (`data/space_health_db.json`), JWT/RBAC security, Telemetry ingestion pipeline, Python ML reverse proxy. |
| **Member 3** | **AI/ML Developer 1** | Biomedical Data Engineering & Provenance | NASA OSDR & Twins Study data exploration, physiological envelope validation (28–240 BPM, SpO2 70–100%), missing data imputation, dataset provenance documentation. |
| **Member 4** | **AI/ML Developer 2** | Machine Learning & Decision Support | Vectorized Isolation Forest anomaly engine (`server_ml.py`), dynamic Z-score sensitivity tuning (1.0–3.5σ), contributing indicators attribution, epistemic uncertainty modeling. |
| **Member 5** | **EC Member** | Spaceflight Systems & Sensor Engineering | Biosensor hardware assumptions (BioHarness-V4, pulse oximetry, CoreTemp), ECLSS cabin environment models, GCR/SPE space radiation limits, operational checklist verification. |

---

## 2. Granular Responsibility Matrix

### WEB DEVELOPER 1 — Frontend Architecture
- **Language & Frameworks:** React 19, TypeScript 5+, Tailwind CSS 4, Recharts, Lucide React.
- **Key Modules Owned:**
  - `src/App.tsx`, `src/components/Navbar.tsx`, `src/components/Sidebar.tsx`
  - `src/components/DailyBriefing.tsx` (Deterministic daily crew clinical briefing)
  - `src/components/ContextExplorer.tsx` (Multi-system physiological & environmental correlation explorer)
  - `src/components/MissionTimeline.tsx` (Integrated multi-stream timeline)
  - `src/components/NetworkStatusIndicator.tsx` (DSN link state & backoff status)
  - `src/components/LivePhysiologicalTrends.tsx` (Real-time telemetry chart with personal baseline overlays)
  - `src/pages/DashboardPage.tsx`, `src/pages/AiAnalysisPage.tsx`, `src/pages/HealthMonitoringPage.tsx`
- **Quality Gates:** Responsive across mobile/desktop, keyboard navigation, contrast ratio ≥ 4.5:1, zero pill-badge clutter, explicit timestamps and medical units.

### WEB DEVELOPER 2 — Backend & Security Engineering
- **Language & Frameworks:** Node.js, Express, TypeScript, tsx.
- **Key Modules Owned:**
  - `server.ts` (API server, reverse proxy, process supervisor)
  - `server/db/models.ts` (Domain schemas for 14 mission collections)
  - `server/db/persistence.ts` (ACID atomic file swapping, in-memory indexes, SHA-256 deduplication)
  - `server/validation/telemetrySchema.ts` (Physiological boundary validation)
  - `src/services/offlineSyncService.ts` (IndexedDB/LocalStorage queue, exponential backoff with jitter)
- **Quality Gates:** Sub-10ms query times, idempotent deduplication via `X-Idempotency-Key`, HTTP 422 for physical impossibilities, HTTP 403 for RBAC violations.

### AI/ML DEVELOPER 1 — Data Engineering & Provenance
- **Key Modules Owned:**
  - `data/space_health_db.json` (Calibrated initial population and mission data)
  - `docs/research/NASA_PROVENANCE_AND_REFERENCES.md` (Scientific validation registry)
  - `server/validation/telemetrySchema.ts` (Physiological range definition and sensor quality metrics)
  - Missing data detection, sensor dropout flagging, and data quality scoring (`VERIFIED`, `ESTIMATED`, `SIMULATED`, `DEGRADED`).
- **Quality Gates:** Strict traceability to NASA OSDR (OSD-8841), NASA HRP (Human Research Roadmap), and peer-reviewed aerospace publications.

### AI/ML DEVELOPER 2 — Machine Learning & Explainable AI
- **Language & Libraries:** Python 3 (Pure-Python vectorized algorithms; no heavy C-dependencies needed for runtime portability), JSON-RPC/HTTP API on port 5050.
- **Key Modules Owned:**
  - `server_ml.py` (Vectorized Isolation Forest, depth 10, subsample 128)
  - Contributing indicators decomposition: % weight = $z_i^2 / \sum z_j^2 \times 100$
  - Multi-window personal health change detector (Recent, 24h, 7d, 30d rolling metrics)
  - Epistemic uncertainty penalty calculation when features are missing.
- **Quality Gates:** Deterministic seeds, execution latency < 25ms, explainable attributions for every flagged anomaly.

### EC MEMBER — Spaceflight Domain & Systems Engineering
- **Key Modules Owned:**
  - Verification of biosensor sampling rates (photoplethysmography SpO2 at 1 Hz, ECG R-R intervals, heat flux core temp)
  - Spacecraft habitat environmental baselines (CO2 < 3.0 mmHg, Cabin Temp 21–24°C, 101.3 kPa)
  - Space radiation exposure modeling (LEO vs Lunar Gateway GCR/SPE limits according to NASA-STD-3001)
  - Operational checklists for astronauts in high-workload scenarios.
- **Quality Gates:** Complete adherence to NASA-STD-3001 Human Integration Design Standards and NASA Ethics Guidelines for non-clinical diagnostic support.
