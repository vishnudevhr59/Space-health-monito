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
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Sparkles,
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

interface TourStage {
  stageNumber: number;
  title: string;
  targetTab: string;
  focusScenario: 'SCENARIO_B';
  narration: string;
  objective: string;
}

const GUIDED_TOUR_STAGES: TourStage[] = [
  {
    stageNumber: 1,
    title: 'Startup & Mission Initialization',
    targetTab: 'landing',
    focusScenario: 'SCENARIO_B',
    narration: 'Artemis Gateway Expedition 04 initialization. CDR Sarah Chen on Mission Day 142. Full capability transparency with synthetic demonstration data disclosures.',
    objective: 'Confirm system startup, authentic subsystem readiness probes, and station baseline.',
  },
  {
    stageNumber: 2,
    title: 'Mission Brief & Flight Objectives',
    targetTab: 'landing',
    focusScenario: 'SCENARIO_B',
    narration: 'Explore mission flight parameters, 250 mSv cumulative radiation ceiling, and microgravity cardiovascular fluid shift models.',
    objective: 'Review expedition overview and physiological adaptation framework.',
  },
  {
    stageNumber: 3,
    title: 'Mission Dashboard & Live Telemetry',
    targetTab: 'dashboard',
    focusScenario: 'SCENARIO_B',
    narration: 'Observe multi-channel biometric sensor ingestion. Each reading carries verified provenance and data quality classification badges.',
    objective: 'Inspect resting vitals, active telemetry feed, and 24-hour summary cards.',
  },
  {
    stageNumber: 4,
    title: 'AI Health Analysis & Anomaly Isolation',
    targetTab: 'ai-analysis',
    focusScenario: 'SCENARIO_B',
    narration: 'Scenario B gradual deviation: Pure-Python Isolation Forest identifies subtle autonomic fatigue (+2.6 sigma HR elevation, -49% HRV depression). Pearson r = -0.74 context correlation with sleep deficit.',
    objective: 'Examine explainable ML anomaly score (0.84) and non-causation medical disclosures.',
  },
  {
    stageNumber: 5,
    title: 'Health Alerts & Clinical Human Review',
    targetTab: 'alerts',
    focusScenario: 'SCENARIO_B',
    narration: 'Prioritized alert logged for Flight Surgeon review. Interactive 5-state lifecycle (New -> Under Review -> Acknowledged -> Resolved).',
    objective: 'Acknowledge alert and verify audit trail logging in persistent database.',
  },
  {
    stageNumber: 6,
    title: 'MONITO AI Clinical Decision Support',
    targetTab: 'monito-ai',
    focusScenario: 'SCENARIO_B',
    narration: 'Evidence-backed clinical assistant explains the physiological mechanism using NASA Twins Study & ThermoLab citations without hallucination.',
    objective: 'Query autonomic countermeasure protocols and inspect research provenance DOIs.',
  },
  {
    stageNumber: 7,
    title: 'Mission Health Reports & Handover',
    targetTab: 'reports',
    focusScenario: 'SCENARIO_B',
    narration: 'Generate official mission medical summaries and conduct formal Flight Surgeon shift handover with dual sign-offs.',
    objective: 'Download comprehensive health dossier or markdown shift handover briefing.',
  },
];

interface MissionSimulationBarProps {
  onNavigateTab?: (tab: string) => void;
}

