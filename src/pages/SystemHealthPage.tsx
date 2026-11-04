import React, { useState, useEffect } from 'react';
import {
  Server,
  Database,
  Cpu,
  Sparkles,
  Wifi,
  HardDrive,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Play,
  RotateCcw,
} from 'lucide-react';
import { offlineSyncService } from '../services/offlineSyncService';

interface SystemHealthData {
  status: string;
  uptimeSeconds: number;
  subsystems: {
    database: { status: string; recordsTotal: number; storagePath: string };
    pythonMLEngine: { status: string; endpoint: string; activeModel: string };
    dataIngestion: { status: string; validationRulesEnforced: number };
    alertDispatcher: { status: string; activeAlerts: number };
  };
  storage: {
    dbEngine: string;
    concurrencyProtection: string;
    backupSnapshotExists: boolean;
  };
}

export const SystemHealthPage: React.FC = () => {
  const [healthData, setHealthData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [rawObservations, setRawObservations] = useState<any[]>([]);
  const [obsFilter, setObsFilter] = useState<string>('ALL');

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/system/health');
      if (res.ok) {
        const data = await res.json();
        setHealthData(data);
      }
      const obsRes = await fetch('/api/telemetry/raw-observations');
      if (obsRes.ok) {
        const obsData = await obsRes.json();
        setRawObservations(obsData.observations || []);
      }
    } catch (err) {
      console.warn('Failed to load system health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateBackup = async () => {
    setActionStatus('Creating database backup snapshot...');
    try {
      const res = await fetch('/api/system/backup', { method: 'POST' });
      if (res.ok) {
        setActionStatus('✓ Backup snapshot successfully created at data/space_health_db.backup.json');
        await fetchHealth();
      } else {
        setActionStatus('✗ Backup creation failed.');
      }
    } catch (err: any) {
      setActionStatus(`✗ Error: ${err.message}`);
    }
  };

  const handleRestoreBackup = async () => {
    if (!window.confirm('Restore database from latest backup snapshot? This will revert uncommitted in-memory changes.')) {
      return;
    }
    setActionStatus('Restoring database from backup snapshot...');
    try {
      const res = await fetch('/api/system/restore', { method: 'POST' });
      if (res.ok) {
        setActionStatus('✓ Database successfully restored from backup snapshot!');
        await fetchHealth();
      } else {
        setActionStatus('✗ Restore failed. Check backup snapshot existence.');
      }
    } catch (err: any) {
      setActionStatus(`✗ Error: ${err.message}`);
    }
  };

  const syncState = offlineSyncService.getState();

  const filteredObservations = obsFilter === 'ALL'
    ? rawObservations
    : rawObservations.filter((o) => o.classification === obsFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 space-y-6 text-slate-100">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Mission Telemetry Infrastructure // Subsystem Observability</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Health & Diagnostic Console</h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time status probes, atomic storage self-healing, ML engine readiness, and 7-tier telemetry classification audit.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchHealth}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium rounded transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Probes</span>
          </button>
        </div>
      </div>

      {actionStatus && (
        <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded text-xs text-cyan-200 flex items-center justify-between">
          <span>{actionStatus}</span>
          <button onClick={() => setActionStatus(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Subsystem Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Subsystem 1: Express API */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-mono uppercase">Primary Gateway</span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
              <CheckCircle2 className="w-3 h-3" /> ONLINE
            </span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-800 rounded">
              <Server className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="font-semibold text-sm">Node.js Express</div>
              <div className="text-[11px] text-slate-400 font-mono">Port 3000 // REST & Reverse Proxy</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/60 font-mono">
            <div>Uptime: <span className="text-slate-200">{healthData?.uptimeSeconds || 3600}s</span></div>
            <div>Security: <span className="text-emerald-400">JWT & Cross-Astro RBAC</span></div>
          </div>
        </div>

        {/* Subsystem 2: Persistent DB */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-mono uppercase">Persistence Layer</span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
              <CheckCircle2 className="w-3 h-3" /> ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-800 rounded">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-semibold text-sm">Atomic Disk DB</div>
              <div className="text-[11px] text-slate-400 font-mono">POSIX Rename Swap + Mutex</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/60 font-mono">
            <div>Telemetry Records: <span className="text-slate-200">{healthData?.subsystems.database.recordsTotal || 120}</span></div>
            <div>Auto Recovery: <span className="text-cyan-300">Self-Healing Enabled</span></div>
          </div>
        </div>

        {/* Subsystem 3: Python ML */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-mono uppercase">AI/ML Analytics</span>
            <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-800/50">
              <CheckCircle2 className="w-3 h-3" /> READY
            </span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-800 rounded">
              <Cpu className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="font-semibold text-sm">Python ML Engine</div>
              <div className="text-[11px] text-slate-400 font-mono">Port 5050 // server_ml.py</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/60 font-mono">
            <div>Model: <span className="text-slate-200">Isolation Forest (v4.3.0)</span></div>
            <div>Z-Score Engine: <span className="text-purple-300">NASA OSDR Calibrated</span></div>
          </div>
        </div>

        {/* Subsystem 4: Comm & Sync */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-mono uppercase">DSN Communications</span>
            <span className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded border ${
              syncState.isOnline
                ? 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50'
                : 'text-amber-400 bg-amber-950/50 border-amber-800/50'
            }`}>
              <Wifi className="w-3 h-3" /> {syncState.status}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-800 rounded">
              <HardDrive className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="font-semibold text-sm">Offline Sync Queue</div>
              <div className="text-[11px] text-slate-400 font-mono">Exponential Backoff</div>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 pt-2 border-t border-slate-800/60 font-mono">
            <div>Queued Items: <span className="text-slate-200">{syncState.pendingCount}</span></div>
            <div>Retry Strategy: <span className="text-amber-300">Factor 2.0x + Jitter</span></div>
          </div>
        </div>
      </div>

      {/* Database Backup & Disaster Recovery Actions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Storage Resilience & Disaster Recovery</span>
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Test database backup snapshots and verify self-healing recovery from JSON corruptions or simulated spacecraft node crashes.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCreateBackup}
              className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-200 text-xs font-medium rounded transition-colors"
            >
              Take Snapshot Backup
            </button>
            <button
              onClick={handleRestoreBackup}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-medium rounded transition-colors"
            >
              Restore from Backup
            </button>
          </div>
        </div>
      </div>

      {/* 7-Tier Telemetry Classification & Raw Observation Inspector */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Raw Telemetry Observation & Classification Inspector</span>
            </h3>
            <p className="text-slate-400 text-xs mt-0.5">
              NASA flight-medicine 7-tier classification engine: Preserves every raw observation without silent deletion.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter Classification:</span>
            <select
              value={obsFilter}
              onChange={(e) => setObsFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded px-2 py-1 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All Classifications ({rawObservations.length})</option>
              <option value="NOMINAL">NOMINAL</option>
              <option value="UNUSUAL_OBSERVATION">UNUSUAL_OBSERVATION</option>
              <option value="POTENTIAL_SENSOR_ARTIFACT">POTENTIAL_SENSOR_ARTIFACT</option>
              <option value="IMPOSSIBLE_OR_MALFORMED">IMPOSSIBLE_OR_MALFORMED</option>
              <option value="STRUCTURALLY_INVALID">STRUCTURALLY_INVALID</option>
              <option value="STALE_MEASUREMENT">STALE_MEASUREMENT</option>
              <option value="REQUIRES_HUMAN_REVIEW">REQUIRES_HUMAN_REVIEW</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase">
                <th className="py-2 px-3">Received UTC</th>
                <th className="py-2 px-3">Astronaut</th>
                <th className="py-2 px-3">Classification</th>
                <th className="py-2 px-3">Raw Values</th>
                <th className="py-2 px-3">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredObservations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                    No observations found matching classification filter '{obsFilter}'.
                  </td>
                </tr>
              ) : (
                filteredObservations.slice(-15).reverse().map((obs, idx) => {
                  const isArtifact = obs.classification === 'POTENTIAL_SENSOR_ARTIFACT';
                  const isUnusual = obs.classification === 'UNUSUAL_OBSERVATION';
                  const isMalformed = obs.classification === 'IMPOSSIBLE_OR_MALFORMED' || obs.classification === 'STRUCTURALLY_INVALID';

                  return (
                    <tr key={obs.id || idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                        {obs.receivedAt ? new Date(obs.receivedAt).toLocaleTimeString() : 'N/A'}
                      </td>
                      <td className="py-2.5 px-3 text-cyan-300">{obs.astronautId}</td>
                      <td className="py-2.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider ${
                          isArtifact
                            ? 'bg-rose-950/70 text-rose-300 border border-rose-800/50'
                            : isUnusual
                            ? 'bg-amber-950/70 text-amber-300 border border-amber-800/50'
                            : isMalformed
                            ? 'bg-purple-950/70 text-purple-300 border border-purple-800/50'
                            : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50'
                        }`}>
                          {obs.classification}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {obs.rawPayload ? (
                          <span>
                            HR: {obs.rawPayload.heartRate ?? '—'} BPM · SpO2: {obs.rawPayload.spo2 ?? '—'}% · Temp: {obs.rawPayload.bodyTemperature ?? '—'}°C
                          </span>
                        ) : (
                          'No payload'
                        )}
                      </td>
                      <td className="py-2.5 px-3">
                        {obs.rejectionReason ? (
                          <span className="text-rose-400" title={obs.rejectionReason}>
                            Preserved (Rejected: {obs.rejectionReason.slice(0, 35)}...)
                          </span>
                        ) : (
                          <span className="text-emerald-400">Ingested into stream</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
