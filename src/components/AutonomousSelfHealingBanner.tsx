import React, { useState, useEffect, useRef } from 'react';
import { telemetryStreamEngine, TelemetryFrame } from '../services/telemetryStreamEngine';
import { NOMINAL_HEALTH_STATE } from './SimulationAnomalyPanel';
import { missionAuditTrailService } from '../services/missionAuditTrailService';
import { voiceAlertService } from '../services/voiceAlertService';
import {
  ShieldAlert,
  Zap,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const AutonomousSelfHealingBanner: React.FC = () => {
  const [frame, setFrame] = useState<TelemetryFrame>(() => telemetryStreamEngine.getCurrentFrame());
  const [countdown, setCountdown] = useState<number>(10);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isExecuted, setIsExecuted] = useState<boolean>(false);
  const [activeAnomaly, setActiveAnomaly] = useState<string>('');

  const countdownRef = useRef<number>(10);
  countdownRef.current = countdown;

  useEffect(() => {
    const unsubscribe = telemetryStreamEngine.subscribe((latestFrame) => {
      setFrame(latestFrame);

      // If new anomaly appears and it's WARNING or CRITICAL, reset countdown
      if (
        (latestFrame.severity === 'CRITICAL' || latestFrame.severity === 'WARNING') &&
        latestFrame.anomalyName !== 'Nominal Operations'
      ) {
        if (latestFrame.anomalyName !== activeAnomaly) {
          setActiveAnomaly(latestFrame.anomalyName);
          setCountdown(10);
          setIsPaused(false);
          setIsExecuted(false);
        }
      } else if (latestFrame.severity === 'NOMINAL') {
        setActiveAnomaly('');
        setIsExecuted(false);
      }
    });

    return unsubscribe;
  }, [activeAnomaly]);

  // 1-second countdown interval
  useEffect(() => {
    if (!activeAnomaly || isPaused || isExecuted) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          executeSelfHealingProtocol('AUTOMATED_FAIL_SAFE_TIMER');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAnomaly, isPaused, isExecuted]);

  const getMitigationProtocol = (anomalyName: string) => {
    const name = anomalyName.toLowerCase();
    if (name.includes('hypoxia') || name.includes('oxygen') || name.includes('oga')) {
      return {
        subsystem: 'ECLSS Atmospheric Buffer (O2)',
        action: 'Inject 100% O2 secondary buffer at +2.4 psig into Crew Habitat Module',
        code: 'PROTO-ECLSS-O2-AUTO',
      };
    }
    if (name.includes('carbon') || name.includes('hypercapnia') || name.includes('scrubber')) {
      return {
        subsystem: 'ECLSS CO2 Removal Assembly',
        action: 'Engage Auxiliary Loop Fan B & Amine Bed Desorption to reduce pCO2 < 2.0 mmHg',
        code: 'PROTO-CDRA-RESIN-AUTO',
      };
    }
    if (name.includes('depress') || name.includes('pressure') || name.includes('hull')) {
      return {
        subsystem: 'Gateway Structural Integrity & Pressure',
        action: 'Isolate Compartment Airlock 2B and pressurize nitrogen/oxygen accumulator',
        code: 'PROTO-HULL-ISO-AUTO',
      };
    }
    if (name.includes('vestibular') || name.includes('space motion') || name.includes('sms')) {
      return {
        subsystem: 'Bio-Acoustic & Neuro-Vestibular Control',
        action: 'Deploy dynamic artificial horizon visual references and sensory recalibration audio',
        code: 'PROTO-NEURO-STAB-AUTO',
      };
    }
    return {
      subsystem: 'Autonomous Flight Surgeon Diagnostics',
      action: 'Recalibrate biosensor setpoint filters and administer targeted countermeasures',
      code: 'PROTO-FLT-SURG-AUTO',
    };
  };

  const executeSelfHealingProtocol = (triggerType: 'MANUAL_OVERRIDE' | 'AUTOMATED_FAIL_SAFE_TIMER') => {
    const protocol = getMitigationProtocol(activeAnomaly || frame.anomalyName);

    // 1. Reset telemetry stream engine to nominal baseline
    telemetryStreamEngine.setTargetState({
      ...NOMINAL_HEALTH_STATE,
      anomalyName: 'Nominal Operations',
      severity: 'NOMINAL',
      isAnomalyActive: false,
    });

    // 2. Log in Mission Audit Trail
    missionAuditTrailService.logEvent({
      metTimestamp: 'MET +142d 18:24:00',
      eventType: 'COUNTERMEASURE_EXECUTED',
      severity: 'NOMINAL',
      title: `Autonomous Mitigation Executed: ${protocol.code}`,
      description: `${protocol.action} (Trigger: ${triggerType})`,
      actor: triggerType === 'AUTOMATED_FAIL_SAFE_TIMER' ? 'Autonomous AI Flight Controller' : 'Console Flight Director',
      telemetrySnapshot: {
        heartRate: frame.heartRate,
        spo2: frame.spo2,
        bodyTemperature: frame.bodyTemperature,
        systolicBP: frame.systolicBP,
        diastolicBP: frame.diastolicBP,
        respiratoryRate: frame.respiratoryRate,
        cabinPressurePsi: frame.cabinPressurePsi,
        cabinCo2MmHg: frame.cabinCo2MmHg,
        vestibularConflictScore: frame.vestibularConflictScore,
      },
    });

    // 3. Audio Announcement
    voiceAlertService.speakWarningAlert(
      'Autonomous countermeasure executed',
      'Life support systems returning to nominal baseline'
    );

    setIsExecuted(true);
    setTimeout(() => {
      setActiveAnomaly('');
      setIsExecuted(false);
    }, 4500);
  };

  // Only render when an anomaly is active
  if (!activeAnomaly && !isExecuted) return null;

  const protocol = getMitigationProtocol(activeAnomaly || frame.anomalyName);
  const isCritical = frame.severity === 'CRITICAL';
  const progressPercent = Math.max(0, Math.min(100, (countdown / 10) * 100));

  return (
    <div
      className={`w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 mb-4 transition-all duration-500`}
    >
      <div
        className={`rounded-2xl p-4 sm:p-5 border shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all ${
          isExecuted
            ? 'bg-emerald-950/80 border-emerald-500/50 shadow-[0_0_30px_rgba(33,212,165,0.25)]'
            : isCritical
            ? 'bg-rose-950/90 border-rose-500/60 shadow-[0_0_30px_rgba(255,83,104,0.3)] animate-pulse'
            : 'bg-amber-950/90 border-amber-500/60 shadow-[0_0_30px_rgba(255,181,71,0.25)]'
        }`}
      >
        {/* Glow backdrop indicator */}
        <div
          className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
            isExecuted ? 'bg-emerald-500/20' : isCritical ? 'bg-rose-500/20' : 'bg-amber-500/20'
          }`}
        />

        {isExecuted ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    AUTONOMOUS SELF-HEALING COMPLETE
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold">
                    {protocol.code}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  {protocol.action}
                </div>
                <p className="text-xs text-emerald-300/80 font-mono mt-0.5">
                  All physiological and environmental indicators recalibrated to nominal Gaussian envelopes.
                </p>
              </div>
            </div>

            <div className="text-xs font-mono text-emerald-400 flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>STABILIZING SENSORS...</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Left: Anomaly & Autonomous Action info */}
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                  isCritical
                    ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                    : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                }`}
              >
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isCritical ? 'bg-rose-900/80 text-rose-300' : 'bg-amber-900/80 text-amber-300'
                    }`}
                  >
                    AUTONOMOUS FAIL-SAFE ENGAGED
                  </span>
                  <span className="text-xs font-mono text-slate-300">
                    ANOMALY: <strong className="text-white">{activeAnomaly}</strong>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    [SYSTEM: {protocol.subsystem}]
                  </span>
                </div>

                <div className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>{protocol.action}</span>
                </div>
              </div>
            </div>

            {/* Right: Countdown timer & Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
              {/* Countdown Ticker */}
              <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl font-mono">
                <Clock
                  className={`w-4 h-4 ${
                    isCritical ? 'text-rose-400 animate-spin' : 'text-amber-400 animate-pulse'
                  }`}
                />
                <div className="text-left">
                  <div className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">
                    {isPaused ? 'TIMER HOLD' : 'AUTO-EXECUTE IN'}
                  </div>
                  <div className="text-sm font-extrabold text-white tabular-nums tracking-wider">
                    00:{countdown < 10 ? `0${countdown}` : countdown}s
                  </div>
                </div>

                {/* Micro progress bar */}
                <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-1">
                  <div
                    className={`h-full transition-all duration-1000 ${
                      isCritical ? 'bg-rose-500' : 'bg-amber-400'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Pause/Resume button */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                title={isPaused ? 'Resume countdown' : 'Hold countdown'}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
                <span>{isPaused ? 'RESUME' : 'HOLD'}</span>
              </button>

              {/* Execute Now button */}
              <button
                onClick={() => executeSelfHealingProtocol('MANUAL_OVERRIDE')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:brightness-110 text-slate-950 text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.4)] cursor-pointer flex items-center gap-1.5 tracking-wide"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>EXECUTE NOW</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
