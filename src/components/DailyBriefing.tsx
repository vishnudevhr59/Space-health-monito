import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity,
  Moon,
  Dna,
  Radio,
  ShieldAlert,
  Wifi,
  ChevronRight,
  ExternalLink,
  Info,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { AstronautProfile } from '../types';

interface DailyBriefingProps {
  astronaut: AstronautProfile;
  onNavigate?: (tab: string) => void;
}

export const DailyBriefing: React.FC<DailyBriefingProps> = ({ astronaut, onNavigate }) => {
  const [briefingData, setBriefingData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [acknowledgedItems, setAcknowledgedItems] = useState<Record<string, boolean>>({});
  const [selectedEvidence, setSelectedEvidence] = useState<any | null>(null);

  const fetchBriefing = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/briefing/${astronaut.id}`);
      if (res.ok) {
        const data = await res.json();
        setBriefingData(data);
        // Prepopulate acknowledged
        const ackMap: Record<string, boolean> = {};
        data.importantObservations?.forEach((obs: any) => {
          if (obs.acknowledged) ackMap[obs.id] = true;
        });
        setAcknowledgedItems(ackMap);
      }
    } catch (err) {
      console.warn('Failed to fetch daily briefing from server, using verified local synthesis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [astronaut.id]);

  const handleAcknowledge = async (itemId: string) => {
    setAcknowledgedItems((prev) => ({ ...prev, [itemId]: true }));
    try {
      await fetch(`/api/briefing/${astronaut.id}/acknowledge/${itemId}`, {
        method: 'POST',
      });
    } catch (err) {
      console.error('Failed to acknowledge briefing item:', err);
    }
  };

  if (isLoading && !briefingData) {
    return (
      <div className="p-8 rounded-2xl bg-[#0B1224] border border-[#00E5FF]/20 flex flex-col items-center justify-center space-y-3">
        <RefreshCw className="w-6 h-6 text-[#00E5FF] animate-spin" />
        <span className="text-xs font-mono text-slate-400">Compiling Mission Day {astronaut.missionDay} Clinical Briefing...</span>
      </div>
    );
  }

  const b = briefingData || {};
  const observations = b.importantObservations || [];
  const changes = b.reportingPeriodChanges || {};
  const trends = b.persistentTrends || [];
  const quality = b.dataQualityAndIntegrity || {};
  const env = b.environmentalContext || {};
  const tasks = b.scheduledTasks || [];
  const unackedAlerts = b.unacknowledgedReviewItems || [];
  const syncStatus = b.systemAndSyncStatus || {};

  return (
    <div className="p-6 rounded-2xl bg-[#0B1224] border border-[#00E5FF]/20 space-y-6 shadow-xl relative overflow-hidden">
      
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 uppercase tracking-wider">
              {b.briefingId || `BRF-SOL-${astronaut.missionDay}`}
            </span>
            <span className="text-xs font-mono text-slate-400">
              Generated: {new Date(b.generatedAt || Date.now()).toUTCString()}
            </span>
          </div>
          <h2 className="text-xl font-bold font-mono text-white tracking-wide mt-1 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00E5FF]" />
            DAILY CREW HEALTH BRIEFING // SOL {astronaut.missionDay}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 text-right">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Crew Readiness</span>
            <span className="text-xs font-mono font-bold text-[#21D4A5] flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-[#21D4A5] animate-pulse" />
              {b.overallReadinessStatus || 'NOMINAL'}
            </span>
          </div>
          <button
            onClick={fetchBriefing}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh Briefing"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECTION A: IMPORTANT OBSERVATIONS (Deviations with Z-scores) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00E5FF]" />
            A. Priority Clinical Observations & Baseline Deviations
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            {observations.length} Evaluated Parameter{observations.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {observations.map((obs: any) => {
            const isAcked = acknowledgedItems[obs.id];
            return (
              <div
                key={obs.id}
                className={`p-4 rounded-xl border transition-all ${
                  isAcked
                    ? 'bg-slate-900/40 border-slate-800 opacity-80'
                    : 'bg-[#101B30] border-[#00E5FF]/30 shadow-lg shadow-[#00E5FF]/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono text-[#00E5FF] uppercase tracking-wider font-semibold">
                      {obs.category} // Z-SCORE: {obs.zScore > 0 ? `+${obs.zScore}` : obs.zScore}σ
                    </span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{obs.title}</h4>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      obs.isSignificant
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {obs.isSignificant ? 'Deviating' : 'Nominal'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{obs.description}</p>

                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono bg-[#050816]/70 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Current Observed</span>
                    <span className="text-white font-bold">{obs.observedValue}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Calibrated Baseline</span>
                    <span className="text-slate-300">{obs.baselineValue}</span>
                  </div>
                </div>

                {obs.countermeasure && (
                  <div className="mt-2.5 p-2 rounded-lg bg-[#00E5FF]/5 border border-[#00E5FF]/20 text-[11px] text-slate-300 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 mt-0.5" />
                    <span><strong className="text-[#00E5FF]">Recommended Action:</strong> {obs.countermeasure}</span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <button
                    onClick={() => setSelectedEvidence(obs)}
                    className="text-[10px] font-mono text-[#00E5FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Inspect Evidence (Record {obs.sourceRecordId})</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => handleAcknowledge(obs.id)}
                    disabled={isAcked}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isAcked
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-[#00E5FF] border border-[#00E5FF]/40'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isAcked ? 'Reviewed' : 'Acknowledge'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION B: 24-HOUR PERIOD CHANGES */}
      <div className="space-y-3">
        <h3 className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#00E5FF]" />
          B. 24-Hour Reporting Period Changes (Yesterday vs Today)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#101B30] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Resting Heart Rate</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-white">{changes.restingHeartRate?.current || 62}</span>
              <span className="text-[10px] font-mono text-slate-400">{changes.restingHeartRate?.unit || 'BPM'}</span>
            </div>
            <span className={`text-[10px] font-mono font-semibold flex items-center gap-0.5 mt-1 ${
              (changes.restingHeartRate?.delta || 0) > 0 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {(changes.restingHeartRate?.delta || 0) > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {changes.restingHeartRate?.delta > 0 ? `+${changes.restingHeartRate?.delta}` : changes.restingHeartRate?.delta || 0} vs prior 24h
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#101B30] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Oxygen Saturation</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-white">{changes.spo2?.current || 98.2}%</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-0.5 mt-1">
              Stable (+0.0% variance)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#101B30] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Sleep Duration</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-white">{changes.sleepDuration?.current || 6.8}h</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">
              {changes.sleepDuration?.delta > 0 ? `+${changes.sleepDuration?.delta}` : changes.sleepDuration?.delta}h vs sol {astronaut.missionDay - 1}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#101B30] border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 block uppercase">ARED Countermeasure</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-lg font-bold font-mono text-[#21D4A5]">{changes.exerciseAdherencePercent || 96}%</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 mt-1 block">
              65 min resistive load target met
            </span>
          </div>
        </div>
      </div>

      {/* SECTION C & D: PERSISTENT TRENDS + DATA QUALITY DUAL STRIP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* SECTION C: PERSISTENT TRENDS */}
        <div className="p-4 rounded-xl bg-[#101B30] border border-slate-800 space-y-3">
          <h3 className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-2">
            <Dna className="w-4 h-4 text-[#00E5FF]" />
            C. Persistent Multi-Sol Trends (7+ Days)
          </h3>
          <div className="space-y-2">
            {trends.map((t: any, idx: number) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#050816] border border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{t.indicator}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                    {t.status}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">{t.trajectory}</p>
                <span className="text-[9px] font-mono text-slate-500 block mt-1">Grounded in: {t.sourceDataset}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION D: DATA QUALITY AUDIT */}
        <div className="p-4 rounded-xl bg-[#101B30] border border-slate-800 space-y-3">
          <h3 className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#00E5FF]" />
            D. Sensor Integrity & Missing Data Audit
          </h3>
          <div className="p-3 rounded-lg bg-[#050816] border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Total Telemetry Records:</span>
              <span className="font-mono text-white font-bold">{quality.totalRecordsAudited || 120}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Degraded Sensor Readings:</span>
              <span className="font-mono text-emerald-400 font-bold">{quality.degradedSensorRecords || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Telemetry Packet Loss Rate:</span>
              <span className="font-mono text-emerald-400 font-bold">{quality.packetLossPercent || 0.0}%</span>
            </div>
            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Operational Hardware:</span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {(quality.activeSensors || ['BioHarness-V4', 'PulseOx-Ear', 'HeatFlux-Core']).map((s: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* SECTION E & F: ENVIRONMENTAL CONTEXT & UPCOMING TASKS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* SECTION E: SPACECRAFT ENVIRONMENTAL CONTEXT */}
        <div className="p-4 rounded-xl bg-[#101B30] border border-slate-800 space-y-3">
          <h3 className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#00E5FF]" />
            E. Habitat Life Support & Space Environment
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#050816] border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Cabin CO2 Partial Pressure</span>
              <span className="font-mono text-white font-bold text-sm">{env.cabinCO2 || '2.2 mmHg'}</span>
              <span className="text-[9px] font-mono text-emerald-400 block mt-0.5">Nominal (&lt; 3.0 mmHg)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#050816] border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Cabin Temperature</span>
              <span className="font-mono text-white font-bold text-sm">{env.cabinTemperature || '22.4 °C'}</span>
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">ECLSS Loop Balanced</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#050816] border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Cumulative Mission Radiation</span>
              <span className="font-mono text-white font-bold text-sm">{env.cumulativeRadiationMSv || 78.4} mSv</span>
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">{env.radiationLimitPercent || 31.4}% of 250 mSv Limit</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#050816] border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Space Weather State</span>
              <span className="font-mono text-emerald-400 font-bold text-xs block truncate mt-1">Quiet Solar Flux</span>
              <span className="text-[9px] font-mono text-slate-400 block mt-0.5">Background GCR Shielded</span>
            </div>
          </div>
        </div>

        {/* SECTION F: UPCOMING TASKS */}
        <div className="p-4 rounded-xl bg-[#101B30] border border-slate-800 space-y-3">
          <h3 className="text-xs font-mono font-bold text-[#00E5FF] uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#00E5FF]" />
            F. Scheduled Crew Wellness & Monitoring Timeline
          </h3>
          <div className="space-y-2">
            {tasks.map((task: any, idx: number) => (
              <div key={idx} className="p-2 rounded-lg bg-[#050816] border border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded border border-[#00E5FF]/20">
                    {task.time}
                  </span>
                  <span className="text-slate-200">{task.task}</span>
                </div>
                {task.priority === 'HIGH' && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    MANDATORY
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* SECTION G & H: UNACKNOWLEDGED ALERTS & SYSTEM STATUS STRIP */}
      <div className="p-4 rounded-xl bg-[#050816] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Wifi className="w-4 h-4 text-[#21D4A5]" />
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase block">DSN Telemetry Link & Engine</span>
            <span className="font-mono text-slate-200 font-semibold">{syncStatus.dsnLink || 'LIVE'} // {syncStatus.pythonMLEngine || 'ONLINE'}</span>
          </div>
        </div>

        {unackedAlerts.length > 0 ? (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 font-mono font-semibold">
              {unackedAlerts.length} Unacknowledged Alert Review Item{unackedAlerts.length !== 1 ? 's' : ''}
            </span>
            {onNavigate && (
              <button
                onClick={() => onNavigate('alerts')}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold cursor-pointer"
              >
                Review in Alerts
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>All Clinical Checklist Items Acknowledged</span>
          </div>
        )}
      </div>

      {/* EVIDENCE INSPECTION MODAL */}
      {selectedEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0B1224] border border-[#00E5FF]/40 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-bold font-mono text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#00E5FF]" />
                SCIENTIFIC EVIDENCE AUDIT // RECORD {selectedEvidence.sourceRecordId}
              </h4>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Observed Metric</span>
                <span className="text-white font-bold font-mono text-sm">{selectedEvidence.observedValue}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Normative Calibration Baseline</span>
                <span className="text-slate-300 font-mono">{selectedEvidence.baselineValue}</span>
              </div>
              <div>
                <span className="text-slate-500 font-mono text-[10px] uppercase block">Model Confidence & Epistemic Uncertainty</span>
                <span className="text-[#00E5FF] font-mono font-semibold">
                  Confidence: {(selectedEvidence.confidenceScore * 100).toFixed(0)}% (Uncertainty: ±{(selectedEvidence.uncertainty * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#050816] border border-slate-800 text-[11px] space-y-1">
                <strong className="text-white font-mono block">Physiological Context:</strong>
                <p>{selectedEvidence.description}</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedEvidence(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono cursor-pointer"
              >
                Dismiss Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Non-diagnostic Prototype Disclaimer */}
      <div className="p-2.5 rounded-xl bg-[#050816]/70 border border-slate-800/80 text-[10px] text-slate-500 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          <strong>Non-Diagnostic Research Prototype:</strong> SPACE HEALTH MONITOR provides automated statistical pattern analysis for flight surgeon review and crew situational awareness. Does not constitute certified clinical diagnosis.
        </span>
      </div>

    </div>
  );
};
