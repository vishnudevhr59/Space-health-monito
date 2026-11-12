import React, { useState, useEffect } from 'react';
import {
  crewBiometricMuxService,
  CrewMemberMuxState,
  CREW_MEMBERS,
} from '../services/crewBiometricMuxService';
import { AstronautProfile } from '../types';
import {
  Users,
  Heart,
  Droplets,
  Activity,
  Radio,
  Moon,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface CrewBiometricMuxMatrixProps {
  activeAstronaut: AstronautProfile;
  onSelectAstronaut: (profile: AstronautProfile) => void;
  className?: string;
}

export const CrewBiometricMuxMatrix: React.FC<CrewBiometricMuxMatrixProps> = ({
  activeAstronaut,
  onSelectAstronaut,
  className = '',
}) => {
  const [crewState, setCrewState] = useState<Record<string, CrewMemberMuxState>>(
    crewBiometricMuxService.getCrewMuxState()
  );
  const [activeTab, setActiveTab] = useState<'CARDS' | 'COMPARISON'>('CARDS');

  useEffect(() => {
    const unsub = crewBiometricMuxService.subscribe((state) => {
      setCrewState(state);
    });
    return unsub;
  }, []);

  const handleSwitchActive = (profile: AstronautProfile) => {
    crewBiometricMuxService.setActiveAstronautId(profile.id);
    onSelectAstronaut(profile);
  };

  const crewList = Object.values(crewState);

  return (
    <div
      className={`rounded-3xl bg-[#0B1221]/95 border border-[#00E5FF]/25 p-4 sm:p-6 shadow-xl space-y-5 ${className}`}
    >
      {/* HEADER WITH VIEW MODE TOGGLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] uppercase font-bold tracking-wider">
            <Users className="w-4 h-4 text-[#00E5FF]" />
            <span>Artemis Gateway Expedition 04 · Multi-Crew Telemetry MUX</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5 tracking-tight flex items-center gap-2">
            Real-Time Crew Biometric Multiplexer
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#21D4A5]/40 bg-[#21D4A5]/10 text-[#21D4A5] font-bold">
              3 CHANNELS CONCURRENT · 1Hz
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Simultaneous multi-astronaut biometric ingestion and differential microgravity adaptation tracking
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-[#050816] p-1 rounded-xl border border-slate-800 text-[11px] font-mono shrink-0">
          <button
            onClick={() => setActiveTab('CARDS')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
              activeTab === 'CARDS'
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Crew Cards (1Hz)
          </button>
          <button
            onClick={() => setActiveTab('COMPARISON')}
            className={`px-3 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
              activeTab === 'COMPARISON'
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Differential Matrix
          </button>
        </div>
      </div>

      {/* VIEW 1: CREW CARDS WITH LIVE 1Hz METRICS */}
      {activeTab === 'CARDS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {crewList.map((member) => {
            const p = member.profile;
            const f = member.currentFrame;
            const isSelected = activeAstronaut.id === p.id;

            const statusBadgeColor =
              member.activeStatus === 'CRITICAL'
                ? 'text-red-400 bg-red-950/40 border-red-500/40'
                : member.activeStatus === 'WARNING'
                ? 'text-[#FFB547] bg-[#FFB547]/10 border-[#FFB547]/30'
                : 'text-[#21D4A5] bg-[#21D4A5]/10 border-[#21D4A5]/30';

            return (
              <div
                key={p.id}
                className={`relative rounded-2xl p-4 transition-all border flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'bg-[#101B30] border-[#00E5FF] shadow-[0_0_25px_rgba(0,229,255,0.18)] ring-1 ring-[#00E5FF]/50'
                    : 'bg-[#050816]/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top: Name, Call Sign, Role & Selection Ring */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-white text-sm sm:text-base tracking-tight">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-1.5 py-0.5 rounded border border-[#00E5FF]/30">
                        "{p.callsign}"
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px] block mt-0.5">
                      {p.id === 'astro-1'
                        ? 'Commander / Systems'
                        : p.id === 'astro-2'
                        ? 'Pilot / ECLSS Operations'
                        : 'Mission Specialist / CMO'}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold shrink-0 ${statusBadgeColor}`}>
                    {member.activeStatus}
                  </span>
                </div>

                {/* 1Hz Live Telemetry Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {/* Heart Rate */}
                  <div className="p-2.5 rounded-xl bg-[#0B1221] border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3 text-[#00E5FF]" />
                        <span>HEART RATE</span>
                      </span>
                      <span>BPM</span>
                    </div>
                    <div className="text-xl font-extrabold text-white mt-1 tabular-nums">
                      {f.heartRate}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Base: {p.baselineVitals.restingHeartRate} (Δ {member.cardiorespiratoryDriftBpm > 0 ? `+${member.cardiorespiratoryDriftBpm}` : member.cardiorespiratoryDriftBpm})
                    </div>
                  </div>

                  {/* SpO2 */}
                  <div className="p-2.5 rounded-xl bg-[#0B1221] border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-[#21D4A5]" />
                        <span>SpO2 OXYGEN</span>
                      </span>
                      <span>%</span>
                    </div>
                    <div className="text-xl font-extrabold text-white mt-1 tabular-nums">
                      {f.spo2}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Target: ≥ 97.0%
                    </div>
                  </div>

                  {/* Blood Pressure */}
                  <div className="p-2.5 rounded-xl bg-[#0B1221] border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-[#438BFF]" />
                        <span>BLOOD PRESS</span>
                      </span>
                      <span>mmHg</span>
                    </div>
                    <div className="text-lg font-extrabold text-white mt-1 tabular-nums">
                      {f.systolicBP}/{f.diastolicBP}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Base: {p.baselineVitals.systolicBP}/{p.baselineVitals.diastolicBP}
                    </div>
                  </div>

                  {/* HRV */}
                  <div className="p-2.5 rounded-xl bg-[#0B1221] border border-slate-800">
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-[#FFB547]" />
                        <span>HRV TONE</span>
                      </span>
                      <span>ms</span>
                    </div>
                    <div className="text-lg font-extrabold text-white mt-1 tabular-nums">
                      {f.hrv}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Base: {p.baselineVitals.hrvMs} ms
                    </div>
                  </div>
                </div>

                {/* Bottom: Switch to Focus Button */}
                <button
                  onClick={() => handleSwitchActive(p)}
                  className={`w-full py-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#00E5FF] text-[#050816] shadow-md shadow-[#00E5FF]/20 cursor-default'
                      : 'bg-[#101B30] hover:bg-[#182642] text-slate-200 border border-slate-700 hover:border-[#00E5FF]/40'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <UserCheck className="w-4 h-4 text-[#050816]" />
                      <span>Primary Station Telemetry Focus</span>
                    </>
                  ) : (
                    <>
                      <span>Switch Station Focus to {p.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: DIFFERENTIAL PHYSIOLOGICAL ADAPTATION COMPARISON MATRIX */}
      {activeTab === 'COMPARISON' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="p-4 rounded-2xl bg-[#050816] border border-slate-800 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Astronaut</th>
                  <th className="py-2.5 px-3">Resting HR Baseline</th>
                  <th className="py-2.5 px-3">Cardiorespiratory Drift</th>
                  <th className="py-2.5 px-3">BMD Loss Projection</th>
                  <th className="py-2.5 px-3">Circadian Phase Shift</th>
                  <th className="py-2.5 px-3">Cumulative Rad</th>
                  <th className="py-2.5 px-3">TRISH Resilience</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {crewList.map((m) => {
                  const p = m.profile;
                  const isSelected = activeAstronaut.id === p.id;
                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-[#101B30]/50 transition-colors ${
                        isSelected ? 'bg-[#00E5FF]/10 text-white font-bold' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{p.name}</span>
                          {isSelected && (
                            <span className="text-[9px] bg-[#00E5FF]/20 text-[#00E5FF] px-1.5 py-0.2 rounded border border-[#00E5FF]/30">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {p.callsign} · {p.age}y · Sol {p.missionDay}
                        </span>
                      </td>

                      <td className="py-3 px-3 tabular-nums">
                        {p.baselineVitals.restingHeartRate} BPM
                      </td>

                      <td className="py-3 px-3 tabular-nums">
                        <span className={m.cardiorespiratoryDriftBpm > 10 ? 'text-[#FFB547]' : 'text-[#21D4A5]'}>
                          {m.cardiorespiratoryDriftBpm > 0 ? `+${m.cardiorespiratoryDriftBpm}` : m.cardiorespiratoryDriftBpm} BPM
                        </span>
                      </td>

                      <td className="py-3 px-3 tabular-nums">
                        <span className="text-[#FFB547]">
                          -{m.projectedBmdLossPercentPerMonth}% / mo
                        </span>
                      </td>

                      <td className="py-3 px-3 tabular-nums">
                        <span className={Math.abs(m.circadianPhaseShiftHours) > 0.5 ? 'text-[#FFB547]' : 'text-[#21D4A5]'}>
                          {m.circadianPhaseShiftHours > 0 ? `+${m.circadianPhaseShiftHours}h` : `${m.circadianPhaseShiftHours}h`}
                        </span>
                      </td>

                      <td className="py-3 px-3 tabular-nums">
                        <span className="text-[#00E5FF]">
                          {m.cumulativeRadiationMSv} mSv
                        </span>
                      </td>

                      <td className="py-3 px-3 tabular-nums">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-[#21D4A5] rounded-full"
                              style={{ width: `${m.trishResilienceIndex}%` }}
                            />
                          </div>
                          <span>{m.trishResilienceIndex}/100</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            <span>Ground Station Standards: NASA Human Research Program (HRP) Evidence Books</span>
            <span className="text-[#00E5FF]">Multi-Channel Multiplexing · Ka-Band MUX Lock Active</span>
          </div>
        </div>
      )}
    </div>
  );
};
