import React from 'react';
import {
  Calendar,
  Radio,
  Zap,
  Moon,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { AstronautProfile, ActivityRecord } from '../types';

interface MissionHighlightsGridProps {
  astronaut: AstronautProfile;
  activityRecords?: ActivityRecord[];
  cabinPressurePsi?: number;
  cabinCo2MmHg?: number;
}

export const MissionHighlightsGrid: React.FC<MissionHighlightsGridProps> = ({
  astronaut,
  activityRecords = [],
  cabinPressurePsi = 14.7,
  cabinCo2MmHg = 2.2,
}) => {
  // Mission Day Progress
  const totalMissionPlannedDays = 180;
  const missionProgressPercent = Math.min(
    100,
    Math.round((astronaut.missionDay / totalMissionPlannedDays) * 100)
  );

  // Cumulative Radiation Calculation
  const radPercent = Math.min(
    100,
    Math.round((astronaut.radiationCumulativeMSv / (astronaut.radiationMissionLimitMSv || 250)) * 100)
  );
  const remainingRadMargin = (
    (astronaut.radiationMissionLimitMSv || 250) - astronaut.radiationCumulativeMSv
  ).toFixed(1);

  // ARED schedule calculation
  const latestActivity = activityRecords[activityRecords.length - 1];
  const nextAredTime = '14:30 UTC';
  const nextAredCountdown = 'T-01:45:00';

  return (
    <section
      aria-label="Mission Highlights & Flight Protocol Schedule"
      className="w-full bg-[#0B1224]/85 border border-[#00E5FF]/20 rounded-3xl p-4 sm:p-6 shadow-xl backdrop-blur-md"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide uppercase font-sans">
              Mission Highlights & Flight Protocol Schedule
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              NASA Human Research Program (HRP) · Real-Time Station Synchronization
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>DSN GOLDSTONE SYNCHRONIZED</span>
        </div>
      </div>

      {/* 2x2 CSS Grid on Desktop, Single-Column on Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CARD 1: Current Mission Day & Progress */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#050816]/90 border border-slate-800 hover:border-[#00E5FF]/40 transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 group-hover:text-white transition-colors">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Current Mission Day
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  {astronaut.mission}
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shrink-0">
              SOL {astronaut.missionDay} ACTIVE
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-white tracking-tight">
                T+{astronaut.missionDay}
              </span>
              <span className="text-xs font-mono text-slate-400">
                / {totalMissionPlannedDays} Days Planned
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              {astronaut.destination} · Cumulative in Space:{' '}
              <strong className="text-slate-200">{astronaut.totalDaysInSpace} Sols</strong>
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span>Mission Phase Progress</span>
              <span className="text-cyan-400 font-bold tabular-nums">{missionProgressPercent}% Elapsed</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-[#438BFF] rounded-full transition-all duration-700"
                style={{ width: `${missionProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* CARD 2: Cumulative Radiation Exposure */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#050816]/90 border border-slate-800 hover:border-amber-500/40 transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-950/60 border border-amber-500/30 text-amber-400 group-hover:text-white transition-colors">
                <Radio className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Cumulative Radiation Exposure
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  NASA Career HRP Ceiling: {astronaut.radiationMissionLimitMSv} mSv
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 shrink-0">
              RATE: 0.55 mSv/DAY
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-white tracking-tight">
                {astronaut.radiationCumulativeMSv.toFixed(1)}
              </span>
              <span className="text-xs uppercase font-mono text-slate-400 font-bold">
                mSv Absorbed
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Active Dosimeter · Safe Career Margin:{' '}
              <strong className="text-emerald-400">{remainingRadMargin} mSv</strong>
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
              <span>Dose Fraction of Cap</span>
              <span className="text-amber-400 font-bold tabular-nums">{radPercent}% Utilized</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-700"
                style={{ width: `${radPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* CARD 3: Next ARED Resistance Exercise Time */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#050816]/90 border border-slate-800 hover:border-emerald-500/40 transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 group-hover:text-white transition-colors">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Next ARED Resistance Exercise Time
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  NASA HRP Countermeasure Prescription
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shrink-0">
              SCHEDULED TODAY
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-white tracking-tight">
                {nextAredTime}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                {nextAredCountdown}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Session: <strong className="text-slate-200">60 Min High-Load Axial Resistance</strong> (Squats & Deadlifts)
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target: Prevent 1.0%/mo bone mineral loss</span>
            </span>
            <span className="text-emerald-400 font-bold">120 kg Load</span>
          </div>
        </div>

        {/* CARD 4: ECLSS Atmosphere & Circadian Sleep Window */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#050816]/90 border border-slate-800 hover:border-cyan-500/40 transition-all duration-200 flex flex-col justify-between group">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400 group-hover:text-white transition-colors">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  ECLSS Habitat & Circadian Schedule
                </span>
                <span className="text-xs text-slate-300 font-medium">
                  Atmospheric Integrity & Sleep Window
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 shrink-0">
              REST: 22:30 UTC
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-white tracking-tight">
                {cabinPressurePsi.toFixed(1)}
              </span>
              <span className="text-xs uppercase font-mono text-cyan-400 font-bold">
                PSI (Normobaric)
              </span>
              <span className="text-slate-600 font-mono">·</span>
              <span className="text-xs font-mono text-amber-300 font-bold">
                CO2: {cabinCo2MmHg.toFixed(1)} mmHg
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Circadian Window: <strong className="text-slate-200">22:30 – 06:30 UTC (8.0 Hours Target)</strong>
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Blue-depleted spectrum shift active</span>
            </span>
            <span className="text-cyan-400 font-bold">Sleep Readiness: 86%</span>
          </div>
        </div>
      </div>
    </section>
  );
};
