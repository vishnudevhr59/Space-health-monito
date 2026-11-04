import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Info,
  ChevronDown,
} from 'lucide-react';

interface SimulationStateResponse {
  activeScenario: 'SCENARIO_A' | 'SCENARIO_B' | 'SCENARIO_C' | 'SCENARIO_D';
  status: 'IDLE' | 'RUNNING' | 'PAUSED';
  currentStep: number;
  speedMultiplier: number;
  lastEventDescription: string;
  commStatus: 'ONLINE' | 'OFFLINE';
  scenarioDetails: {
    id: string;
    title: string;
    description: string;
    objective: string;
    maxSteps: number;
  };
  currentStepData: {
    step: number;
    title: string;
    eventDescription: string;
    commStatus: 'ONLINE' | 'OFFLINE';
    telemetry: {
      heartRate: number;
      spo2: number;
      bodyTemperature: number;
      hrv: number;
      dataSource: string;
    };
  };
}

export const MissionSimulationBar: React.FC = () => {
  const [simState, setSimState] = useState<SimulationStateResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const fetchSimulationState = async () => {
    try {
      const res = await fetch('/api/simulation/state');
      if (res.ok) {
        const data = await res.json();
        setSimState(data);
      }
    } catch (err) {
      console.warn('Failed to fetch simulation state:', err);
    }
  };

  useEffect(() => {
    fetchSimulationState();
    const interval = setInterval(fetchSimulationState, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async (scenario?: string) => {
    setLoading(true);
    try {
      await fetch('/api/simulation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenario || simState?.activeScenario }),
      });
      await fetchSimulationState();
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    setLoading(true);
    try {
      await fetch('/api/simulation/pause', { method: 'POST' });
      await fetchSimulationState();
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    setLoading(true);
    try {
      await fetch('/api/simulation/resume', { method: 'POST' });
      await fetchSimulationState();
    } finally {
      setLoading(false);
    }
  };

  const handleStep = async () => {
    setLoading(true);
    try {
      await fetch('/api/simulation/step', { method: 'POST' });
      await fetchSimulationState();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await fetch('/api/simulation/reset', { method: 'POST' });
      await fetchSimulationState();
    } finally {
      setLoading(false);
    }
  };

  const activeScenario = simState?.activeScenario || 'SCENARIO_B';
  const currentStep = simState?.currentStep ?? 0;
  const maxSteps = simState?.scenarioDetails?.maxSteps ?? 6;
  const isRunning = simState?.status === 'RUNNING';

  return (
    <div className="w-full bg-slate-950/95 border-b border-cyan-900/40 text-slate-100 text-xs backdrop-blur-md sticky top-0 z-40 transition-all">
      {/* Top Banner & Control Ribbon */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Simulation Indicator & Scenario Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-cyan-950/60 border border-cyan-800/50 rounded text-cyan-400 font-mono tracking-wider uppercase font-semibold">
            <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>MISSION SIMULATOR</span>
          </div>

          <div className="relative">
            <select
              value={activeScenario}
              onChange={(e) => handleStart(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded px-2.5 py-1 pr-7 appearance-none focus:outline-none focus:border-cyan-500 font-medium cursor-pointer"
            >
              <option value="SCENARIO_B">Scenario B: Gradual Health Deviation (Recommended)</option>
              <option value="SCENARIO_A">Scenario A: Normal Operations Baseline</option>
              <option value="SCENARIO_C">Scenario C: Sensor Failure & Poor Data Quality</option>
              <option value="SCENARIO_D">Scenario D: Deep-Space Comm Interruption</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <span>Step</span>
            <span className="font-mono text-cyan-300 font-semibold">{currentStep + 1}</span>
            <span>of</span>
            <span className="font-mono text-slate-300">{maxSteps}</span>
          </div>
        </div>

        {/* Center: Comm Link & Watermark */}
        <div className="flex items-center gap-2 text-slate-400">
          {simState?.commStatus === 'ONLINE' ? (
            <span className="flex items-center gap-1 text-emerald-400 font-mono text-[11px]">
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span>DSN LINK ONLINE</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-400 font-mono text-[11px]">
              <WifiOff className="w-3 h-3 text-rose-400" />
              <span>RADIO OCCULTATION (OFFLINE)</span>
            </span>
          )}
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-[11px] text-amber-400/90 font-mono tracking-tight">
            SYNTHETIC DEMO TELEMETRY
          </span>
        </div>

        {/* Right: Simulation Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isRunning ? (
            <button
              onClick={handlePause}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/60 text-amber-200 rounded font-medium transition-colors"
              title="Pause Simulation"
            >
              <Pause className="w-3 h-3" />
              <span className="hidden sm:inline">Pause</span>
            </button>
          ) : (
            <button
              onClick={handleResume}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1 bg-cyan-900/50 hover:bg-cyan-800/60 border border-cyan-600/60 text-cyan-200 rounded font-medium transition-colors"
              title="Start / Resume Playback"
            >
              <Play className="w-3 h-3" />
              <span className="hidden sm:inline">Play</span>
            </button>
          )}

          <button
            onClick={handleStep}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded font-medium transition-colors"
            title="Step Next Telemetry Cycle"
          >
            <SkipForward className="w-3 h-3 text-cyan-400" />
            <span>Step</span>
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded font-medium transition-colors"
            title="Reset Scenario to Step 0"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-200 ml-1"
            title={isOpen ? 'Collapse details' : 'Expand details'}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Collapsible Mission Details & Step Event Log */}
      {isOpen && (
        <div className="bg-slate-900/90 border-t border-slate-800/80 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-cyan-300 font-semibold">{simState?.scenarioDetails?.title}:</span>
                <span className="text-slate-200 font-medium">
                  {simState?.currentStepData?.title || 'Initial Calibration'}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                {simState?.lastEventDescription || simState?.scenarioDetails?.description}
              </p>
            </div>

            {simState?.currentStepData?.telemetry && (
              <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded border border-slate-800 shrink-0 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 mr-1">HR:</span>
                  <span className="text-cyan-300 font-semibold">{simState.currentStepData.telemetry.heartRate} BPM</span>
                </div>
                <div>
                  <span className="text-slate-500 mr-1">SpO2:</span>
                  <span className="text-emerald-300 font-semibold">{simState.currentStepData.telemetry.spo2}%</span>
                </div>
                <div>
                  <span className="text-slate-500 mr-1">HRV:</span>
                  <span className="text-purple-300 font-semibold">{simState.currentStepData.telemetry.hrv} ms</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
