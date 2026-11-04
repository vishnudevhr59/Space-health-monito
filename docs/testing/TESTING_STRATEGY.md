# SPACE HEALTH MONITO — Automated Testing Strategy & Verification Plan
**Project:** SPACE HEALTH MONITO  
**Target:** NASA Space Apps Challenge 2026  

---

## 1. Test Architecture & Scope
The automated acceptance test suite (`scripts/run_automated_tests.ts`) executes end-to-end integration tests validating all 5 subsystems:

1. **Subsystem Health & Readiness:** Probes `/api/system/health`, `/api/system/readiness`, and `/api/system/services`.
2. **Telemetry Ingestion & Boundary Rejection:** Exercises physical impossibilities (HR > 240 BPM, HR < 28 BPM, SpO2 > 100%, future timestamps > 5m clock drift, missing astronaut IDs) expecting HTTP 422.
3. **Idempotency & Deduplication:** Verifies that replay attacks or offline queue retries with identical `X-Idempotency-Key` are accepted with HTTP 200 without creating ghost database duplicates.
4. **Database Querying & Pagination:** Verifies limit/offset pagination, temporal range filters, and verified telemetry rates.
5. **Python ML Isolation Forest:** Verifies direct microservice health on port 5050, normalized anomaly scores (0.0 to 1.0), contributing indicators decomposition ($w_i = z_i^2 / \sum z_j^2 \times 100$), adaptive baseline imputation, and epistemic uncertainty penalties.
6. **Personalized 3-Phase Baseline Management:** Verifies pre-flight, in-flight, and post-flight recovery comparison trajectories.
7. **Daily Astronaut Health Briefing (Sections A-H):** Validates deterministic calculations, Z-scores, source record linking, and operator acknowledgment.
8. **Multi-System Context Correlation:** Verifies Pearson correlation $r$, aligned sample sizes, and mandatory non-causation medical disclaimers.
9. **Unified Mission Timeline:** Verifies chronological multi-stream event aggregation and category filtering.
10. **5-State Prioritized Alert Lifecycle:** Validates state transitions (`Active` -> `Under Review` -> `Resolved` / `Dismissed` with mandatory logged clinical rationale).
11. **Security & Role-Based Access Control (RBAC):** Verifies role enforcement (`Astronaut` vs `Mission Administrator`) and token expiration rejections.

---

## 2. Running Automated Tests
```bash
# Run full acceptance suite
npm run test

# Run linter / TypeScript type verification
npm run lint

# Run production build
npm run build
```
