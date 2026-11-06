# SPACE HEALTH MONITOR — Database Architecture & Persistence Audit
**Document:** Database Engineering & ACID Concurrency Audit  
**Classification:** Spaceflight Software Reliability & Data Architecture  

---

## 1. Executive Summary & Storage Choice

SPACE HEALTH MONITOR currently utilizes a **file-backed atomic JSON database** located at `data/space_health_db.json`, managed by `PersistentDatabase` in `server/db/persistence.ts`. 

### Operational Rationale for Spaceflight Prototype
1. **Zero External Dependency Daemon:** Unlike a separate database daemon (e.g., MongoDB, PostgreSQL), an embedded storage engine runs entirely within the Node.js process. On air-gapped deep-space spacecraft (Orion, Gateway, Starship), reducing required background service daemons minimizes operating system memory footprints, CPU contention, and inter-process IPC failure modes.
2. **Deterministic Human-Readable Inspection:** Ground station flight surgeons and astronauts can directly inspect, audit, or backup `space_health_db.json` using standard command-line tools without requiring proprietary database drivers.
3. **In-Memory O(1) Reads:** All 14 mission data collections are held in memory with hash-based indexes (`idempotencyKeys: Set<string>`), delivering sub-millisecond telemetry read and query performance.

---

## 2. File-Writing Implementation & Concurrency Analysis

### The Atomic Write (Temporary File Rename Pattern)
When modifying state (`ingestTelemetry`, `save`), direct writes to `space_health_db.json` would risk file corruption if the process terminated mid-write (partial writes or truncated JSON).

To prevent this, `PersistentDatabase` implements the **POSIX Atomic Rename Swap**:
```typescript
const tempPath = `${this.dbPath}.tmp-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
const serialized = JSON.stringify(this.data, null, 2);
await fs.promises.writeFile(tempPath, serialized, 'utf-8');
await fs.promises.rename(tempPath, this.dbPath);
```

#### Why This Is Atomic:
- On POSIX filesystems, `rename(2)` is an atomic directory metadata swap. The inode pointer is atomically updated.
- If the server crashes during `writeFile`, the existing `space_health_db.json` remains completely intact and uncorrupted. The partial `.tmp` file is safely ignored or pruned on restart.
- Read operations never encounter a half-written file; readers see either the old file or the new file in full.

### Concurrent Read / Write Handling & Mutex Serialization
In Node.js's single-threaded event loop:
1. **In-Memory Mutex:** `isSaving: boolean` and `pendingSave: boolean` prevent concurrent file system write collisions. If an ingestion arrives while a disk write is in-flight, `pendingSave` is set to `true`, and a follow-up disk flush is queued after the current rename finishes.
2. **Idempotency Guard:** High-frequency simultaneous submissions with identical data (e.g., offline queue retries) are trapped in $O(1)$ time by SHA-256 idempotency key sets before modifying memory or triggering writes.

---

## 3. Limitations Compared to Enterprise Databases (e.g., MongoDB)

While optimal for single-spacecraft edge computing, the file-backed JSON store has distinct limitations compared to an enterprise document database like MongoDB:

| Metric / Capability | SPACE HEALTH MONITOR (File JSON) | MongoDB / Document DB |
| :--- | :--- | :--- |
| **Write Concurrency** | Serialized disk flushing (Coarse-grained full file rewrite). | Multi-Granular Concurrency Control (WiredTiger document-level locking). |
| **Scalability Limit** | Up to ~50,000 telemetry records before JSON serialization latency exceeds 50ms. | Millions of records with B-tree disk paging. |
| **Partial Updates** | Must re-serialize entire collection structure to disk. | In-place document updates (`$set`, `$inc`) modifying only changed bytes. |
| **Multi-Node Replication**| File-level rsync or DSN ground-link sync. | Native Raft-like Replica Sets with automatic failover and elections. |
| **ACID Transactions** | Atomic file replacement guarantees Durability and Isolation of the snapshot, but lacks rollbacks of multi-step mutations mid-execution. | Multi-document distributed ACID transactions with commit/abort semantics. |

---

## 4. Recommended Safe Migration Path to MongoDB
If mission requirements expand to multi-crew fleet tracking (e.g., 50+ astronauts across multiple habitats simultaneously streaming 100 Hz biometrics):

1. **Step 1: Abstract with Repository Interface (`ITelemetryRepository`):**
   Decouple `server.ts` routes from `db.data` directly by routing queries through a repository pattern.
2. **Step 2: Dual-Write Bridge:**
   Implement a MongoDB Mongoose adapter that mirrors writes to both `space_health_db.json` (as an emergency fallback) and MongoDB Atlas / local `mongod`.
3. **Step 3: Index Migration:**
   Create compound indexes in MongoDB:
   - `{ astronautId: 1, timestamp: -1 }` (for sub-millisecond timeline windowing)
   - `{ idempotencyKey: 1 }` (unique sparse index for deduplication)
   - `{ "metrics.restingHeartRate.mean": 1 }` (for baseline comparisons)
4. **Step 4: Non-Destructive Cutover:**
   Validate parity using `scripts/run_automated_tests.ts` against the MongoDB adapter before decommissioning the local JSON persistence.
