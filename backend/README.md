# SPACE HEALTH MONITO — Backend Module
**Lead:** Web Developer 2  
**Tech Stack:** Node.js, Express, TypeScript, tsx, atomic file persistence.

## Overview
The backend provides REST APIs, physiological validation, ACID-compliant atomic file persistence, RBAC authentication, and integration with the Python ML microservice.

### Key Endpoints
- `POST /api/telemetry`: Validates physiological ranges and ingests telemetry idempotently.
- `GET /api/briefing/:astronautId`: Deterministic daily health briefing (Sections A-H).
- `GET /api/context/correlation`: Computes Pearson correlation across biometric and habitat series.
- `GET /api/timeline/:astronautId`: Returns unified chronological mission events.
- `ALL /api/ml/*`: Reverse proxy to Python ML service on port 5050.

### Running & Testing
```bash
npm run dev   # Boots Express server on port 3000
npm run test  # Runs automated acceptance test suite
```
