import React, { useState, useEffect } from 'react';
import {
  Heart,
  Droplets,
  Thermometer,
  Activity,
  Wind,
  Compass,
  Moon,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Gauge,
  Radio,
  Flame,
  Info,
  Volume2,
} from 'lucide-react';
import { AnomalyInjectionState } from './SimulationAnomalyPanel';
import {
  telemetryStreamEngine,
  TelemetryFrame,
} from '../services/telemetryStreamEngine';
import { voiceAlertService } from '../services/voiceAlertService';

interface GlassCockpitHUDProps {
  anomalyState: AnomalyInjectionState;
  onOpenAnomalyPanel: () => void;
  onResetNominal: () => void;
  onOpenAuditModal?: () => void;
}

export const GlassCockpitHUD: React.FC<GlassCockpitHUDProps> = ({
  anomalyState,
  onOpenAnomalyPanel,
  onResetNominal,
  onOpenAuditModal,
}) => {
  // Real-time progressive streaming frame state (updated every 1,000ms with progressive drift)
  const [frame, setFrame] = useState<TelemetryFrame>(telemetryStreamEngine.getCurrentFrame());

  useEffect(() => {
    telemetryStreamEngine.setTargetState(anomalyState);
  }, [anomalyState]);

  useEffect(() => {
    return telemetryStreamEngine.subscribe((newFrame) => {
      setFrame(newFrame);
    });
  }, []);

  // Circular Arc Gauge Component for Glass Cockpit with GPU acceleration
  const renderArcGauge = (
    value: number,
    min: number,
    max: number,
    unit: string,
    label: string,
    status: 'NOMINAL' | 'WARNING' | 'CRITICAL',
    baselineStr: string,
    icon: React.ReactNode
  ) => {
    // Normalization for 220 degree arc
    const clampedVal = Math.min(Math.max(value, min), max);
    const fraction = (clampedVal - min) / (max - min);
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    // 220 degrees of 360 degrees
    const totalArc = (220 / 360) * circumference;
    const strokeDashoffset = totalArc - fraction * totalArc;

    const strokeColor =
      status === 'CRITICAL'
        ? '#FF5368'
        : status === 'WARNING'
        ? '#FFB547'
        : '#00E5FF';

    const bgBadge =
      status === 'CRITICAL'
        ? 'bg-rose-950/80 text-rose-300 border-rose-500 animate-pulse'
        : status === 'WARNING'
        ? 'bg-amber-950/80 text-amber-300 border-amber-500'
        : 'bg-emerald-950/80 text-emerald-300 border-emerald-500';

    return (
      <div className="bg-[#070D1F]/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-3.5 sm:p-4 flex flex-col justify-between transition-all duration-200 relative group shadow-sm transform-gpu will-change-transform">
        {/* Glow corner */}
        <div
          className={`absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl pointer-events-none opacity-30 ${
            status === 'CRITICAL'
              ? 'bg-rose-500'
              : status === 'WARNING'
              ? 'bg-amber-500'
              : 'bg-cyan-500'
          }`}
        />

        {/* Top: Label and Status Badge */}
        <div className="flex items-center justify-between gap-1 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 font-bold truncate">
            {icon}
            <span className="truncate">{label}</span>
          </div>
          <span
            className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded border uppercase shrink-0 ${bgBadge}`}
          >
            ● {status}
          </span>
        </div>

        {/* Middle: Circular Arc Dial & Live Value */}
        <div className="relative flex items-center justify-center my-1 select-none">
          <svg className="w-28 h-28 transform -rotate-[200deg] transform-gpu will-change-transform" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#1e293b"
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={`${totalArc} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Foreground Live Arc */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={strokeColor}
              strokeWidth="7"
              fill="transparent"
              strokeDasharray={`${totalArc} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out transform-gpu will-change-transform"
            />
          </svg>

          {/* Central Digital Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pt-2">
            <span
              className="text-2xl font-black font-mono tracking-tight tabular-nums transition-colors duration-300"
              style={{ color: strokeColor }}
            >
              {typeof value === 'number' && Number.isInteger(value) ? value : value.toFixed(1)}
            </span>
            <span className="text-[10px] font-mono text-slate-400 font-bold -mt-1">
              {unit}
            </span>
          </div>
        </div>

        {/* Bottom: Baseline & Context */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 mt-1">
          <span className="text-slate-500 truncate">{baselineStr}</span>
          <span className="text-cyan-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            1 Hz LIVE
          </span>
        </div>
      </div>
    );
  };

  // Derive status badges for each biometric based on live progressive frame
  const hrStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL' =
    frame.heartRate > 120 || frame.heartRate < 45
      ? 'CRITICAL'
      : frame.heartRate > 95 || frame.heartRate < 52
      ? 'WARNING'
      : 'NOMINAL';

  const spo2Status: 'NOMINAL' | 'WARNING' | 'CRITICAL' =
    frame.spo2 < 90
      ? 'CRITICAL'
      : frame.spo2 < 95
      ? 'WARNING'
      : 'NOMINAL';

  const tempStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL' =
    frame.bodyTemperature > 38.5 || frame.bodyTemperature < 35.5
      ? 'CRITICAL'
      : frame.bodyTemperature > 37.5 || frame.bodyTemperature < 36.0
      ? 'WARNING'
      : 'NOMINAL';

  const eclssPressureStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL' =
    frame.cabinPressurePsi < 12.0
      ? 'CRITICAL'
      : frame.cabinPressurePsi < 13.8
      ? 'WARNING'
      : 'NOMINAL';

  const eclssCo2Status: 'NOMINAL' | 'WARNING' | 'CRITICAL' =
    frame.cabinCo2MmHg > 4.5
      ? 'CRITICAL'
      : frame.cabinCo2MmHg > 3.2
      ? 'WARNING'
      : 'NOMINAL';

  const vestibularStatus: 'NOMINAL' | 'WARNING' | 'CRITICAL' =
    frame.vestibularConflictScore > 7.0
      ? 'CRITICAL'
      : frame.vestibularConflictScore > 4.0
      ? 'WARNING'
      : 'NOMINAL';

  return (
    <div className="w-full space-y-6">
      {/* GLASS COCKPIT CONTROLS & FLIGHT DECK HEADER */}
      <div className="bg-[#050B1B]/95 border-2 border-cyan-500/40 rounded-3xl p-4 sm:p-6 shadow-[0_0_35px_rgba(0,229,255,0.12)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-400 animate-spin-slow" />
                TACTICAL GLASS COCKPIT HUD · MISSION CONTROL DECK
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                CREW DRAGON / NASA GATEWAY STANDARD
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Primary Flight Biosensors & Subsystem Life Support</span>
            </h2>
            <p className="text-xs text-slate-300 font-sans">
              Autonomous 1,000ms telemetry stream with progressive physiological drift algorithms, voice announcements, and flight surgeon AI countermeasures.
            </p>
          </div>

          {/* Hackathon Judge Simulation Actions */}
          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={onOpenAnomalyPanel}
              className="px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-mono text-xs font-extrabold tracking-wide uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer active:scale-95"
              title="Inject Tactical Anomalies for Demo and Evaluation"
            >
              <Zap className="w-4 h-4 text-white animate-pulse" />
              <span>INJECT MISSION ANOMALY (JUDGE SIMULATOR)</span>
            </button>

            {anomalyState.isAnomalyActive && (
              <button
                onClick={onResetNominal}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-mono text-xs font-bold transition-all cursor-pointer"
                title="Reset to 100% Nominal Setpoint"
              >
                Reset Nominal
              </button>
            )}

            {onOpenAuditModal && (
              <button
                onClick={onOpenAuditModal}
                className="px-3 py-2.5 rounded-xl bg-[#101F3D] hover:bg-[#152a54] border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition-all cursor-pointer"
                title="View Full Mission Audit Trail"
              >
                Audit Log
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MODULE 1: 5 CORE ASTRONAUT BIOMETRICS (CIRCULAR ARC DIALS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between font-mono text-xs text-slate-400">
          <span className="uppercase tracking-wider font-bold flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            1. Core Astronaut Biometrics (5 Biosensor HUD Gauges)
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Autonomous 1Hz Progressive Drift Loop Active
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Gauge 1: Heart Rate */}
          {renderArcGauge(
            frame.heartRate,
            40,
            160,
            'BPM',
            'Heart Rate',
            hrStatus,
            'Resting: 58 BPM',
            <Heart className="w-3.5 h-3.5 text-rose-400" />
          )}

          {/* Gauge 2: SpO2 */}
          {renderArcGauge(
            frame.spo2,
            80,
            100,
            '%',
            'Blood Oxygen',
            spo2Status,
            'Target: > 95%',
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          )}

          {/* Gauge 3: Body Temperature */}
          {renderArcGauge(
            frame.bodyTemperature,
            35,
            40,
            '°C',
            'Core Temp',
            tempStatus,
            'Set: 36.6°C',
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          )}

          {/* Gauge 4: Blood Pressure (Systolic) */}
          {renderArcGauge(
            frame.systolicBP,
            80,
            180,
            'mmHg',
            'Systolic BP',
            frame.systolicBP > 140 ? 'CRITICAL' : 'NOMINAL',
            `MAP: ${Math.round((frame.systolicBP + 2 * frame.diastolicBP) / 3)} mmHg`,
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          )}

          {/* Gauge 5: Respiration Rate */}
          {renderArcGauge(
            frame.respiratoryRate,
            8,
            32,
            'br/min',
            'Respiration',
            frame.respiratoryRate > 22 ? 'WARNING' : 'NOMINAL',
            'Thoracic: 14 br/min',
            <Wind className="w-3.5 h-3.5 text-cyan-300" />
          )}
        </div>
      </div>

      {/* MODULE 2 & 3: ECLSS ENVIRONMENTAL LIFE SUPPORT & VESTIBULAR/FATIGUE INDEX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Module 2: Environmental Life Support (ECLSS) */}
        <div className="bg-[#070D1F]/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                <Wind className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  2. ENVIRONMENTAL LIFE SUPPORT (ECLSS)
                </h3>
                <p className="text-[11px] text-slate-400 font-sans">
                  Habitat cabin atmosphere & metabolic scrubber surveillance
                </p>
              </div>
            </div>
            <span
              className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded border uppercase ${
                eclssPressureStatus === 'CRITICAL' || eclssCo2Status === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-300 border-rose-500'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-500'
              }`}
            >
              ● {eclssPressureStatus === 'CRITICAL' || eclssCo2Status === 'CRITICAL' ? 'ALERT' : 'NOMINAL'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
            {/* Cabin Pressure */}
            <div className="bg-[#020512] p-3 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 block">CABIN PRESSURE</span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-lg font-black tabular-nums ${
                    eclssPressureStatus === 'CRITICAL' ? 'text-rose-400 animate-pulse' : 'text-cyan-300'
                  }`}
                >
                  {frame.cabinPressurePsi.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-500">PSI</span>
              </div>
              <span className="text-[9px] text-slate-400 block">Nominal: 14.7 psi (101.3 kPa)</span>
            </div>

            {/* OGA Oxygen Generator */}
            <div className="bg-[#020512] p-3 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 block">O2 GENERATOR (OGA)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-emerald-300">21.0%</span>
                <span className="text-[10px] text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <span className="text-[9px] text-slate-400 block">Electrolysis setpoint: 100%</span>
            </div>

            {/* CO2 Scrubber (CDRA) */}
            <div className="bg-[#020512] p-3 rounded-xl border border-slate-800/80 space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block">CO2 SCRUBBERS (CDRA)</span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-lg font-black tabular-nums ${
                    eclssCo2Status === 'CRITICAL'
                      ? 'text-rose-400 animate-pulse'
                      : eclssCo2Status === 'WARNING'
                      ? 'text-amber-400'
                      : 'text-cyan-300'
                  }`}
                >
                  {frame.cabinCo2MmHg.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-500">mmHg</span>
              </div>
              <span className="text-[9px] text-slate-400 block">Limit: &lt; 3.0 mmHg</span>
            </div>
          </div>
        </div>

        {/* Module 3: Vestibular & Fatigue Index (ESA / TRISH Parameters) */}
        <div className="bg-[#070D1F]/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <Compass className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white font-mono">
                  3. VESTIBULAR & FATIGUE INDEX (ESA/TRISH)
                </h3>
                <p className="text-[11px] text-slate-400 font-sans">
                  Otolith-ocular reflex conflict & microgravity cognitive sleep debt
                </p>
              </div>
            </div>
            <span
              className={`text-[9px] font-mono font-extrabold px-2 py-0.5 rounded border uppercase ${
                vestibularStatus === 'CRITICAL'
                  ? 'bg-rose-950 text-rose-300 border-rose-500'
                  : vestibularStatus === 'WARNING'
                  ? 'bg-amber-950 text-amber-300 border-amber-500'
                  : 'bg-emerald-950 text-emerald-300 border-emerald-500'
              }`}
            >
              ● {vestibularStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            {/* Vestibular Disorientation Score */}
            <div className="bg-[#020512] p-3 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 block">OTOLITH CONFLICT INDEX</span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-lg font-black tabular-nums ${
                    vestibularStatus === 'CRITICAL'
                      ? 'text-rose-400'
                      : vestibularStatus === 'WARNING'
                      ? 'text-amber-400'
                      : 'text-emerald-300'
                  }`}
                >
                  {frame.vestibularConflictScore.toFixed(1)}
                </span>
                <span className="text-[10px] text-slate-500">/ 10</span>
              </div>
              <span className="text-[9px] text-slate-400 block">
                {frame.vestibularConflictScore > 4.0
                  ? 'Elevated Space Motion Sickness'
                  : 'Gravito-inertial adaptation nominal'}
              </span>
            </div>

            {/* TRISH Sleep Debt & Fatigue */}
            <div className="bg-[#020512] p-3 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-400 block">TRISH FATIGUE RECOVERY</span>
              <div className="flex items-baseline gap-1">
                <span className="text-lg font-black text-cyan-300 tabular-nums">
                  {frame.trishRecoveryScore}%
                </span>
                <span className="text-[10px] text-cyan-400 font-bold">
                  {frame.trishRecoveryScore > 75 ? 'RESTORATIVE' : 'FATIGUED'}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 block">
                {frame.trishRecoveryScore > 75 ? 'Slow-wave delta sleep preserved' : 'Elevated cognitive sleep debt'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