export const MissionSimulationBar: React.FC<MissionSimulationBarProps> = ({ onNavigateTab }) => {
  const [simState, setSimState] = useState<SimulationStateResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isGuidedTourActive, setIsGuidedTourActive] = useState<boolean>(false);
  const [currentTourStageIndex, setCurrentTourStageIndex] = useState<number>(0);

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

  // Guided Tour Stage Navigation
  const handleStartGuidedTour = () => {
    setIsGuidedTourActive(true);
    setCurrentTourStageIndex(0);
    const stage = GUIDED_TOUR_STAGES[0];
    if (onNavigateTab) {
      onNavigateTab(stage.targetTab);
    }
    handleStart('SCENARIO_B');
  };

  const handleNextTourStage = () => {
    if (currentTourStageIndex < GUIDED_TOUR_STAGES.length - 1) {
      const nextIdx = currentTourStageIndex + 1;
      setCurrentTourStageIndex(nextIdx);
      const stage = GUIDED_TOUR_STAGES[nextIdx];
      if (onNavigateTab) {
        onNavigateTab(stage.targetTab);
      }
      // Step simulation for progression
      handleStep();
    }
  };

  const handlePrevTourStage = () => {
    if (currentTourStageIndex > 0) {
      const prevIdx = currentTourStageIndex - 1;
      setCurrentTourStageIndex(prevIdx);
      const stage = GUIDED_TOUR_STAGES[prevIdx];
      if (onNavigateTab) {
        onNavigateTab(stage.targetTab);
      }
    }
  };

  const handleJumpToStage = (idx: number) => {
    setCurrentTourStageIndex(idx);
    const stage = GUIDED_TOUR_STAGES[idx];
    if (onNavigateTab) {
      onNavigateTab(stage.targetTab);
    }
  };

  const handleExitTour = () => {
    setIsGuidedTourActive(false);
  };

  const activeScenario = simState?.activeScenario || 'SCENARIO_B';
  const currentStep = simState?.currentStep ?? 0;
  const maxSteps = simState?.scenarioDetails?.maxSteps ?? 6;
  const isRunning = simState?.status === 'RUNNING';
  const currentTourStage = GUIDED_TOUR_STAGES[currentTourStageIndex];

  return (
    <div className="w-full bg-[#030718]/95 border-b border-cyan-900/50 text-slate-100 text-xs backdrop-blur-md sticky top-0 z-40 transition-all">
      {/* GUIDED TOUR ACTIVE STRIP */}
      {isGuidedTourActive && (
        <div className="bg-gradient-to-r from-cyan-950/90 via-[#0B1A36] to-cyan-950/90 border-b border-cyan-500/50 px-4 py-2">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Left: Stage Title & Number */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500 text-black font-extrabold rounded-lg font-mono text-xs shadow-[0_0_15px_rgba(0,229,255,0.6)]">
                <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '8s' }} />
                <span>STAGE {currentTourStage.stageNumber} OF 7</span>
              </div>
              <div>
                <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                  <span>{currentTourStage.title}</span>
                  <span className="text-[10px] text-cyan-300 font-mono hidden sm:inline">
                    (Target: {currentTourStage.targetTab.toUpperCase()})
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-tight">
                  {currentTourStage.narration}
                </p>
              </div>
            </div>

            {/* Right: Stage Navigation Controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Stepper Dots */}
              <div className="hidden lg:flex items-center gap-1 mr-2">
                {GUIDED_TOUR_STAGES.map((s, idx) => (
                  <button
                    key={s.stageNumber}
                    onClick={() => handleJumpToStage(idx)}
                    className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center transition-all cursor-pointer ${
                      currentTourStageIndex === idx
                        ? 'bg-cyan-400 text-black font-bold ring-2 ring-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title={s.title}
                  >
                    {s.stageNumber}
                  </button>
                ))}
              </div>

              <button
                onClick={handlePrevTourStage}
                disabled={currentTourStageIndex === 0}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-mono transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <button
                onClick={handleNextTourStage}
                disabled={currentTourStageIndex === GUIDED_TOUR_STAGES.length - 1}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white text-xs font-mono font-bold transition-all shadow-[0_0_12px_rgba(0,229,255,0.3)] cursor-pointer"
              >
                <span>Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleExitTour}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
                title="Exit Guided Tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STANDARD SIMULATION CONTROLLER RIBBON */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mode Badge & Scenario Selector */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/60 border border-cyan-800/50 rounded text-cyan-400 font-mono tracking-wider uppercase font-semibold">
            <Activity className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>MISSION SIMULATOR</span>
          </div>

          {!isGuidedTourActive && (
            <button
              onClick={handleStartGuidedTour}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,229,255,0.4)] cursor-pointer"
              title="Launch Guided 7-Stage End-to-End Walkthrough"
            >
              <Compass className="w-3.5 h-3.5 text-white" />
              <span>START 7-STAGE GUIDED TOUR</span>
            </button>
          )}

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

        {/* Center: DSN Link Status & Capability Disclosure */}
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

        {/* Right: Simulation Step & Playback Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isRunning ? (
            <button
              onClick={handlePause}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-950/60 hover:bg-amber-900/60 border border-amber-700/60 text-amber-200 rounded font-medium transition-colors cursor-pointer"
              title="Pause Simulation"
            >
              <Pause className="w-3 h-3" />
              <span className="hidden sm:inline">Pause</span>
            </button>
          ) : (
            <button
              onClick={handleResume}
              disabled={loading}
              className="flex items-center gap-1 px-2.5 py-1 bg-cyan-900/50 hover:bg-cyan-800/60 border border-cyan-600/60 text-cyan-200 rounded font-medium transition-colors cursor-pointer"
              title="Start / Resume Playback"
            >
              <Play className="w-3 h-3" />
              <span className="hidden sm:inline">Play</span>
            </button>
          )}

          <button
            onClick={handleStep}
            disabled={loading}
            className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded font-medium transition-colors cursor-pointer"
            title="Step Next Telemetry Cycle"
          >
            <SkipForward className="w-3 h-3 text-cyan-400" />
            <span>Step</span>
          </button>

          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-1 px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded font-medium transition-colors cursor-pointer"
            title="Reset Scenario to Step 0"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset</span>
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-slate-400 hover:text-slate-200 ml-1 cursor-pointer"
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
