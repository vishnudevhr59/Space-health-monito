import React, { useState, useEffect } from 'react';
import {
  Radio,
  Compass,
  Volume2,
  VolumeX,
  FileText,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
} from 'lucide-react';
import { voiceAlertService } from '../services/voiceAlertService';

interface MissionControlTickerProps {
  missionDay?: number;
  groundStationName?: string;
  commLatency?: number;
  habitatPressurePsi?: number;
  cabinCo2MmHg?: number;
  cabinO2Percent?: number;
  emergencyStatus?: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  onStatusChange?: (status: 'NOMINAL' | 'WARNING' | 'CRITICAL') => void;
  onOpenAuditModal?: () => void;
}

export const MissionControlTicker: React.FC<MissionControlTickerProps> = ({
  missionDay = 142,
  groundStationName = 'NASA MCC-H / DSN GOLDSTONE',
  commLatency = 1240,
  habitatPressurePsi = 14.7,
  cabinCo2MmHg = 2.2,
  cabinO2Percent = 21.0,
  emergencyStatus = 'NOMINAL',
  onStatusChange,
  onOpenAuditModal,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState<number>(31345);
  const [dynamicLatency, setDynamicLatency] = useState<number>(commLatency);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(voiceAlertService.isVoiceEnabled());

  // Subscribe to voice alert service
  useEffect(() => {
    return voiceAlertService.subscribe((enabled) => {
      setVoiceEnabled(enabled);
    });
  }, []);

  // Active ticking timer for Mission Elapsed Time (MET)
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
      // Small realistic jitter on deep-space latency (+/- 3ms)
      setDynamicLatency(commLatency + Math.floor(Math.sin(Date.now() / 4000) * 4));
    }, 1000);
    return () => clearInterval(timer);
  }, [commLatency]);

  const hours = Math.floor(secondsElapsed / 3600) % 24;
  const minutes = Math.floor((secondsElapsed % 3600) / 60);
  const seconds = secondsElapsed % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const metFormatted = `MET +${missionDay}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  const toggleEmergencyStatus = () => {
    if (!onStatusChange) return;
    if (emergencyStatus === 'NOMINAL') onStatusChange('WARNING');
    else if (emergencyStatus === 'WARNING') onStatusChange('CRITICAL');
    else onStatusChange('NOMINAL');
  };

  const handleToggleVoice = () => {
    const next = voiceAlertService.toggleVoiceAlerts();
    if (next) {
      voiceAlertService.testVoiceAnnouncement();
    }
  };

  return (
    <div className="w-full bg-[#020512] border-b border-cyan-500/20 px-2 sm:px-4 lg:px-6 py-1.5 flex items-center justify-between text-[10px] sm:text-[11px] font-mono tracking-wider text-slate-300 overflow-x-auto scrollbar-none whitespace-nowrap gap-2 sm:gap-4 shadow-inner select-none">
      {/* Left: Real-time MET Clock */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0 shadow-[0_0_8px_#00E5FF]" />
        <span className="text-slate-400 font-semibold hidden xs:inline">MISSION CLOCK:</span>
        <span className="text-white font-extrabold tracking-widest tabular-nums text-xs bg-slate-900/90 px-2 py-0.5 rounded border border-cyan-500/30">
          {metFormatted}
        </span>
      </div>

      {/* Ground Station Lock Status (NASA MCC-H / NASA DSN GOLDSTONE) */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="text-slate-400 hidden sm:inline">GROUND LOCK:</span>
        <span className="text-emerald-300 font-bold bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30">
          [{groundStationName} ACTIVE] (EL: 52° / AZ: 188° / SNR: 38 dB)
        </span>
      </div>

      {/* Communication Latency */}
      <div className="hidden md:flex items-center gap-1.5 shrink-0">
        <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="text-slate-400">RTT:</span>
        <span className="text-cyan-300 font-bold tabular-nums">{dynamicLatency} ms</span>
        <span className="text-slate-600">·</span>
        <span className="text-slate-400">TDRS / Ka-BAND 256 Mbps</span>
      </div>

      {/* Habitat Life Support Summary */}
      <div className="hidden xl:flex items-center gap-2.5 shrink-0 text-slate-400">
        <span>ECLSS:</span>
        <span className="text-cyan-300 font-bold tabular-nums">{habitatPressurePsi.toFixed(1)} PSI</span>
        <span className="text-slate-600">·</span>
        <span>O2:</span>
        <span className="text-emerald-300 font-bold tabular-nums">{cabinO2Percent.toFixed(1)}%</span>
        <span className="text-slate-600">·</span>
        <span>CO2:</span>
        <span className={`font-bold tabular-nums ${cabinCo2MmHg > 3.8 ? 'text-rose-400' : 'text-amber-300'}`}>
          {cabinCo2MmHg.toFixed(1)} mmHg
        </span>
      </div>

      {/* Right Controls: Emergency System Status Toggle + Voice Synthesizer Toggle + Audit Log Drawer */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Emergency System Status Toggle (NOMINAL / WARNING / CRITICAL) */}
        <button
          onClick={toggleEmergencyStatus}
          className={`flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-extrabold uppercase border transition-all cursor-pointer ${
            emergencyStatus === 'CRITICAL'
              ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.4)]'
              : emergencyStatus === 'WARNING'
              ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 hover:border-emerald-400'
          }`}
          title="Emergency System Status Mode Toggle"
        >
          {emergencyStatus === 'CRITICAL' ? (
            <AlertOctagon className="w-3 h-3 text-rose-400" />
          ) : emergencyStatus === 'WARNING' ? (
            <AlertTriangle className="w-3 h-3 text-amber-400" />
          ) : (
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          )}
          <span>{emergencyStatus}</span>
        </button>

        {/* Browser SpeechSynthesis API Voice Alert Toggle */}
        <button
          onClick={handleToggleVoice}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors cursor-pointer ${
            voiceEnabled
              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 hover:border-cyan-400 shadow-sm'
              : 'bg-slate-900 text-slate-500 border-slate-700 hover:text-slate-300'
          }`}
          title={voiceEnabled ? 'Verbal Health Announcements ACTIVE (Click to mute)' : 'Verbal Health Announcements MUTED (Click to activate)'}
        >
          {voiceEnabled ? (
            <Volume2 className="w-3 h-3 text-cyan-400 animate-pulse" />
          ) : (
            <VolumeX className="w-3 h-3 text-slate-500" />
          )}
          <span className="hidden xs:inline">VOICE:</span>
          <span>{voiceEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Mission Audit Log Modal Button */}
        {onOpenAuditModal && (
          <button
            onClick={onOpenAuditModal}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#101F3D] hover:bg-[#152a54] text-slate-200 border border-cyan-500/30 hover:border-cyan-400 transition-colors cursor-pointer shadow-sm"
            title="Inspect Aerospace Mission Audit Log & Export CSV/JSON"
          >
            <FileText className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">AUDIT LOG</span>
          </button>
        )}
      </div>
    </div>
  );
};
