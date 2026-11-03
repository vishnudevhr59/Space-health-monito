/**
 * SPACE HEALTH MONITO — Spacecraft Offline Synchronization Service
 * Handles local telemetry queuing, IndexedDB/Storage caching, idempotency,
 * and automatic synchronization upon Deep Space Network (DSN) link recovery.
 */

export type SyncStatus = 'LIVE' | 'CACHED' | 'PENDING_SYNC' | 'SYNCING' | 'SYNC_FAILED' | 'STALE';

export interface QueuedMeasurement {
  idempotencyKey: string;
  astronautId: string;
  timestamp: string;
  heartRate: number;
  spo2: number;
  bodyTemperature: number;
  bloodPressure?: { systolic: number; diastolic: number };
  hrv?: number;
  respiratoryRate?: number;
  queuedAt: string;
  retryCount: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  lastError?: string;
}

const STORAGE_KEYS = {
  QUEUE: 'shm_offline_telemetry_queue_v1',
  CACHED_TELEMETRY: 'shm_cached_telemetry_v1',
  LAST_SYNC: 'shm_last_sync_timestamp_v1',
};

class OfflineSyncService {
  private listeners: ((state: { status: SyncStatus; isOnline: boolean; pendingCount: number; lastSync: string | null }) => void)[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private currentStatus: SyncStatus = 'LIVE';
  private lastSyncTime: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.lastSyncTime = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notify();
        this.syncQueuedMeasurements();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.currentStatus = 'CACHED';
        this.notify();
      });

      // Periodic connectivity check
      setInterval(() => {
        this.checkLiveConnectivity();
      }, 15000);
    }
  }

  public subscribe(cb: (state: { status: SyncStatus; isOnline: boolean; pendingCount: number; lastSync: string | null }) => void) {
    this.listeners.push(cb);
    cb(this.getState());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  public getState(): { status: SyncStatus; isOnline: boolean; pendingCount: number; lastSync: string | null } {
    const queue = this.getQueue();
    let status: SyncStatus = this.currentStatus;
    if (this.currentStatus === 'SYNCING') {
      status = 'SYNCING';
    } else if (this.currentStatus === 'SYNC_FAILED') {
      status = 'SYNC_FAILED';
    } else if (!this.isOnline) {
      status = queue.length > 0 ? 'PENDING_SYNC' : 'CACHED';
    } else if (queue.length > 0) {
      status = 'PENDING_SYNC';
    } else {
      status = 'LIVE';
    }

    return {
      status,
      isOnline: this.isOnline,
      pendingCount: queue.length,
      lastSync: this.lastSyncTime,
    };
  }

  private notify() {
    const state = this.getState();
    this.listeners.forEach((cb) => cb(state));
  }

  // --- Queue Management ---

  public getQueue(): QueuedMeasurement[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.QUEUE);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: QueuedMeasurement[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
    this.notify();
  }

  public enqueueMeasurement(data: Omit<QueuedMeasurement, 'idempotencyKey' | 'queuedAt' | 'retryCount' | 'status'>): QueuedMeasurement {
    const queue = this.getQueue();
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const item: QueuedMeasurement = {
      ...data,
      idempotencyKey,
      queuedAt: new Date().toISOString(),
      retryCount: 0,
      status: 'PENDING',
    };

    queue.push(item);
    this.saveQueue(queue);

    // If online, immediately attempt to flush
    if (this.isOnline) {
      this.syncQueuedMeasurements();
    }

    return item;
  }

  // --- Offline Telemetry Cache ---

  public cacheTelemetry(telemetry: any[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CACHED_TELEMETRY, JSON.stringify(telemetry.slice(-100)));
    this.lastSyncTime = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, this.lastSyncTime);
    this.notify();
  }

  public getCachedTelemetry(): any[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CACHED_TELEMETRY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // --- Synchronization Execution ---

  public async syncQueuedMeasurements(): Promise<{ synced: number; failed: number }> {
    const queue = this.getQueue();
    if (queue.length === 0) return { synced: 0, failed: 0 };

    this.currentStatus = 'SYNCING';
    this.notify();

    let syncedCount = 0;
    let failedCount = 0;
    const remainingQueue: QueuedMeasurement[] = [];

    for (const item of queue) {
      try {
        const res = await fetch('/api/telemetry', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Idempotency-Key': item.idempotencyKey,
          },
          body: JSON.stringify({
            astronautId: item.astronautId,
            timestamp: item.timestamp,
            heartRate: item.heartRate,
            spo2: item.spo2,
            bodyTemperature: item.bodyTemperature,
            bloodPressure: item.bloodPressure,
            hrv: item.hrv,
            respiratoryRate: item.respiratoryRate,
            provenance: 'USER_ENTERED',
            dataSource: 'Offline-Sync-Queue',
          }),
        });

        if (res.ok) {
          syncedCount++;
        } else {
          item.retryCount++;
          item.status = 'FAILED';
          item.lastError = `HTTP ${res.status}`;
          remainingQueue.push(item);
          failedCount++;
        }
      } catch (err: any) {
        item.retryCount++;
        item.status = 'FAILED';
        item.lastError = err.message || 'Network disconnected';
        remainingQueue.push(item);
        failedCount++;
      }
    }

    this.saveQueue(remainingQueue);
    this.lastSyncTime = new Date().toISOString();
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, this.lastSyncTime);
    }

    this.currentStatus = failedCount > 0 ? 'SYNC_FAILED' : 'LIVE';
    this.notify();

    return { synced: syncedCount, failed: failedCount };
  }

  private async checkLiveConnectivity() {
    try {
      const res = await fetch('/api/system/readiness', { method: 'GET', cache: 'no-store' });
      const wasOnline = this.isOnline;
      this.isOnline = res.ok;
      if (!wasOnline && this.isOnline) {
        this.syncQueuedMeasurements();
      }
      this.notify();
    } catch {
      this.isOnline = false;
      this.notify();
    }
  }

  public clearLocalData() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.QUEUE);
    localStorage.removeItem(STORAGE_KEYS.CACHED_TELEMETRY);
    localStorage.removeItem(STORAGE_KEYS.LAST_SYNC);
    this.currentStatus = 'LIVE';
    this.notify();
  }
}

export const offlineSyncService = new OfflineSyncService();
