import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Radio,
  Sparkles,
  Volume2,
  VolumeX,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { AnomalyInjectionState } from './SimulationAnomalyPanel';
import { voiceAlertService } from '../services/voiceAlertService';
import {
  geminiFlightSurgeonService,
  FlightSurgeonReport,
} from '../services/geminiFlightSurgeonService';
import { missionAuditTrailService } from '../services/missionAuditTrailService';

interface AiDiagnosticEngineBannerProps {
  anomalyState: AnomalyInjectionState;
  onExecuteCountermeasure: () => void;
  onOpenConsultation?: () => void;
  onOpenAuditLog?: () => void;
}

export const AiDiagnosticEngineBanner: React.FC<AiDiagnosticEngineBannerProps> = ({
  anomalyState,
  onExecuteCountermeasure,
  onOpenConsultation,
  onOpenAuditLog,
}) => {
  const [report, setReport] = useState<FlightSurgeonReport | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [voiceActive, setVoiceActive] = useState<boolean>(voiceAlertService.isVoiceEnabled());

  useEffect(() => {
    return voiceAlertService.subscribe((enabled) => setVoiceActive(enabled));
  }, []);

  // Fetch or evaluate flight surgeon medical report whenever anomaly changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoadingReport(true);

    geminiFlightSurgeonService
      .getDiagnosticReport(anomalyState)
      .then((res) => {
        if (!isCancelled) {
          setReport(res);
          setIsLoadingReport(false);
          // Log diagnostic generation into audit ledger
          if (anomalyState.isAnomalyActive) {
            missionAuditTrailService.logEvent({
              metTimestamp: 'MET +142d TACTICAL',
              eventType: 'AI_DIAGNOSTIC_GENERATED',
              severity: res.riskLevel,
              title: `AI Flight Surgeon Diagnostic: ${res.anomalyName}`,
              description: `${res.priority}: ${res.countermeasures[0]}`,
              actor: res.engineSource,
              telemetrySnapshot: {
                heartRate: anomalyState.heartRate,
                spo2: anomalyState.spo2,
                bodyTemperature: anomalyState.bodyTemperature,
                systolicBP: anomalyState.bloodPressure.systolic,
                diastolicBP: anomalyState.bloodPressure.diastolic,
                respiratoryRate: anomalyState.respiratoryRate,
                cabinPressurePsi: anomalyState.cabinPressurePsi,
                cabinCo2MmHg: anomalyState.cabinCo2MmHg,
                vestibularConflictScore: anomalyState.vestibularConflictScore,
              },
            });
          }
        }
      })
      .catch(() => {
        if (!isCancelled) setIsLoadingReport(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [anomalyState]);

  const handleSpeakCallout = () => {
    if (anomalyState.isAnomalyActive) {
      voiceAlertService.speakCriticalAlert(
        anomalyState.anomalyName,
        report ? report.countermeasures[0] : anomalyState.etiology
      );
    } else {
      voiceAlertService.testVoiceAnnouncement();
    }
  };

  const handleExecute = () => {
    // Log countermeasure execution
    missionAuditTrailService.logEvent({
      metTimestamp: 'MET +142d TACTICAL',
      eventType: 'COUNTERMEASURE_EXECUTED',
      severity: 'NOMINAL',
      title: `Countermeasure Executed: ${anomalyState.anomalyName}`,
      description: 'Flight surgeon countermeasure protocol deployed. Commencing progressive physiological stabilization.',
      actor: 'CDR Sarah Chen / Automated Medical Sequencer',
    });

    voiceAlertService.speakWarningAlert(
      'Countermeasure executed',
      'Autonomous biophysical stabilization in progress'
    );

    onExecuteCountermeasure();
  };

  if (!anomalyState.isAnomalyActive && anomalyState.severity === 'NOMINAL') {
    return (
      <div className="w-full bg-[#081528]/80 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(33,212,165,0.08)]">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/15 rounded-xl border border-emerald-500/40 shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white text-xs sm:text-sm">
                AI DIAGNOSTIC ENGINE: ALL TELEMETRY NOMINAL
              </span>
              <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                CONTINUOUS 1 Hz SURVEILLANCE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              Continuous multi-variate monitoring active. Biometrics, life support (ECLSS), and neuro-vestibular metrics are within calibrated Gaussian 1.5σ baseline limits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 font-mono text-[11px] self-end sm:self-auto">
          <button
            onClick={handleSpeakCallout}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/30 text-[10px] transition-colors cursor-pointer"
            title="Test Voice Callout"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Voice Ready</span>
          </button>
          <div className="text-slate-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Gemini AI / Pure-Python Isolation Forest Active</span>
          </div>
        </div>
      </div>
    );
  }

  const isCritical = anomalyState.severity === 'CRITICAL';
  const displayReport = report || {
    anomalyName: anomalyState.anomalyName,
    riskLevel: anomalyState.severity,
    physiologicalImpact: anomalyState.etiology,
    etiology: anomalyState.etiology,
    countermeasures: anomalyState.countermeasures,
    priority: isCritical ? 'P1 - IMMEDIATE FLIGHT SURGEON INTERVENTION' : 'P2 - OPERATIONAL ADVISORY',
    clinicalDisclaimer: 'NASA Human Research Program Standard Clinical Guidelines.',
    engineSource: 'Deterministic Offline HRP Engine (Local Fallback)' as const,
    latencyMs: 14,
    generatedAt: new Date().toISOString(),
  };

  return (
    <div
      className={`w-full rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 border-2 shadow-2xl transition-all duration-300 animate-fadeIn ${
        isCritical
          ? 'bg-rose-950/75 border-rose-500 shadow-[0_0_40px_rgba(255,83,104,0.35)]'
          : 'bg-amber-950/75 border-amber-500 shadow-[0_0_35px_rgba(255,181,71,0.25)]'
      }`}
    >
      {/* Banner Header: Title, Severity Badge & Audio Callout Replay */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border shrink-0 animate-pulse ${
              isCritical
                ? 'bg-rose-500/25 border-rose-500 text-rose-300'
                : 'bg-amber-500/25 border-amber-500 text-amber-300'
            }`}
          >
            {isCritical ? <AlertOctagon className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                AI DIAGNOSTIC ALERT: {displayReport.anomalyName.toUpperCase()}
              </h4>
              <span
                className={`text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full border ${
                  isCritical
                    ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                    : 'bg-amber-500 text-black border-amber-400'
                }`}
              >
                ● {displayReport.riskLevel} MEDICAL INTERVENTION
              </span>
            </div>
            <p className="text-xs text-slate-200 font-sans mt-0.5 leading-relaxed">
              <strong>Pathophysiological Etiology:</strong> {displayReport.etiology}
            </p>
          </div>
        </div>

        {/* Top-Right Voice Announcement Replay Button & Priority */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-300 shrink-0 self-end sm:self-auto flex-wrap">
          <button
            onClick={handleSpeakCallout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 hover:bg-black/60 border border-white/20 text-cyan-300 hover:text-white transition-all cursor-pointer shadow-sm text-xs"
            title="Replay Voice Announcement (Browser SpeechSynthesis API)"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Replay Voice Alert</span>
          </button>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/40 text-rose-300 border border-rose-500/40 text-[10px]">
            <Radio className="w-3 h-3 text-rose-400 animate-ping" />
            <span className="font-bold">PRIORITY 1</span>
          </div>
        </div>
      </div>

      {/* AI Flight Surgeon Medical Countermeasure Report Panel */}
      <div className="bg-[#050816]/85 rounded-xl p-3.5 border border-white/10 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>FLIGHT SURGEON MEDICAL PROTOCOL (GEMINI AI GROUNDED):</span>
          </div>
          <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Engine: <strong className="text-cyan-300">{displayReport.engineSource}</strong> · {displayReport.latencyMs} ms
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          {displayReport.countermeasures.map((cm, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-slate-200 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800/80 shadow-sm"
            >
              <span className="text-cyan-400 font-bold shrink-0">{idx + 1}.</span>
              <span className="font-sans leading-snug">{cm}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons & Audit Trail Shortcut */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <span className="text-[11px] font-mono text-slate-300/80">
          Source: NASA HRP Space Medicine Guidelines · Continuous 1Hz Telemetry Loop
        </span>

        <div className="flex items-center gap-2.5">
          {onOpenAuditLog && (
            <button
              onClick={onOpenAuditLog}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inspect Audit Trail</span>
            </button>
          )}

          <button
            onClick={handleExecute}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_18px_rgba(33,212,165,0.45)] cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>EXECUTE CLINICAL COUNTERMEASURE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
