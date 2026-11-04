# SPACE HEALTH MONITO — End-to-End Reliability, Security, Mission Simulation & Responsive Engineering

## Title & Summary
SPACE HEALTH MONITO is an AI-powered astronaut health monitoring and decision-support prototype built for the NASA Space Apps Challenge 2026 under the theme "Monitoring Human Health Beyond Earth". This phase strengthens mission resilience, delivers an interactive 4-scenario end-to-end mission simulation controller with Scenario B default, hardens physiological data classification against arbitrary truncation, fortifies security/RBAC, extends automated tests, and ensures mobile-first responsive layout stability across 9 standardized viewports.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed by the user for Prompt 7:
> - **Active Default Mission Simulation Scenario**: Scenario B (Gradual Health Measurement Deviation) is active by default to showcase personalized baseline comparison, Isolation Forest statistical detection, and context correlation.
> - **Mission Simulator UI Presentation**: Persistent Mission Control Bar anchored above the main workspace with scenario selector, Play, Pause, Step, and Reset controls.
> - **Automated Test Reporting Depth**: Comprehensive test runner with terminal execution, detailed markdown audit reports (`docs/testing/END_TO_END_AUDIT.md`, `SECURITY_AUDIT.md`, `RESPONSIVE_TEST_REPORT.md`), and an interactive System Health & Test Suite Status UI view.

---

## 1. Overview & Core Concept

- **What It Does**: Provides long-duration space mission crews and flight surgeons with continuous physiological telemetry monitoring, multidimensional baseline drift detection (Isolation Forest + adaptive Z-scores), multi-factor spaceflight context correlation (ECLSS, radiation, sleep, ARED workload), daily crew health briefings with evidence tracing, and an earth-independent offline synchronization pipeline.
- **Target Audience & Persona**:
  - *Astronaut / Crew Medical Officer (CMO)*: Needs immediate, low-cognitive-load summaries, offline accessibility, contextual correlations, and actionable checklists.
  - *Flight Surgeon / Mission Support (Ground)*: Inspects historical telemetry, audit logs, model versions, statistical provenance, and data quality flags.
- **Scientific & Operational Boundary**: Explicitly labeled as a research and decision-support prototype. Includes strict disclaimers that statistical anomalies and temporal associations do not constitute clinical diagnoses or proof of causation.

---

## 2. User Experience & Visual Design

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Aerospace mission-control console following the Science, Space & Biotech design reference. Clinical deep obsidian background (`#0B0E17` / `#07090E`), precision slate structural panels (`#111827`), hairline borders (`#1E293B`), and calibrated telemetry accents (laser cyan `#06B6D4`, telemetry amber `#F59E0B`, emerald `#10B981`, and crimson `#F43F5E`).
  - *Typography*: Clean neo-grotesque sans-serif for UI labels paired with tabular monospace numerals (`font-mono tabular-nums`) for telemetry values, timestamps, and coordinates to prevent layout shift.
  - *Zero-Pill Discipline*: Unboxed metadata tags separated by subtle typographic dividers (`·` or `/`). Interactive filters and scenario selectors are functional segmented button controls.
- **Persistent Mission Control Bar**:
  - Mounted persistently above the main view.
  - Controls: Scenario Selector (`Scenario A: Normal`, `Scenario B: Gradual Deviation`, `Scenario C: Sensor Failure`, `Scenario D: Comm Loss`), Play/Pause, Step Advance, Reset, and Simulation Speed multiplier.
  - Real-time simulated status banner indicating scenario objectives, active telemetry streams, and synthetic data watermarks.
- **Responsive Layout Architecture (9 Viewports)**:
  - Mobile (`320x568`, `360x800`, `390x844`, `430x932`): Single-column stacked cards, collapsible drawer navigation, touch targets $\ge 44\text{px}$, responsive charts with adjusted tick counts.
  - Tablet (`768x1024`, `1024x768`): Adaptive 2-column grid, compact sidebar, dual-axis correlation charts.
  - Laptop & Desktop (`1366x768`, `1440x900`, `1920x1080`): Multi-column mission control dashboard, full telemetry ribbons, and side-by-side diagnostic decomposition.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Physiological Data Classification vs. Arbitrary Discarding**
  - *Chosen Approach*: Replace hard rejection filters with a 7-tier classification engine: `Structurally Invalid`, `Impossible / Malformed`, `Unusual Observation`, `Potential Sensor Artifact`, `Missing Measurement`, `Stale Measurement`, and `Requires Human Review`. Original raw observations are preserved with complete provenance.
  - *Why*: In spaceflight physiology, extreme or drifting values (e.g., severe bradycardia during sleep or tachycardia during EVA exertion) must never be silently discarded.
  - *Alternatives Considered*: Rigid upper/lower cutoffs (rejected because real medical events could be scrubbed).
- **Decision 2: Integrated Mission Simulation Engine**
  - *Chosen Approach*: Deterministic in-memory scenario generator that feeds synthetic telemetry into the existing store and API endpoints with an explicit `isSimulated: true` watermark.
  - *Why*: Enables reproducible demonstration during competition judging without corrupting real or baseline datasets.
