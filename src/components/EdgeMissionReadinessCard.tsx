import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Moon,
  Thermometer,
  Heart,
  ShieldCheck,
  Radio,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
  Zap,
  Info,
  Droplets,
  Eye,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AstronautProfile, HealthMeasurement } from '../types';

interface EdgeMissionReadinessCardProps {
  astronaut: AstronautProfile;
  latestVital?: Partial<HealthMeasurement>;
  className?: string;
}

export const EdgeMissionReadinessCard: React.FC<EdgeMissionReadinessCardProps> = ({
  astronaut,
  latestVital,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'SCORE' | 'SCHEMA' | 'MISSIONS'>('SCORE');
  const [selectedCrewPreset, setSelectedCrewPreset] = useState<'SHUKLA' | 'WILLIAMS' | 'CURRENT'>('CURRENT');
  const [copied, setCopied] = useState(false);
  const [isSimulatedOverride, setIsSimulatedOverride] = useState(false);

  // Custom adjustable parameters to demo the algorithm
  const [currentHrv, setCurrentHrv] = useState(latestVital?.hrv || 64);
  const [currentRhr, setCurrentRhr] = useState(latestVital?.heartRate || 58);
  const [currentSleepHours, setCurrentSleepHours] = useState(7.2);
  const [currentSleepEfficiency, setCurrentSleepEfficiency] = useState(88);
  const [currentSkinTemp, setCurrentSkinTemp] = useState(latestVital?.bodyTemperature || 36.6);
  const [currentGlucose, setCurrentGlucose] = useState(94); // Continuous Glucose Monitor (Suite Ride)
  const [currentCabinCo2, setCurrentCabinCo2] = useState(2100); // ppm

  // Astronaut baseline
  const baselineHrv = astronaut.baselineVitals?.hrvMs || 65;
  const baselineRhr = astronaut.baselineVitals?.restingHeartRate || 58;
  const baselineTemp = astronaut.baselineVitals?.bodyTempC || 36.6;

  // Handle Preset Switching (Shubhanshu Shukla vs Sunita Williams vs Live Astronaut)
  const applyPreset = (preset: 'SHUKLA' | 'WILLIAMS' | 'CURRENT') => {
    setSelectedCrewPreset(preset);
    setIsSimulatedOverride(true);
    if (preset === 'SHUKLA') {
      setCurrentHrv(68);
      setCurrentRhr(54);
      setCurrentSleepHours(7.4);
      setCurrentSleepEfficiency(91);
      setCurrentSkinTemp(36.5);
      setCurrentGlucose(92);
      setCurrentCabinCo2(1850);
    } else if (preset === 'WILLIAMS') {
      setCurrentHrv(58);
      setCurrentRhr(61);
      setCurrentSleepHours(6.5);
      setCurrentSleepEfficiency(84);
      setCurrentSkinTemp(36.7);
      setCurrentGlucose(104);
      setCurrentCabinCo2(2400);
    } else {
      setIsSimulatedOverride(false);
      setCurrentHrv(latestVital?.hrv || 64);
      setCurrentRhr(latestVital?.heartRate || 58);
      setCurrentSleepHours(7.2);
      setCurrentSleepEfficiency(88);
      setCurrentSkinTemp(latestVital?.bodyTemperature || 36.6);
      setCurrentGlucose(94);
      setCurrentCabinCo2(2100);
    }
  };

  // -------------------------------------------------------------
  // EXACT AXIOM-4 / ISS EDGE-COMPUTING MISSION READINESS ALGORITHM
  // -------------------------------------------------------------
  // 1. HRV Score (higher or equal to baseline is optimal, capped at 1.15 ratio)
  const hrvRatio = Math.min(currentHrv / baselineHrv, 1.15);
  const hrvScore = Math.min((hrvRatio / 1.0) * 100, 100);

  // 2. Resting Heart Rate Score (lower or equal to baseline is optimal; 4 pts penalty per bpm elevation)
  const rhrDiff = currentRhr - baselineRhr;
  const rhrScore = Math.max(0, Math.min(100, 100 - rhrDiff * 4));

  // 3. Sleep Score (target: 7.5 hours duration, 85%+ efficiency)
  const durationFactor = Math.min(currentSleepHours / 7.5, 1.0);
  const sleepScore = durationFactor * currentSleepEfficiency;

  // 4. Skin Temperature Stability Score (60 pts penalty per 1.0°C deviation)
  const tempDiff = Math.abs(currentSkinTemp - baselineTemp);
  const tempScore = Math.max(0, 100 - tempDiff * 60);

  // Weighted Total Readiness (0 - 100)
  const readinessTotal =
    hrvScore * 0.35 +
    rhrScore * 0.25 +
    sleepScore * 0.25 +
    tempScore * 0.15;

  const readinessScore = Math.round(readinessTotal * 10) / 10;

  // Status Level
  const status: 'GREEN' | 'YELLOW' | 'RED' =
    readinessScore >= 80 ? 'GREEN' : readinessScore >= 60 ? 'YELLOW' : 'RED';

  const statusColor = {
    GREEN: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40 shadow-emerald-500/20',
    YELLOW: 'text-amber-400 bg-amber-950/40 border-amber-500/40 shadow-amber-500/20',
    RED: 'text-rose-400 bg-rose-950/40 border-rose-500/40 shadow-rose-500/20',
  }[status];

  const recommendedAction =
    status === 'GREEN'
      ? 'Cleared for EVA extravehicular prep, high-stress docked maneuvers, and standard cognitive tasks.'
      : status === 'YELLOW'
      ? 'Cleared for nominal station maintenance. Recommend 30-min sleep extension and 460nm circadian light re-calibration.'
      : 'Cardiorespiratory strain or autonomic fatigue detected. Suspend EVA operations; initiate Private Medical Conference.';

  // Structured Wearable & Cabin Telemetry Packet
  const telemetryPacket = {
    packet_id: `ax4-crew-${astronaut.id}-${new Date().toISOString().slice(0, 10)}T${new Date().toISOString().slice(11, 19).replace(/:/g, '')}Z`,
    sync_status: 'PENDING_DOWNLINK',
    crew_member: {
      id: astronaut.id,
      name:
        selectedCrewPreset === 'SHUKLA'
          ? 'Gp Capt Shubhanshu Shukla'
          : selectedCrewPreset === 'WILLIAMS'
          ? 'Sunita Williams'
          : astronaut.name,
      mission:
        selectedCrewPreset === 'SHUKLA'
          ? 'Axiom Mission 4 (Ax-4 / ISRO)'
          : selectedCrewPreset === 'WILLIAMS'
          ? 'ISS Expedition 71/72 (286 Days)'
          : astronaut.mission,
      mission_day: selectedCrewPreset === 'WILLIAMS' ? 286 : selectedCrewPreset === 'SHUKLA' ? 14 : astronaut.missionDay,
      location_module: selectedCrewPreset === 'SHUKLA' ? 'ISS_HARMONY_NODE2' : selectedCrewPreset === 'WILLIAMS' ? 'ISS_COLUMBUS' : 'GATEWAY_HALO_01',
    },
    biometrics: {
      heart_rate_bpm: Math.round(currentRhr),
      resting_hr_bpm: Math.round(currentRhr),
      hrv_rmssd_ms: Math.round(currentHrv),
      spo2_pct: latestVital?.spo2 || 98.4,
      respiration_rpm: latestVital?.respiratoryRate || 14,
      skin_temp_c: Number(currentSkinTemp.toFixed(1)),
      blood_glucose_mg_dl: currentGlucose,
    },
    circadian_and_sleep: {
      sleep_duration_hours: Number(currentSleepHours.toFixed(1)),
      sleep_efficiency_pct: Math.round(currentSleepEfficiency),
      ambient_lux_exposure: 420,
    },
    cabin_context: {
      co2_level_ppm: currentCabinCo2,
      radiation_dose_msv: 0.48,
      cabin_pressure_kpa: 101.3,
    },
    edge_ai_output: {
      readiness_score: readinessScore,
      alert_level: status,
      recommended_action: recommendedAction,
    },
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(telemetryPacket, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`rounded-3xl bg-[#080E1C] border border-cyan-500/30 p-5 sm:p-7 shadow-2xl space-y-6 ${className}`}>
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Axiom-4 & ISS Edge-Computing Readiness Engine</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">Offline-First Local Execution</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight flex flex-wrap items-center gap-2.5">
            Mission Readiness Score
            <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full border font-bold ${statusColor}`}>
              ● {status} ({readinessScore}/100)
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Modeled on Sunita Williams (Exp 71/72 Actiwatch & Smart Vest) & Gp Capt Shubhanshu Shukla (Ax-4 Oura Ring Edge App & TrialX TESH)
          </p>
        </div>

        {/* PRESET CREW SWITCHER */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">Telemetry Context:</span>
          <button
            onClick={() => applyPreset('SHUKLA')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer font-bold ${
              selectedCrewPreset === 'SHUKLA'
                ? 'bg-gradient-to-r from-orange-950 to-amber-950 text-amber-300 border border-amber-500/50 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
            title="Axiom-4 / ISRO Gaganyaan mission profile"
          >
            🇮🇳 Gp Capt S. Shukla (Ax-4)
          </button>
          <button
            onClick={() => applyPreset('WILLIAMS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer font-bold ${
              selectedCrewPreset === 'WILLIAMS'
                ? 'bg-gradient-to-r from-blue-950 to-indigo-950 text-cyan-300 border border-cyan-500/50 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
            title="NASA Expedition 71/72 286-day long duration profile"
          >
            🇺🇸 Sunita Williams (Exp 71/72)
          </button>
          <button
            onClick={() => applyPreset('CURRENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer font-bold ${
              selectedCrewPreset === 'CURRENT'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-400 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
            title="Active station telemetry"
          >
            CDR Chen (Gateway)
          </button>
        </div>
      </div>

      {/* VIEW SELECTOR TABS */}
      <div className="flex items-center gap-2 bg-[#040814] p-1 rounded-2xl border border-slate-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab('SCORE')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all font-bold cursor-pointer text-center ${
            activeTab === 'SCORE'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          1. Edge Readiness Score (4 Factors)
        </button>
        <button
          onClick={() => setActiveTab('SCHEMA')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all font-bold cursor-pointer text-center ${
            activeTab === 'SCHEMA'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          2. Delay-Tolerant (DTN) JSON Packet
        </button>
        <button
          onClick={() => setActiveTab('MISSIONS')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all font-bold cursor-pointer text-center ${
            activeTab === 'MISSIONS'
              ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          3. Real Spaceflight Sensors & Studies
        </button>
      </div>

      {/* TAB 1: EDGE READINESS SCORE & 4-FACTOR BREAKDOWN */}
      {activeTab === 'SCORE' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left: Big Circular Gauge & Local Recommendation */}
            <div className="lg:col-span-5 rounded-2xl bg-[#050B17] border border-slate-800 p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
              <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                <span>LOCAL ONBOARD COMPUTATION</span>
                <span className="text-emerald-400 font-bold">100% OFFLINE</span>
              </div>

              {/* Glowing Gauge */}
              <div className="relative my-4 flex items-center justify-center">
                <div
                  className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shadow-2xl transition-all ${
                    status === 'GREEN'
                      ? 'border-emerald-400 shadow-emerald-500/30 bg-emerald-950/20'
                      : status === 'YELLOW'
                      ? 'border-amber-400 shadow-amber-500/30 bg-amber-950/20'
                      : 'border-rose-400 shadow-rose-500/30 bg-rose-950/20'
                  }`}
                >
                  <span className="text-4xl font-black font-mono text-white tracking-tighter">
                    {readinessScore}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-0.5">
                    OUT OF 100
                  </span>
                </div>
              </div>

              {/* Status Pill & Clinical Recommendation */}
              <div className="w-full space-y-2 mt-2">
                <div className={`py-1.5 px-3 rounded-xl border font-mono font-bold text-xs ${statusColor}`}>
                  READINESS LEVEL: {status}
                </div>
                <div className="text-xs text-slate-300 font-mono text-left bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-cyan-400 uppercase font-bold flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>Edge Clinical Decision Recommendation:</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{recommendedAction}</p>
                </div>
              </div>
            </div>

            {/* Right: 4-Factor Weighted Breakdown Cards */}
            <div className="lg:col-span-7 space-y-3.5">
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                <span>EDGE FORMULA CONTRIBUTION WEIGHTS:</span>
                <span className="text-cyan-400 font-bold">Total: 100%</span>
              </div>

              {/* 1. HRV Score (35%) */}
              <div className="rounded-xl bg-[#060D1A] border border-cyan-500/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>Heart Rate Variability (HRV RMSSD) · 35% Weight</span>
                  </div>
                  <span className="text-white font-bold">{Math.round(hrvScore)} / 100 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(hrvScore, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Current: <strong className="text-white">{Math.round(currentHrv)} ms</strong> (Baseline: {baselineHrv} ms)</span>
                  <span className="text-cyan-400">Ratio: {hrvRatio.toFixed(2)}x</span>
                </div>
              </div>

              {/* 2. Resting Heart Rate Score (25%) */}
              <div className="rounded-xl bg-[#060D1A] border border-emerald-500/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Heart className="w-4 h-4 text-emerald-400" />
                    <span>Resting Heart Rate (RHR) · 25% Weight</span>
                  </div>
                  <span className="text-white font-bold">{Math.round(rhrScore)} / 100 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(rhrScore, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Current: <strong className="text-white">{Math.round(currentRhr)} bpm</strong> (Baseline: {baselineRhr} bpm)</span>
                  <span className={rhrDiff > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                    {rhrDiff > 0 ? `+${rhrDiff} bpm elevation` : 'Nominal'}
                  </span>
                </div>
              </div>

              {/* 3. Sleep Efficiency & Duration (25%) */}
              <div className="rounded-xl bg-[#060D1A] border border-purple-500/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-purple-300 font-bold">
                    <Moon className="w-4 h-4 text-purple-400" />
                    <span>Sleep Duration & Efficiency · 25% Weight</span>
                  </div>
                  <span className="text-white font-bold">{Math.round(sleepScore)} / 100 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(sleepScore, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Duration: <strong className="text-white">{currentSleepHours}h</strong> (Target 7.5h)</span>
                  <span>Efficiency: <strong className="text-white">{currentSleepEfficiency}%</strong></span>
                </div>
              </div>

              {/* 4. Skin Temperature Stability (15%) */}
              <div className="rounded-xl bg-[#060D1A] border border-amber-500/20 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Thermometer className="w-4 h-4 text-amber-400" />
                    <span>Skin Temperature Stability · 15% Weight</span>
                  </div>
                  <span className="text-white font-bold">{Math.round(tempScore)} / 100 pts</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(tempScore, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Current: <strong className="text-white">{currentSkinTemp}°C</strong> (Baseline: {baselineTemp}°C)</span>
                  <span>Deviation: <strong className={tempDiff > 0.5 ? 'text-rose-400' : 'text-emerald-400'}>±{tempDiff.toFixed(2)}°C</strong></span>
                </div>
              </div>

            </div>
          </div>

          {/* Interactive Simulation Sliders (Test Edge Computation Instantly) */}
          <div className="rounded-2xl bg-[#050B17] border border-slate-800 p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-bold">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Simulate Sensor Fluctuations in Orbit (Offline Edge Test):</span>
              </div>
              {isSimulatedOverride && (
                <button
                  onClick={() => applyPreset('CURRENT')}
                  className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-cyan-200 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset to Live 1Hz Telemetry</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1">HRV: {currentHrv} ms</label>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={currentHrv}
                  onChange={(e) => {
                    setCurrentHrv(Number(e.target.value));
                    setIsSimulatedOverride(true);
                  }}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Resting HR: {currentRhr} bpm</label>
                <input
                  type="range"
                  min="45"
                  max="90"
                  value={currentRhr}
                  onChange={(e) => {
                    setCurrentRhr(Number(e.target.value));
                    setIsSimulatedOverride(true);
                  }}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Sleep: {currentSleepHours}h</label>
                <input
                  type="range"
                  min="4.0"
                  max="9.0"
                  step="0.1"
                  value={currentSleepHours}
                  onChange={(e) => {
                    setCurrentSleepHours(Number(e.target.value));
                    setIsSimulatedOverride(true);
                  }}
                  className="w-full accent-purple-400 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Skin Temp: {currentSkinTemp}°C</label>
                <input
                  type="range"
                  min="35.5"
                  max="38.5"
                  step="0.1"
                  value={currentSkinTemp}
                  onChange={(e) => {
                    setCurrentSkinTemp(Number(e.target.value));
                    setIsSimulatedOverride(true);
                  }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DELAY-TOLERANT (DTN) JSON TELEMETRY PACKET */}
      {activeTab === 'SCHEMA' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="text-slate-300">
              <span className="text-cyan-400 font-bold">Delay-Tolerant Networking (DTN)</span> schema buffering sensor wearables & cabin environmental metrics locally during signal occultation.
            </div>
            <button
              onClick={copyJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold transition-all cursor-pointer shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY JSON SCHEMA'}</span>
            </button>
          </div>

          {/* Code Viewer */}
          <div className="rounded-2xl bg-[#030610] border border-slate-800 p-4 font-mono text-xs overflow-x-auto text-emerald-400 relative">
            <pre className="leading-relaxed">{JSON.stringify(telemetryPacket, null, 2)}</pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
              <span className="text-cyan-400 font-bold block mb-1">● Buffer First, Sync Later:</span>
              Records are marked with <code className="text-amber-300">PENDING_DOWNLINK</code> and queued in local IndexedDB until Ku/Ka-band deep space lock opens.
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300">
              <span className="text-emerald-400 font-bold block mb-1">● Environmental Coupling:</span>
              Cabin CO₂ (<code className="text-white">{currentCabinCo2} ppm</code>) and radiation (<code className="text-white">0.48 mSv</code>) are logged concurrently to prevent misattributing environmental headache/fatigue to cardiac distress.
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REAL SPACEFLIGHT SENSORS & STUDIES */}
      {activeTab === 'MISSIONS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          
          {/* Sunita Williams (Expedition 71/72) */}
          <div className="rounded-2xl bg-[#050D1A] border border-blue-500/30 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30">
                NASA ISS EXPEDITION 71/72
              </span>
              <span className="text-xs font-mono text-slate-400">286 Days in Space</span>
            </div>
            <h4 className="text-base font-bold text-white">Sunita Williams Bio-Monitoring Architecture</h4>
            <ul className="text-xs font-mono text-slate-300 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">NASA Actiwatch Spectrum:</strong> Wrist-worn device tracking ambient light exposure (lux), sleep-wake rhythms, and circadian disruption from 16 orbital sunrises/day.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">Sensor-Embedded Smart Vest:</strong> Wearable Monitoring experiment non-invasively recording nocturnal heart rate and breathing patterns.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">CSA Bio-Monitor (Hexoskin):</strong> Sensor-equipped shirt and headband paired with ISS tablet streaming SpO₂, blood pressure, ECG, and skin temp.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">Private Medical Conferences (PMCs):</strong> Encrypted weekly consultations with NASA Johnson Space Center flight surgeons + POCUS ultrasound.
                </div>
              </li>
            </ul>
          </div>

          {/* Group Captain Shubhanshu Shukla (Axiom-4 / ISRO) */}
          <div className="rounded-2xl bg-[#0E0C06] border border-amber-500/30 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-amber-400 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30">
                AXIOM-4 / ISRO GAGANYAAN
              </span>
              <span className="text-xs font-mono text-slate-400">Edge-Computing Focus</span>
            </div>
            <h4 className="text-base font-bold text-white">Gp Capt Shubhanshu Shukla Bio-Monitoring</h4>
            <ul className="text-xs font-mono text-slate-300 space-y-2.5">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">Oura Ring & Edge-Computing App:</strong> Booz Allen & Axiom Space local algorithm computing 0–100 readiness from HRV, RHR, sleep, and skin temp without cloud dependencies.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">TrialX Telemetric Health AI (TESH):</strong> Multi-sensor biometric shirts and video-based motion analysis testing cardiovascular stability under communication lag.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">Continuous Glucose Monitors (Suite Ride):</strong> Wearable CGM patches assessing microgravity effects on metabolic insulin and blood sugar stability.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <strong className="text-white">ISRO Voyager Displays:</strong> Eye-tracking and tablet cognitive tests investigating zero-gravity pointing precision, ocular fatigue, and neurovestibular stress.
                </div>
              </li>
            </ul>
          </div>

        </div>
      )}

    </div>
  );
};
