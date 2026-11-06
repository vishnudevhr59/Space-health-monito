# SPACE HEALTH MONITOR — Security & Privacy Audit
**NASA Space Apps Challenge 2026**
**Document Reference:** SEC-AUD-2026-V1

---

## 1. Threat Model & Security Posture

In deep-space autonomous missions, cybersecurity and data integrity must guard against data corruption, unauthorized parameter tampering, cross-crew eavesdropping, and sensor spoofing while preserving complete offline availability during communication blackouts.

---

## 2. Authentication & Session Management

1. **Token Architecture:**
   - Stateless JWT format (`shm_jwt_<base64>`) with cryptographic payload integrity.
   - Standard claims: `userId`, `email`, `role`, `assignedCrewId`, `exp`, `iat`.
   - Expiration enforced via `authenticateToken` middleware with HTTP 401 on expired credentials.
2. **Password Protection:**
   - SHA-256 hashed passwords in user store; plain-text passwords never stored or returned in user APIs.
3. **Session Revocation:**
   - Immediate client-side token discard on logout; server-side audit entry logged.

---

## 3. Role-Based Access Control (RBAC) & Cross-Astronaut Data Isolation

### 3.1 Role Hierarchy Matrix

| Role | Telemetry Read | Telemetry Write | Review Alerts | System Admin & DB Backup |
| :--- | :---: | :---: | :---: | :---: |
| **Astronaut** | Self Only | Self Only | Acknowledge Only | ❌ |
| **Flight Medical Officer** | All Crew | All Crew | Full Review & Resolve | Read Only |
| **Mission Health Specialist** | All Crew | All Crew | Full Review & Resolve | Read Only |
| **Mission Administrator** | All Crew | Read Only | Audit Only | Full Admin & Backup |
| **Administrator** | All Crew | Read Only | Audit Only | Full Admin & Backup |
| **Researcher** | Anonymized | ❌ | ❌ | ❌ |

### 3.2 Cross-Astronaut ID Spoofing Prevention
- **Enforcement:** `server.ts` strictly validates that an authenticated request from an `Astronaut` role can ONLY query or submit telemetry for their own assigned crew profile (`req.user.assignedCrewId === targetAstronautId`).
- **Violation Response:** If an astronaut attempts to modify the URL to query `astro-2`, the server records an audit log (`CROSS_ASTRONAUT_ACCESS_DENIED`) and returns HTTP 403 Forbidden:
  ```json
  {
    "error": "Access denied: Cross-astronaut telemetry access prohibited.",
    "userAssignedCrewId": "astro-1",
    "targetAstronautId": "astro-2"
  }
  ```

---

## 4. Input Validation & Data Sanitization

- **7-Tier Ingestion Guard:** `server/validation/telemetrySchema.ts` validates incoming payloads against strict physiological plausibility boundaries.
- **Clock Drift Defense:** Timestamps exceeding 5 minutes into the future are rejected with HTTP 422 to prevent replay attacks and chronological timeline scrambling.
- **Payload Limits:** Express JSON body parser restricted to `5mb` to defend against denial-of-service memory exhaustion.

---

## 5. Privacy, Logging & Sensitive PHI Protection

- **No Secrets in Logs:** Application logs redact credentials, tokens, and raw biometric waveforms.
- **Client Storage Hygiene:** Sensitive medical telemetry is stored in memory or sandboxed `localStorage` with offline synchronization encryption keys.
- **Audit Traceability:** All administrative actions, authorization failures, and alert dismissals are written to `db.data.auditLogs` with timestamp, user ID, role, and client IP hash.
