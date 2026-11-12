import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Activity,
  ArrowRight,
  Clock,
  Send,
  Sliders,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Power,
  Flame,
  Layers,
} from 'lucide-react';
import { voiceAlertService } from '../services/voiceAlertService';
import { missionAuditTrailService } from '../services/missionAuditTrailService';
import { AstronautProfile, RadiationRecord } from '../types';

interface SolarStormShieldingEngineProps {
  astronaut: AstronautProfile;
  radiationRecords?: RadiationRecord[];
  className?: string;
}

export type StormShelterStatus = 'STANDBY' | 'SPE_DETECTED' | 'COUNTDOWN_ACTIVE' | 'SHELTER_LOCKED' | 'NOMINAL_RESTORED';

export const SolarStormShieldingEngine: React.FC<SolarStormShieldingEngineProps> = ({
  astronaut,
  radiationRecords = [],
  className = '',
}) => {
  // SPE & Storm Shelter State
  const [shelterStatus, setShelterStatus] = useState<StormShelterStatus>('STANDBY');
  const [solarProtonFluxPfu, setSolarProtonFluxPfu] = useState<number>(1.4); // Nominal ~1.2 - 2.0 pfu
  const [flareClassification, setFlareClassification] = useState<string>('Class B1.2 (Quiet)');
  const [countdownSeconds, setCountdownSeconds] = useState<number>(600); // 10 minutes to peak proton arrival
  const [shieldingDepthGcm2, setShieldingDepthGcm2] = useState<number>(12); // Habitual module: 12 g/cm2, Storm shelter: 28 g/cm2

  // Automated Subsystem Isolation States
  const [crewRelocated, setCrewRelocated] = useState<boolean>(false);
  const [kaBandBurstTransmitted, setKaBandBurstTransmitted] = useState<boolean>(false);
  const [nonEssentialBussesPoweredDown, setNonEssentialBussesPoweredDown] = useState<boolean>(false);
  const [isTransmittingBurst, setIsTransmittingBurst] = useState<boolean>(false);

  // 180-Day Projection Parameters
  const missionDay = astronaut.missionDay || 142;
  const currentCumulativeMsv = astronaut.radiationCumulativeMSv || 78.4;
  const careerLimitMsv = astronaut.radiationMissionLimitMSv || 250.0;

  // Countdown timer effect
  useEffect(() => {
    let timer: any = null;
    if (shelterStatus === 'COUNTDOWN_ACTIVE' && countdownSeconds > 0) {
      timer = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            setShelterStatus('SHELTER_LOCKED');
            setShieldingDepthGcm2(28);
            voiceAlertService.speakCriticalAlert(
              'Storm Shelter Sealed',
              'Polyethylene core water-wall shielding active at 28 grams per square centimeter. Proton flux attenuated by 88%.'
            );
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [shelterStatus, countdownSeconds]);

  // Handler: Trigger Simulated Class X9.2 Solar Particle Event
  const handleTriggerSolarStorm = () => {
    setShelterStatus('COUNTDOWN_ACTIVE');
    setSolarProtonFluxPfu(1420); // Severe Solar Flare Flux
    setFlareClassification('Class X9.2 Solar Proton Flare');
    setCountdownSeconds(600);
    setCrewRelocated(false);
    setKaBandBurstTransmitted(false);
    setNonEssentialBussesPoweredDown(false);

    // Audio announcement
    voiceAlertService.speakCriticalAlert(
      'Solar Particle Event In Progress',
      'Class X9.2 Solar Proton Flare detected by GOES-18 and Gateway Dosimetry Array. Proton flux 1,420 pfu. Initiating 10-minute storm shelter lockdown.'
    );

    // Mission audit log
    missionAuditTrailService.logEvent({
      metTimestamp: `MET +${missionDay}d 12:45:00`,
      eventType: 'ANOMALY_INJECTED',
      severity: 'CRITICAL',
      title: 'Solar Particle Event (SPE) Storm Shelter Warning',
      description: 'GOES-18 solar sensor registers Class X9.2 solar flare with energetic proton flux exceeding 1,420 pfu at >10 MeV. Mandatory crew relocation to polyethylene quarters.',
      actor: 'Autonomous Space Weather Dosimetry Array',
    });
  };

  // Handler: Execute Ka-Band Telemetry Burst
  const handleExecuteKaBandBurst = () => {
    setIsTransmittingBurst(true);
    setTimeout(() => {
      setIsTransmittingBurst(false);
      setKaBandBurstTransmitted(true);
      missionAuditTrailService.logEvent({
        metTimestamp: `MET +${missionDay}d 12:47:15`,
        eventType: 'COUNTERMEASURE_EXECUTED',
        severity: 'NOMINAL',
        title: 'Ka-Band Telemetry Burst Transmitted to NASA MCC-H',
        description: 'Transmitted high-frequency 512-bit encrypted biotelemetry and radiation snapshot packet to Goldstone 70m Deep Space Station.',
        actor: 'Autonomous Communications Terminal',
      });
    }, 1200);
  };

  // Handler: Power Down Non-Essential Busses
  const handlePowerDownBusses = () => {
    setNonEssentialBussesPoweredDown(true);
    missionAuditTrailService.logEvent({
      metTimestamp: `MET +${missionDay}d 12:48:30`,
      eventType: 'COUNTERMEASURE_EXECUTED',
      severity: 'NOMINAL',
      title: 'Non-Essential Subsystem Busses Isolated',
      description: 'Powered down science payload cryocoolers, Canadarm3 external servos, and centrifuge circuits to prevent single-event latchups.',
      actor: 'Gateway Electrical Power System (EPS)',
    });
  };

  // Handler: Confirm Crew Relocation
  const handleConfirmCrewRelocation = () => {
    setCrewRelocated(true);
    setShieldingDepthGcm2(28);
    missionAuditTrailService.logEvent({
      metTimestamp: `MET +${missionDay}d 12:49:10`,
      eventType: 'COUNTERMEASURE_EXECUTED',
      severity: 'NOMINAL',
      title: 'Crew Relocated to Polyethylene Storm Shelter Quarters',
      description: 'All 3 crew members successfully assembled inside the Central Water-Wall Core Quarters (28 g/cm² areal mass).',
      actor: 'CDR Sarah Chen (Astronaut)',
    });
  };

  // Handler: Reset to Nominal Standby
  const handleResetToNominal = () => {
    setShelterStatus('STANDBY');
    setSolarProtonFluxPfu(1.4);
    setFlareClassification('Class B1.2 (Quiet)');
    setCountdownSeconds(600);
    setShieldingDepthGcm2(12);
    setCrewRelocated(false);
    setKaBandBurstTransmitted(false);
    setNonEssentialBussesPoweredDown(false);

    voiceAlertService.speakWarningAlert(
      'Solar Proton Storm Dissipated',
      'Flux returned to nominal background levels (1.4 pfu). Habitat modules cleared for standard transit operations.'
    );

    missionAuditTrailService.logEvent({
      metTimestamp: `MET +${missionDay}d 14:10:00`,
      eventType: 'SYSTEM_NOMINAL_RESTORED',
      severity: 'NOMINAL',
      title: 'Space Radiation Environment Returned to Nominal GCR Baseline',
      description: 'Proton flux attenuated below 10 pfu. Normal electrical bus power restored; crew quarters lockdown lifted.',
      actor: 'NASA Space Radiation Analysis Group (SRAG)',
    });
  };

  // 180-Day Trajectory Projection Math
  // Daily GCR: ~0.55 mSv/day nominal, Storm Shelter: ~0.15 mSv/day, Unshielded: ~1.2 mSv/day
  const daysTotal = 180;
  const projectionSteps = [0, 30, 60, 90, 120, 142, 160, 180];
  const projectedValues = projectionSteps.map((d) => {
    const unshielded = +(d * 1.35).toFixed(1);
    const nominalPlanned = +(d * 0.55).toFixed(1);
    const withStormShelter = +(Math.min(currentCumulativeMsv, d * 0.55) + (d > missionDay ? (d - missionDay) * 0.32 : 0)).toFixed(1);
    return {
      day: d,
      unshielded,
      nominalPlanned,
      withStormShelter,
    };
  });

  const projectedDay180Dose = (currentCumulativeMsv + (180 - missionDay) * (shelterStatus === 'SHELTER_LOCKED' ? 0.32 : 0.55)).toFixed(1);
  const remainingCareerMargin = (careerLimitMsv - Number(projectedDay180Dose)).toFixed(1);

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isStormActive = shelterStatus === 'COUNTDOWN_ACTIVE' || shelterStatus === 'SHELTER_LOCKED';

  return (
    <div
      className={`rounded-3xl bg-[#0B1221]/95 border ${
        isStormActive ? 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.25)]' : 'border-[#FFB547]/30 shadow-xl'
      } p-4 sm:p-6 space-y-6 transition-all duration-300 ${className}`}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#FFB547] uppercase font-bold tracking-wider">
            <Radio className="w-4 h-4 text-[#FFB547] animate-pulse" />
            <span>Autonomous Spacecraft Dosimetry & Storm Shielding Engine</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5 tracking-tight flex items-center gap-2">
            Solar Particle Event (SPE) Storm Shielding Protocol
            {isStormActive ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-red-500/40 bg-red-500/20 text-red-400 font-bold animate-pulse">
                CRITICAL WARNING · LOCKDOWN ACTIVE
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#21D4A5]/40 bg-[#21D4A5]/10 text-[#21D4A5] font-bold">
                NOMINAL GCR MONITORING
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time GCR trajectory forecasting & automated high-density polyethylene storm shelter activation (NASA-STD-3001)
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {!isStormActive ? (
            <button
              onClick={handleTriggerSolarStorm}
              className="px-3.5 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <Flame className="w-3.5 h-3.5 text-red-400" />
              <span>Simulate Class X9.2 Solar Flare</span>
            </button>
          ) : (
            <button
              onClick={handleResetToNominal}
              className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-mono text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Stand Down / Return to Nominal</span>
            </button>
          )}
        </div>
      </div>

      {/* METRIC STRIP: PROTON FLUX, CLASSIFICATION, SHIELDING DEPTH */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3.5 rounded-2xl bg-[#050816] border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] block">Energetic Proton Flux</span>
          <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums flex items-baseline gap-1">
            <span className={isStormActive ? 'text-red-400 animate-pulse' : 'text-[#FFB547]'}>
              {solarProtonFluxPfu}
            </span>
            <span className="text-xs text-slate-400 font-normal">pfu (&gt;10 MeV)</span>
          </div>
          <span className="text-[10px] text-slate-400 block">Nominal: &lt; 10 pfu</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#050816] border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] block">Solar Flare Classification</span>
          <div className="text-sm sm:text-base font-extrabold text-white mt-1">
            <span className={isStormActive ? 'text-red-400' : 'text-[#21D4A5]'}>
              {flareClassification}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block">Monitored via GOES-18</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#050816] border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] block">Active Areal Shielding Depth</span>
          <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums flex items-baseline gap-1">
            <span className={shieldingDepthGcm2 >= 28 ? 'text-[#21D4A5]' : 'text-[#00E5FF]'}>
              {shieldingDepthGcm2}
            </span>
            <span className="text-xs text-slate-400 font-normal">g/cm² (Polyethylene)</span>
          </div>
          <span className="text-[10px] text-slate-400 block">
            {shieldingDepthGcm2 >= 28 ? '88% Flux Attenuation Active' : 'Hab Module: 12 g/cm²'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#050816] border border-slate-800 space-y-1">
          <span className="text-slate-400 text-[11px] block">Projected 180-Day Dose</span>
          <div className="text-xl sm:text-2xl font-extrabold text-white tabular-nums flex items-baseline gap-1">
            <span className="text-[#00E5FF]">{projectedDay180Dose}</span>
            <span className="text-xs text-slate-400 font-normal">/ {careerLimitMsv} mSv</span>
          </div>
          <span className="text-[10px] text-[#21D4A5] block">
            Margin: +{remainingCareerMargin} mSv Remaining
          </span>
        </div>
      </div>

      {/* ACTIVE LOCKDOWN PROTOCOL CONTROLS (IF STORM ACTIVE) */}
      {isStormActive && (
        <div className="p-4 sm:p-5 rounded-2xl bg-red-950/30 border border-red-500/40 space-y-4 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/30 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
              <div>
                <h4 className="font-extrabold text-white text-sm">
                  SPE STORM SHELTER LOCKDOWN SEQUENCE
                </h4>
                <p className="text-[11px] text-red-300">
                  Target: Complete all 3 containment protocols before proton wave arrival
                </p>
              </div>
            </div>

            {/* Countdown Display */}
            <div className="flex items-center gap-2 bg-[#050816] px-3.5 py-1.5 rounded-xl border border-red-500/40">
              <Clock className="w-4 h-4 text-red-400" />
              <span className="text-slate-400 text-xs">PEAK ARRIVAL T-MINUS:</span>
              <span className="text-red-400 font-extrabold text-base tracking-widest tabular-nums animate-pulse">
                {formatCountdown(countdownSeconds)}
              </span>
            </div>
          </div>

          {/* 3 Step Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1: Crew Relocation */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              crewRelocated ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' : 'bg-[#050816] border-slate-800 text-slate-300'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-white text-xs">1. Crew Storm Shelter Assembly</span>
                {crewRelocated ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Mustering CDR Chen, PLT Vance, and MS Rostova into Central Water Wall Core (28 g/cm²).
              </p>
              <button
                onClick={handleConfirmCrewRelocation}
                disabled={crewRelocated}
                className={`w-full py-2 px-3 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                  crewRelocated
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-red-500/20 hover:bg-red-500/30 text-white border border-red-500/40'
                }`}
              >
                {crewRelocated ? '✓ Crew Quarters Sealed' : 'Confirm Crew In Shelter'}
              </button>
            </div>

            {/* Step 2: Ka-Band Telemetry Burst */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              kaBandBurstTransmitted ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' : 'bg-[#050816] border-slate-800 text-slate-300'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-white text-xs">2. Ka-Band DSN Telemetry Burst</span>
                {kaBandBurstTransmitted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Transmit 512-bit encrypted biotelemetry and radiation snapshot packet to NASA MCC-H.
              </p>
              <button
                onClick={handleExecuteKaBandBurst}
                disabled={kaBandBurstTransmitted || isTransmittingBurst}
                className={`w-full py-2 px-3 rounded-lg font-bold transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5 ${
                  kaBandBurstTransmitted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 text-white border border-[#00E5FF]/40'
                }`}
              >
                {isTransmittingBurst ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00E5FF]" />
                    <span>Transmitting Ka-Band...</span>
                  </>
                ) : kaBandBurstTransmitted ? (
                  '✓ Telemetry Burst Transmitted'
                ) : (
                  'Transmit Ka-Band Burst'
                )}
              </button>
            </div>

            {/* Step 3: EPS Bus Power Down */}
            <div className={`p-3.5 rounded-xl border transition-all ${
              nonEssentialBussesPoweredDown ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300' : 'bg-[#050816] border-slate-800 text-slate-300'
            }`}>
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-white text-xs">3. Power Down Non-Essential Busses</span>
                {nonEssentialBussesPoweredDown ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                Isolate science cryocoolers and Canadarm3 robotics to eliminate Single-Event Latchups.
              </p>
              <button
                onClick={handlePowerDownBusses}
                disabled={nonEssentialBussesPoweredDown}
                className={`w-full py-2 px-3 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                  nonEssentialBussesPoweredDown
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-amber-500/20 hover:bg-amber-500/30 text-white border border-amber-500/40'
                }`}
              >
                {nonEssentialBussesPoweredDown ? '✓ Busses Isolated (SEU Safe)' : 'Power Down Non-Essential Busses'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 180-DAY TRAJECTORY PROJECTION CHART */}
      <div className="space-y-3 font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-800/80 pt-4">
          <div>
            <h4 className="font-bold text-white text-sm">
              Cumulative Radiation Dose Projections (180-Day Mission Trajectory)
            </h4>
            <p className="text-slate-400 text-[11px]">
              Comparative trajectories: Unshielded Spacecraft vs Nominal GCR Baseline vs Storm Shelter Protocol
            </p>
          </div>
          <span className="text-[11px] text-slate-400 bg-[#050816] px-3 py-1 rounded-full border border-slate-800">
            Current: Sol {missionDay} · {currentCumulativeMsv} mSv
          </span>
        </div>

        {/* SVG Projection Curve */}
        <div className="p-4 rounded-2xl bg-[#050816] border border-slate-800">
          <div className="h-44 w-full">
            <svg viewBox="0 0 700 160" className="w-full h-full overflow-visible">
              {/* Grid lines */}
              <line x1="60" y1="20" x2="680" y2="20" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="60" y1="60" x2="680" y2="60" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="60" y1="100" x2="680" y2="100" stroke="#1e293b" strokeDasharray="3 3" />
              <line x1="60" y1="140" x2="680" y2="140" stroke="#334155" />

              {/* Y Axis Labels */}
              <text x="50" y="24" fill="#ef4444" fontSize="10" textAnchor="end">300 mSv</text>
              <text x="50" y="48" fill="#f59e0b" fontSize="10" textAnchor="end">250 mSv (Limit)</text>
              <text x="50" y="104" fill="#00E5FF" fontSize="10" textAnchor="end">100 mSv</text>
              <text x="50" y="144" fill="#64748b" fontSize="10" textAnchor="end">0</text>

              {/* NASA Career Limit Line (250 mSv threshold) */}
              <line x1="60" y1="44" x2="680" y2="44" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="4 4" />
              <text x="670" y="40" fill="#f59e0b" fontSize="9" textAnchor="end">NASA 250 mSv Mission Benchmark</text>

              {/* Unshielded Trajectory Curve (Red) */}
              <path
                d="M 60,140 Q 370,60 680,24"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.6"
                strokeDasharray="4 4"
                opacity="0.7"
              />

              {/* Nominal Planned Curve (Cyan) */}
              <path
                d="M 60,140 Q 370,110 680,72"
                fill="none"
                stroke="#00E5FF"
                strokeWidth="1.8"
                opacity="0.8"
              />

              {/* Active Shelter Optimized Curve (Emerald) */}
              <path
                d="M 60,140 Q 370,120 680,88"
                fill="none"
                stroke="#21D4A5"
                strokeWidth="2.2"
              />

              {/* Current Mission Day Marker (Sol 142) */}
              <line x1="544" y1="20" x2="544" y2="140" stroke="#00E5FF" strokeWidth="1.4" strokeDasharray="2 2" />
              <circle cx="544" cy="98" r="4" fill="#00E5FF" />
              <text x="544" y="14" fill="#00E5FF" fontSize="9" textAnchor="middle" fontWeight="bold">
                Sol {missionDay} (Now)
              </text>

              {/* X Axis Ticks */}
              <text x="60" y="155" fill="#64748b" fontSize="9" textAnchor="middle">Sol 0</text>
              <text x="215" y="155" fill="#64748b" fontSize="9" textAnchor="middle">Sol 45</text>
              <text x="370" y="155" fill="#64748b" fontSize="9" textAnchor="middle">Sol 90</text>
              <text x="525" y="155" fill="#64748b" fontSize="9" textAnchor="middle">Sol 135</text>
              <text x="680" y="155" fill="#64748b" fontSize="9" textAnchor="middle">Sol 180</text>
            </svg>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#ef4444] inline-block border-b border-dashed" />
                <span>Unshielded Deep Space (~340 mSv)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-[#00E5FF] inline-block" />
                <span>Nominal Hab Module (~184 mSv)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-[#21D4A5] rounded-sm inline-block" />
                <span className="text-white font-bold">Storm Shelter Optimized (~142 mSv)</span>
              </span>
            </div>
            <span className="text-slate-400">Standard: NASA-STD-3001 & ALARA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
