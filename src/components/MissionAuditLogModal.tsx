import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  X,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Filter,
  Trash2,
  Share2,
} from 'lucide-react';
import {
  missionAuditTrailService,
  MissionAuditEntry,
} from '../services/missionAuditTrailService';

interface MissionAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MissionAuditLogModal: React.FC<MissionAuditLogModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [auditLog, setAuditLog] = useState<MissionAuditEntry[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'NOMINAL'>('ALL');

  useEffect(() => {
    if (isOpen) {
      const unsub = missionAuditTrailService.subscribe((log) => {
        setAuditLog(log);
      });
      return unsub;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = filterSeverity === 'ALL'
    ? auditLog
    : auditLog.filter((item) => item.severity === filterSeverity);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#070D1F] border-2 border-cyan-500/50 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_0_60px_rgba(0,229,255,0.25)] overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-cyan-900/40 bg-cyan-950/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500/20 rounded-xl border border-cyan-500/40 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white font-mono tracking-tight">
                  MISSION AUDIT TRAIL & TELEMETRY LEDGER
                </h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  AEROSPACE GRADE · NASA TRISH
                </span>
              </div>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Immutable, synchronized event log of all telemetry excursions, voice announcements, and flight surgeon interventions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:outline-none"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Filters */}
        <div className="p-3 sm:p-4 bg-[#050914] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
          {/* Severity Filters */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px] font-semibold mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" />
              FILTER:
            </span>
            {(['ALL', 'CRITICAL', 'WARNING', 'NOMINAL'] as const).map((sev) => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  filterSeverity === sev
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-500/50 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => missionAuditTrailService.exportAuditAsCsv()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-400 text-xs font-bold transition-all cursor-pointer shadow-sm"
              title="Download RFC-4180 CSV Telemetry Audit Log"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => missionAuditTrailService.exportAuditAsJson()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] cursor-pointer"
              title="Download Full Mission Report Package (JSON)"
            >
              <Download className="w-3.5 h-3.5 text-white" />
              <span>Export JSON Report</span>
            </button>
          </div>
        </div>

        {/* Log Entries List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1 text-xs font-mono">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              No audit entries recorded matching filter &quot;{filterSeverity}&quot;.
            </div>
          ) : (
            filtered.map((entry) => {
              const snap = entry.telemetrySnapshot;
              return (
                <div
                  key={entry.id}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all space-y-2 bg-[#0A1326] ${
                    entry.severity === 'CRITICAL'
                      ? 'border-rose-500/50 hover:border-rose-400'
                      : entry.severity === 'WARNING'
                      ? 'border-amber-500/50 hover:border-amber-400'
                      : 'border-slate-800 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[9px] font-extrabold px-2 py-0.5 rounded border uppercase ${
                          entry.severity === 'CRITICAL'
                            ? 'bg-rose-950 text-rose-300 border-rose-500'
                            : entry.severity === 'WARNING'
                            ? 'bg-amber-950 text-amber-300 border-amber-500'
                            : 'bg-emerald-950 text-emerald-300 border-emerald-500'
                        }`}
                      >
                        ● {entry.severity}
                      </span>
                      <span className="font-bold text-white text-sm">
                        {entry.title}
                      </span>
                      <span className="text-slate-500 text-[10px]">
                        [{entry.eventType}]
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="text-cyan-300 font-bold">{entry.metTimestamp}</span>
                      <span className="text-slate-600">·</span>
                      <span className="text-slate-500">{new Date(entry.timestamp).toLocaleTimeString()} UTC</span>
                    </div>
                  </div>

                  <p className="text-slate-300 font-sans text-xs leading-relaxed">
                    {entry.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                    <span className="text-slate-400">
                      Actor: <strong className="text-slate-200">{entry.actor}</strong>
                    </span>

                    {snap && (
                      <div className="flex items-center gap-3 text-slate-300 font-mono text-[10px] bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        {snap.heartRate !== undefined && (
                          <span>HR: <strong className="text-cyan-400">{snap.heartRate} BPM</strong></span>
                        )}
                        {snap.spo2 !== undefined && (
                          <span>SpO2: <strong className="text-emerald-400">{snap.spo2}%</strong></span>
                        )}
                        {snap.cabinPressurePsi !== undefined && (
                          <span>Cabin: <strong className="text-amber-400">{snap.cabinPressurePsi} psi</strong></span>
                        )}
                        {snap.cabinCo2MmHg !== undefined && (
                          <span>CO2: <strong className="text-cyan-300">{snap.cabinCo2MmHg} mmHg</strong></span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs font-mono shrink-0">
          <span className="text-slate-400 text-[11px]">
            Total Logged Events: <strong className="text-white">{auditLog.length}</strong> · Synchronized with DSN Ground Segment
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            Close Ledger
          </button>
        </div>

      </div>
    </div>
  );
};
