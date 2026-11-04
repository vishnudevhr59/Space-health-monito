import React, { useState } from 'react';
import { HealthAlert } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Sliders,
  Filter,
  Check,
  ChevronRight,
  Info,
  XCircle,
  FileCheck,
  Stethoscope,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

interface AlertsPageProps {
  alerts: HealthAlert[];
  onAcknowledgeAlert: (
    alertId: string,
    action: 'acknowledge' | 'resolve' | 'review' | 'dismiss',
    dismissalReason?: string
  ) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({ alerts, onAcknowledgeAlert }) => {
  const [severityFilter, setSeverityFilter] = useState<'All' | 'Critical' | 'Warning' | 'Advisory'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Acknowledged' | 'Under Review' | 'Resolved' | 'Dismissed'>('All');
  const [dismissingAlertId, setDismissingAlertId] = useState<string | null>(null);
  const [dismissalReasonInput, setDismissalReasonInput] = useState<string>('');
  const [activeChecklistAlert, setActiveChecklistAlert] = useState<HealthAlert | null>(null);

  // Configured NASA Flight Medicine Thresholds
  const configuredThresholds = [
    { indicator: 'Resting Heart Rate', nominal: '50 – 90 BPM', warning: '< 45 or > 105 BPM', critical: '< 40 or > 130 BPM', source: 'NASA Flight Medicine Standards' },
    { indicator: 'Oxygen Saturation (SpO2)', nominal: '> 96.0%', warning: '93.0% – 95.9%', critical: '< 93.0%', source: 'ISS Environmental Medical Guidelines' },
    { indicator: 'Core Body Temperature', nominal: '36.2 – 37.2 °C', warning: '37.3 – 38.0 °C', critical: '> 38.5 °C or < 35.5 °C', source: 'Clinical Aerospace Medicine' },
    { indicator: 'Personal Radiation Dose Rate', nominal: '< 25.0 μSv/h', warning: '25.0 – 40.0 μSv/h', critical: '> 50.0 μSv/h', source: 'NASA Space Radiation Laboratory (PEL)' },
    { indicator: 'Heart Rate Variability (HRV)', nominal: '50 – 85 ms RMSSD', warning: '< 45 ms RMSSD', critical: '< 30 ms RMSSD', source: 'Autonomic Flight Monitoring Protocol' },
    { indicator: 'Sleep Duration', nominal: '7.0 – 8.5 Hours', warning: '5.5 – 6.9 Hours', critical: '< 5.0 Hours', source: 'NASA Behavioral Health Roadmap' },
    { indicator: 'Bone Loss Rate (BMD)', nominal: '< 0.90% / month', warning: '1.00% – 1.30% / month', critical: '> 1.50% / month', source: 'NASA HRP Bone Discipline' },
  ];

  const filteredAlerts = alerts.filter((a) => {
    if (severityFilter !== 'All' && a.severity !== severityFilter) return false;
    if (statusFilter !== 'All') {
      if (statusFilter === 'Active' && a.status !== 'Active' && a.status !== 'New') return false;
      if (statusFilter !== 'Active' && a.status !== statusFilter) return false;
    }
    return true;
  });

  const handleConfirmDismissal = () => {
    if (!dismissingAlertId) return;
    const reason = dismissalReasonInput.trim() || 'Reviewed by operator; deemed transient non-pathological artifact.';
    onAcknowledgeAlert(dismissingAlertId, 'dismiss', reason);
    setDismissingAlertId(null);
    setDismissalReasonInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#00E5FF] font-mono text-xs uppercase tracking-wider mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Mission Clinical Alert & 5-State Triage Workflow</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-mono">
            Intelligent Health Alert System
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl font-mono">
            Real-time threshold evaluations comparing active telemetry against configured flight surgery safety boundaries.
          </p>
        </div>

        {/* Counts summary */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300">
            Critical: <strong>{alerts.filter(a => a.severity === 'Critical' && (a.status === 'Active' || a.status === 'New')).length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300">
            Warning: <strong>{alerts.filter(a => a.severity === 'Warning' && (a.status === 'Active' || a.status === 'New')).length}</strong>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-300">
            Advisory: <strong>{alerts.filter(a => a.severity === 'Advisory' && (a.status === 'Active' || a.status === 'New')).length}</strong>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-4 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-[0_4px_24px_rgba(0,229,255,0.03)] font-mono text-xs">
        
        {/* Severity Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto">
          <span className="text-slate-400 mr-2 uppercase font-semibold">Severity:</span>
          {(['All', 'Critical', 'Warning', 'Advisory'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                severityFilter === sev
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_12px_rgba(0,229,255,0.2)] font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>

        {/* 5-State Status Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
          <span className="text-slate-400 mr-2 uppercase font-semibold">Status:</span>
          {(['All', 'Active', 'Acknowledged', 'Under Review', 'Resolved', 'Dismissed'] as const).map((stat) => (
            <button
              key={stat}
              onClick={() => setStatusFilter(stat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                statusFilter === stat
                  ? 'bg-slate-700/80 text-white border border-slate-600 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {stat}
            </button>
          ))}
        </div>

      </div>

      {/* ALERTS FEED */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-12 text-center text-slate-400 font-mono text-xs shadow-[0_4px_24px_rgba(0,229,255,0.03)]">
            <CheckCircle2 className="w-8 h-8 text-[#21D4A5] mx-auto mb-2" />
            <span>No alerts match the selected filters. All telemetry streams nominal.</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const severityBadge = {
              Critical: 'bg-[#FF5368]/15 text-[#FF5368] border-[#FF5368]/40',
              Warning: 'bg-[#FFB547]/15 text-[#FFB547] border-[#FFB547]/40',
              Advisory: 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/40',
            }[alert.severity];

            const statusBadge = {
              Active: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
              New: 'bg-rose-500/15 text-rose-400 border-rose-500/40',
              Acknowledged: 'bg-amber-500/15 text-amber-400 border-amber-500/40',
              'Under Review': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/40 animate-pulse',
              Resolved: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40',
              Dismissed: 'bg-slate-700/30 text-slate-400 border-slate-700',
            }[alert.status] || 'bg-slate-800 text-slate-300';

            return (
              <div
                key={alert.id}
                className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 hover:border-[#00E5FF]/40 transition-all shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-4"
              >
                {/* Alert Top Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-full border ${severityBadge}`}>
                      {alert.severity}
                    </span>
                    <h3 className="text-base font-bold text-white tracking-wide font-mono">
                      {alert.title}
                    </h3>
                    <span className="text-xs font-mono text-slate-400">
                      ({alert.astronautName})
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC</span>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusBadge}`}>
                      {alert.status}
                    </span>
                  </div>
                </div>

                {/* Values & Reason Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                  
                  <div className="space-y-2.5">
                    <div className="flex justify-between p-3 rounded-xl bg-[#0B1224]/80 border border-slate-800/80">
                      <span className="text-slate-400">Target Indicator:</span>
                      <span className="text-[#00E5FF] font-bold">{alert.indicator}</span>
                    </div>

                    <div className="flex justify-between p-3 rounded-xl bg-[#0B1224]/80 border border-slate-800/80">
                      <span className="text-slate-400">Observed Measurement:</span>
                      <span className="text-white font-bold">{alert.observedValue}</span>
                    </div>

                    <div className="flex justify-between p-3 rounded-xl bg-[#0B1224]/80 border border-slate-800/80">
                      <span className="text-slate-400">Configured Safety Boundary:</span>
                      <span className="text-slate-300">{alert.configuredThreshold}</span>
                    </div>

                    <div className="flex justify-between p-2 rounded-lg bg-[#050816] text-[10px] text-slate-500">
                      <span>Method: Isolation Forest & Normative Boundary</span>
                      <span>Model: v4.3.0</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3.5 rounded-xl bg-[#0B1224]/80 border border-slate-800/80 font-sans">
                      <span className="text-slate-400 font-mono text-[11px] block mb-1">Etiological Reason:</span>
                      <p className="text-slate-200 leading-relaxed text-[12px]">{alert.reason}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#21D4A5]/10 border border-[#21D4A5]/30 font-sans">
                      <span className="text-[#21D4A5] font-mono text-[11px] block mb-1 font-semibold flex items-center justify-between">
                        <span>Suggested Operational Step:</span>
                        <button
                          onClick={() => setActiveChecklistAlert(alert)}
                          className="text-[10px] text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                        >
                          <ClipboardList className="w-3 h-3" />
                          <span>Open Checklist</span>
                        </button>
                      </span>
                      <p className="text-slate-200 leading-relaxed text-[12px]">{alert.suggestedAction}</p>
                    </div>

                    {alert.dismissalReason && (
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-[11px] text-slate-400 font-sans">
                        <strong className="text-slate-300 block font-mono text-[10px] uppercase">Dismissal Rationale:</strong>
                        <span>{alert.dismissalReason}</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* 5-State Workflow Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="text-[11px] text-slate-500">
                    {alert.acknowledgedBy ? (
                      <span>Updated by {alert.acknowledgedBy} at {new Date(alert.acknowledgedAt || '').toLocaleTimeString()}</span>
                    ) : (
                      <span>Pending Flight Surgeon review</span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Acknowledge (Active or New) */}
                    {(alert.status === 'Active' || alert.status === 'New') && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id, 'acknowledge')}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#438BFF] text-[#050816] font-bold text-xs shadow-md transition-all hover:brightness-110 cursor-pointer"
                      >
                        Acknowledge
                      </button>
                    )}

                    {/* Under Review */}
                    {alert.status !== 'Under Review' && alert.status !== 'Resolved' && alert.status !== 'Dismissed' && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id, 'review')}
                        className="px-3 py-1.5 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 font-medium text-xs transition-colors cursor-pointer"
                      >
                        Mark Under Review
                      </button>
                    )}

                    {/* Resolve */}
                    {alert.status !== 'Resolved' && alert.status !== 'Dismissed' && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id, 'resolve')}
                        className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 font-medium text-xs transition-colors cursor-pointer"
                      >
                        Resolve
                      </button>
                    )}

                    {/* Dismiss with reason */}
                    {alert.status !== 'Dismissed' && alert.status !== 'Resolved' && (
                      <button
                        onClick={() => {
                          setDismissingAlertId(alert.id);
                          setDismissalReasonInput('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 font-medium text-xs transition-colors cursor-pointer"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* DISMISSAL RATIONALE MODAL */}
      {dismissingAlertId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0B1224] border border-slate-700 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <XCircle className="w-4 h-4 text-amber-400" />
                DISMISS ALERT // AUDIT RECORDING
              </h4>
              <button
                onClick={() => setDismissingAlertId(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 text-xs font-sans leading-relaxed">
              NASA flight safety procedures require a logged clinical rationale before dismissing an active physiological threshold excursion.
            </p>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 uppercase block">Dismissal Rationale:</label>
              <textarea
                value={dismissalReasonInput}
                onChange={(e) => setDismissalReasonInput(e.target.value)}
                placeholder="e.g. Known post-exercise transient recovery lag; confirmed crew seated resting trace nominal."
                className="w-full h-24 p-2.5 rounded-xl bg-[#050816] border border-slate-700 text-white focus:outline-none focus:border-[#00E5FF] text-xs font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDismissingAlertId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDismissal}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold hover:brightness-110 cursor-pointer"
              >
                Confirm Dismissal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OPERATIONAL CHECKLIST MODAL */}
      {activeChecklistAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0B1224] border border-[#00E5FF]/40 space-y-4 shadow-2xl font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-[#00E5FF]" />
                ILLUSTRATIVE REVIEW WORKFLOW (PROTOTYPE DEMONSTRATION) // {activeChecklistAlert.indicator}
              </h4>
              <button
                onClick={() => setActiveChecklistAlert(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-800/60 text-[11px] text-amber-200">
                <strong>Non-Operational Disclaimer:</strong> This review workflow is an illustrative prototype sequence for mission simulation purposes and has not been medically certified for spacecraft operational deployment.
              </div>

              <div className="p-3 rounded-xl bg-[#050816] border border-slate-800 space-y-2">
                <span className="font-mono text-[#00E5FF] text-[11px] font-bold block">Illustrative Crew Review Steps:</span>
                <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-200">
                  <li>Direct astronaut to cease ongoing resistive / aerobic training and enter seated rest position.</li>
                  <li>Verify pulse oximetry sensor placement and clean acoustic window.</li>
                  <li>Initiate 5-minute continuous seated 3-lead ECG trace.</li>
                  <li>Administer 500 mL oral hydration with standard electrolyte packet.</li>
                  <li>Verify crew quarters cabin ambient CO2 (&lt; 2.5 mmHg) and airflow velocity (&gt; 0.15 m/s).</li>
                  <li>Notify Ground Flight Surgeon via DSN telemetry loop if rate excursion persists &gt; 10 minutes.</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800 font-mono">
              <button
                onClick={() => setActiveChecklistAlert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                Close Checklist
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOURCED AND CONFIGURABLE THRESHOLDS TABLE */}
      <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,229,255,0.03)] font-mono">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#00E5FF]" />
              <span>Configured Mission Medical Thresholds & Safety Limits</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1 font-sans">
              Calibrated to NASA Human Research Program, Space Radiation Laboratory (PEL), and ISS flight medicine standards.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800/80">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0B1224] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Physiological Indicator</th>
                <th className="py-3 px-4">Nominal Range</th>
                <th className="py-3 px-4">Warning Limit</th>
                <th className="py-3 px-4">Critical Threshold</th>
                <th className="py-3 px-4">Scientific Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 bg-[#101B30]/50">
              {configuredThresholds.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{row.indicator}</td>
                  <td className="py-3 px-4 text-[#21D4A5]">{row.nominal}</td>
                  <td className="py-3 px-4 text-[#FFB547]">{row.warning}</td>
                  <td className="py-3 px-4 text-[#FF5368]">{row.critical}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
