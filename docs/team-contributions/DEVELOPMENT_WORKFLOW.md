# SPACE HEALTH MONITOR — Team Development Workflow

This document describes how our 5-member team develops, tests, and integrates code without conflicts or broken builds.

---

## 1. Local Development Environment
The application runs as a unified microservices environment:
- **Port 3000:** Express API backend + Vite development server mounting frontend React SPA.
- **Port 5050:** Python ML Analytics Engine (`server_ml.py`). Express automatically detects and proxies `/api/ml/*` to this service.

### Starting Services
```bash
# 1. Start unified server (Express + Vite + Python ML supervisor)
npm run dev

# 2. To run the automated acceptance test suite
npm run test

# 3. To run TypeScript type-checks
npm run lint

# 4. To produce a production build
npm run build
```

---

## 2. Independent vs. Shared Workflows

### Web Dev 1 (Frontend):
Can develop UI components in `src/components/` and `src/pages/` using hot reloading. All API calls target `/api/*` which the local Express server serves directly. If the backend is temporarily offline, `offlineSyncService` caches telemetry and serves local verified profiles.

### Web Dev 2 (Backend):
Edits `server.ts` or `server/db/persistence.ts`. The dev server runs with `tsx` which re-executes on file save. Changes to persistence atomic files should always be verified using `npm run test`.

### AI/ML Dev 1 (Data Engineering):
Validates telemetry ingestion boundaries in `server/validation/telemetrySchema.ts` and inspects database data quality distributions via `GET /api/telemetry/quality`.

### AI/ML Dev 2 (Machine Learning):
Can run and test `server_ml.py` directly:
```bash
python3 server_ml.py
# In another terminal:
curl http://127.0.0.1:5050/api/ml/model-status
```
The Express server acts as a reverse proxy gateway, allowing frontend calls to transparently hit the ML engine.

### EC Member (Spaceflight Domain):
Validates physiological limits against NASA-STD-3001, ensures units are standard (BPM, %, °C, ms, mmHg, mSv), and confirms that all explainable AI insights make sensible spaceflight recommendations (e.g., ARED load adjustment, hydration, 0.1 Hz resonant breathing).

---

## 3. Pull Request & Verification Pipeline
Before merging or delivering any milestone:
1. `npm run lint` must exit with 0 errors.
2. `npm run test` must execute the full acceptance suite (50+ automated checks) with 100% pass rate.
3. `npm run build` must compile cleanly with Vite.
