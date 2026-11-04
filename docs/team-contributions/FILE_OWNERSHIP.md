# SPACE HEALTH MONITO — File Ownership & Modification Guide

This document clarifies file ownership, concurrency boundaries, and coordination requirements across the five team members.

---

## 1. File Ownership Breakdown

| Path / Module | Primary Owner | Secondary Reviewer | Independent Modification? | Coordination Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/components/DailyBriefing.tsx` | Web Dev 1 | EC Member | Yes | Consumes `/api/briefing/:astronautId` |
| `src/components/ContextExplorer.tsx` | Web Dev 1 | AI/ML Dev 2 | Yes | Displays Pearson correlation without asserting causation |
| `src/components/MissionTimeline.tsx` | Web Dev 1 | Web Dev 2 | Yes | Consumes unified `/api/timeline/:astronautId` |
| `src/components/LivePhysiologicalTrends.tsx` | Web Dev 1 | AI/ML Dev 1 | Yes | Overlays personal baselines on live biometrics |
| `src/components/NetworkStatusIndicator.tsx` | Web Dev 1 | Web Dev 2 | Yes | Subscribes to `offlineSyncService` |
| `src/pages/AiAnalysisPage.tsx` | Web Dev 1 | AI/ML Dev 2 | Yes | Features multi-window analysis and sensitivity slider |
| `src/pages/DashboardPage.tsx` | Web Dev 1 | EC Member | Yes | Central mission control dashboard |
| `src/services/offlineSyncService.ts` | Web Dev 2 | Web Dev 1 | Yes | Background sync with exponential backoff & jitter |
| `server.ts` | Web Dev 2 | All | Coordination Required | Central Express API and reverse proxy to Python ML |
| `server/db/models.ts` | Web Dev 2 | AI/ML Dev 1 | Coordination Required | TypeScript domain models; updates affect whole stack |
| `server/db/persistence.ts` | Web Dev 2 | AI/ML Dev 1 | Yes | ACID atomic swap and in-memory indexing |
| `server/validation/telemetrySchema.ts`| Web Dev 2 | EC Member | Yes | Physiological boundary filters |
| `server_ml.py` | AI/ML Dev 2 | AI/ML Dev 1 | Yes | Vectorized Isolation Forest & anomaly engine |
| `data/space_health_db.json` | AI/ML Dev 1 | Web Dev 2 | Coordination Required | Seed data; automatically persisted at runtime |
| `scripts/run_automated_tests.ts` | Web Dev 2 | All | Coordination Required | Central automated acceptance test suite |
| `docs/api/API_CONTRACTS.md` | Web Dev 2 | Web Dev 1 | Yes | REST API schemas and payloads |
| `docs/architecture/SYSTEM_ARCHITECTURE.md`| All | EC Member | Yes | System-level diagrams and integration topology |

---

## 2. Coordination Protocols
1. **Model Changes:** Any modification to `server/db/models.ts` or `src/types/index.ts` requires Web Dev 2 to confirm backwards compatibility with `data/space_health_db.json`.
2. **API Endpoint Additions:** Must be specified in `docs/api/API_CONTRACTS.md` before or simultaneously with Express implementation.
3. **ML Interface Changes:** The interface between Express (`/api/ml/*`) and Python (`server_ml.py` on port 5050) must maintain the JSON schema documented in `docs/api/API_CONTRACTS.md`.