- **Decision 3: Persistent File Storage Concurrency & Recovery**
  - *Chosen Approach*: Atomic file replacement pattern via `.tmp` write and POSIX `rename` with an in-memory queue mutex and automated corrupt database recovery/backup routines.
  - *Why*: Eliminates file corruption risks on sudden node shutdowns while avoiding external database daemon dependencies for offline edge spacecraft nodes.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       SPACE HEALTH MONITO FRONTEND (React 19)               │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │           Persistent Mission Control Simulation Bar (Scenarios A-D)   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────┬──────────────────────────────────────────────────┐  │
│  │  Top Telemetry Bar │ Link Status (LIVE / CACHED / PENDING / OFFLINE)  │  │
│  ├────────────────────┴──────────────────────────────────────────────────┤  │
│  │  Navigation Tabs:                                                     │  │
│  │  [Dashboard] [AI Analysis] [Context Explorer] [Briefing] [Timeline]   │  │
│  │  [Alerts (5-State)] [System Health & Tests] [Research Explorer]       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTP / REST / SSE
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    NODE.JS / EXPRESS PRIMARY BACKEND (:3000)                │
│                                                                             │
│  ┌───────────────────────┐  ┌─────────────────────┐  ┌───────────────────┐  │
│  │ Telemetry Classifier  │  │ RBAC & Auth Guard   │  │ Mission Simulator │  │
│  │ (7-Tier Quality)      │  │ (Astro Isolation)   │  │ (Scenarios A-D)   │  │
│  └───────────┬───────────┘  └──────────┬──────────┘  └─────────┬─────────┘  │
│              │                         │                       │            │
│              ▼                         ▼                       ▼            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │ Database Store & Atomic File Persistence (`space_health_db.json`)     │  │
│  │ - Write Mutex Queue  - POSIX Temp File Swap  - Corrupt Auto-Recovery │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────┬──────────────────┘
                           │                               │
        Proxy `/api/ml/*`  │                               │ Gemini SDK Proxy
                           ▼                               ▼
┌──────────────────────────────────────┐     ┌────────────────────────────────┐
│   PYTHON ML MICROSERVICE (:5050)     │     │      MONITO AI ENGINE          │
│   - Isolation Forest Vectorized      │     │  - Official NASA GeneLab/OSDR  │
│   - Adaptive Z-Score Engine          │     │  - Strict Citation Grounding   │
│   - Feature Contribution (XAI)       │     │  - Offline Fallback RAG        │
└──────────────────────────────────────┘     └────────────────────────────────┘
```

### Component & API Implementation Mapping
1. **Mission Simulation Controller (`src/components/MissionSimulationBar.tsx`)**:
   - Manages playback of Scenarios A, B, C, and D.
   - Dispatches simulated telemetry events to `/api/simulation/telemetry` with `isSimulated: true`.
2. **7-Tier Telemetry Classifier (`server/validators/telemetryValidator.ts`)**:
   - Classifies measurements without silent drops; preserves raw payloads in `database.rawObservations`.
3. **System Health & Test Suite Console (`src/pages/SystemHealthPage.tsx`)**:
   - Displays real-time operational status for Database, Express, Python ML (:5050), and Gemini.
   - Shows active automated test matrix with live pass/fail counts and log inspector.
4. **Security & Data Isolation (`server/middleware/auth.ts` & `server/routes/telemetry.ts`)**:
   - Validates JWT tokens, prevents ID tampering across astronauts, strips sensitive credentials from logs.
5. **Audit Documentation Generation (`docs/testing/`)**:
   - `docs/testing/END_TO_END_AUDIT.md`: Feature-by-feature implementation status matrix.
   - `docs/testing/SECURITY_AUDIT.md`: Threat model, RBAC isolation, storage security analysis.
   - `docs/testing/RESPONSIVE_TEST_REPORT.md`: Matrix across all 9 target viewports.
6. **Automated Test Suite Expansion (`scripts/run_automated_tests.ts`)**:
   - Extends test coverage from 81 tests to 100+ comprehensive tests covering simulation scenarios, 7-tier classification, atomic write failure recovery, and cross-astronaut access prevention.

---

## 5. Phased Execution Roadmap

- **Phase 1: System Audit & Documentation**: Comprehensive code inspection, generating `docs/testing/END_TO_END_AUDIT.md`.
- **Phase 2: Health Data Correctness & 7-Tier Classification**: Upgrade validator to categorize data without discarding valid physiological extremes.
- **Phase 3: Mission Simulation Engine**: Build backend simulator routes and the persistent frontend Mission Control bar with Scenario B active default.
- **Phase 4: Security & Cross-Astronaut Isolation**: Audit JWT verification, enforce astronaut scoping on all record endpoints, redact log outputs.
- **Phase 5: Storage Reliability & Self-Healing**: Implement backup snapshotting, file integrity checks, and auto-recovery on corrupted JSON files.
- **Phase 6: ML Microservice Resilience**: Add request timeout budgets, health probe retries, and fallback statistical analytics if Python service fails.
- **Phase 7: MONITO AI Grounding & Illustrative Checklists**: Re-verify all NASA citations and update emergency review workflows with clear prototype disclosures.
- **Phase 8: System Health Console & Observability**: Add System Health page in the UI showing service readiness and test execution logs.
- **Phase 9: Mobile-First Responsive Engineering**: Refine CSS media queries, layouts, and touch targets across 9 viewports (`320px` to `1920px`).
- **Phase 10: Five-Member Code Organization**: Verify and maintain clear module READMEs and contribution guidelines.
- **Phase 11: Expanded Test Suite & Verification**: Run extended automated tests, compile applet (`npm run build`), and verify zero lint errors (`npm run lint`).
