import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronUp,
  ChevronDown,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Printer,
  Compass,
  Zap,
  Volume2,
  X,
  FastForward,
} from 'lucide-react';
import { telemetryStreamEngine, TelemetryFrame } from '../services/telemetryStreamEngine';
import { missionAuditTrailService } from '../services/missionAuditTrailService';
import { voiceAlertService } from '../services/voiceAlertService';
import { generateMissionReport, exportMissionDossierMarkdown } from '../utils/generateMissionReport';
import { NOMINAL_HEALTH_STATE } from './SimulationAnomalyPanel';
import { AstronautProfile, HealthMeasurement, SleepRecord, ActivityRecord, RadiationRecord, HealthAlert } from '../types';

interface DemoAssistantToolbarProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  astronaut: AstronautProfile;
  telemetry: HealthMeasurement[];
  sleepRecords: SleepRecord[];
  activityRecords: ActivityRecord[];
  radiation: RadiationRecord[];
  alerts: HealthAlert[];
}

export const DemoAssistantToolbar: React.FC<DemoAssistantToolbarProps> = ({
  currentTab,
  onNavigateTab,
  astronaut,
  telemetry,
  sleepRecords,
  activityRecords,
  radiation,
  alerts,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [activeStepRunning, setActiveStepRunning] = useState<number | null>(null);
  const [isAutoPlayRunning, setIsAutoPlayRunning] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('Ready for live judge evaluation');

  // Step 1: Start 7-Stage Guided Tour
  const handleStep1GuidedTour = async () => {
    setActiveStepRunning(1);
    setCurrentStep(1);
    setStatusMessage('Step 1: Starting 7-Stage Guided Tour on Mission Brief...');
    onNavigateTab('landing');

    // Trigger simulation start
    try {
      await fetch('/api/simulation/start', { method: 'POST' });
    } catch {
      // Offline fallback
    }

    voiceAlertService.speakWarningAlert(
      'Mission Control demonstration sequence initiated',
      'Beginning seven stage aerospace telemetry tour'
    );

    setTimeout(() => {
      setActiveStepRunning(null);
      setStatusMessage('Step 1 active: Guided tour initialized.');
    }, 1200);
  };

  // Step 2: Inject Scenario B & trigger voice alert
  const handleStep2InjectScenarioB = async () => {
    setActiveStepRunning(2);
    setCurrentStep(2);
    setStatusMessage('Step 2: Injecting Scenario B (Gradual Health Deviation & Hypoxia)...');
    onNavigateTab('dashboard');

    // Inject Scenario B telemetry stream (Elevated HR 118, SpO2 93%, CO2 4.8 mmHg)
    telemetryStreamEngine.setTargetState({
      heartRate: 118,
      spo2: 93.2,
      bodyTemperature: 37.8,
      bloodPressure: { systolic: 138, diastolic: 88 },
      respiratoryRate: 22,
      hrv: 38,
      cabinPressurePsi: 14.1,
      cabinCo2MmHg: 4.8,
      vestibularConflictScore: 3.4,
      severity: 'WARNING',
      isAnomalyActive: true,
      anomalyName: 'Scenario B: Gradual Autonomic Deviation & Hypercapnia',
      etiology: 'Gradual cumulative carbon dioxide accumulation and autonomic sympathetic elevation.',
      countermeasures: [
        'Engage auxiliary CDRA amine bed desorption loop',
        'Verify astronaut hydration and vital signs stability',
      ],
    });

    // Voice announcement
    voiceAlertService.speakCriticalAlert(
      'Warning: Autonomic baseline drift detected',
      'Heart rate elevating to one hundred eighteen BPM. Cabin carbon dioxide approaching four point eight millimeters mercury.'
    );

    // Also notify simulation backend if online
    try {
      await fetch('/api/simulation/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: 'SCENARIO_B' }),
      });
    } catch {
      // Local stream fallback
    }

    setTimeout(() => {
      setActiveStepRunning(null);
      setStatusMessage('Step 2 active: Anomaly injected. Speech synthesis alert broadcast.');
    }, 1500);
  };

  // Step 3: Execute Autonomous Self-Healing countdown & countermeasure
  const handleStep3SelfHealing = () => {
    setActiveStepRunning(3);
    setCurrentStep(3);
    setStatusMessage('Step 3: Triggering autonomous mitigation protocol...');
    onNavigateTab('dashboard');

    // 1. Reset telemetry to nominal
    telemetryStreamEngine.setTargetState({
      ...NOMINAL_HEALTH_STATE,
      heartRate: 64,
      spo2: 98.6,
      bodyTemperature: 36.6,
      bloodPressure: { systolic: 114, diastolic: 72 },
      respiratoryRate: 14,
      hrv: 65,
      cabinPressurePsi: 14.7,
      cabinCo2MmHg: 2.2,
      vestibularConflictScore: 1.1,
      severity: 'NOMINAL',
      isAnomalyActive: false,
      anomalyName: 'Nominal Operations',
    });

    // 2. Log in Mission Audit Trail
    missionAuditTrailService.logEvent({
      metTimestamp: `MET +${astronaut.missionDay}d 18:45:00`,
      eventType: 'COUNTERMEASURE_EXECUTED',
      severity: 'NOMINAL',
      title: 'Autonomous Mitigation Executed: PROTO-CDRA-RESIN-AUTO',
      description: 'CO2 removal assembly engaged auxiliary amine bed. O2 buffer normalized to 14.7 psi normobaric standard. (Trigger: Judge Demonstration Override)',
      actor: 'Autonomous AI Flight Controller',
      telemetrySnapshot: {
        heartRate: 64,
        spo2: 98.6,
        bodyTemperature: 36.6,
        systolicBP: 114,
        diastolicBP: 72,
        respiratoryRate: 14,
        cabinPressurePsi: 14.7,
        cabinCo2MmHg: 2.2,
        vestibularConflictScore: 1.1,
      },
    });

    // 3. Audio confirmation
    voiceAlertService.speakWarningAlert(
      'Autonomous self healing complete',
      'Atmospheric loop stabilized. Physiological parameters returned to nominal envelope.'
    );

    setTimeout(() => {
      setActiveStepRunning(null);
      setStatusMessage('Step 3 complete: Self-healing countermeasure verified in audit log.');
    }, 1500);
  };

  // Step 4: Open MONITO AI chat & query
  const handleStep4MonitoAi = () => {
    setActiveStepRunning(4);
    setCurrentStep(4);
    setStatusMessage('Step 4: Opening MONITO AI decision support & dispatching telemetry query...');
    onNavigateTab('monito-ai');

    setTimeout(() => {
      // Dispatch custom event to trigger query
      window.dispatchEvent(
        new CustomEvent('monito-ai-trigger-query', {
          detail: { query: 'Analyze Current Telemetry' },
        })
      );
      setActiveStepRunning(null);
      setStatusMessage('Step 4 complete: MONITO AI clinical evaluation generated.');
    }, 600);
  };

  // Step 5: Export Mission Dossier PDF / Markdown
  const handleStep5ExportReport = () => {
    setActiveStepRunning(5);
    setCurrentStep(5);
    setStatusMessage('Step 5: Aggregating telemetry dossier and launching print-to-PDF...');
    onNavigateTab('reports');

    setTimeout(() => {
      generateMissionReport({
        astronaut,
        telemetry,
        sleepRecords,
        activityRecords,
        radiation,
        alerts,
        reportPeriod: 'Weekly',
      });
      setActiveStepRunning(null);
      setStatusMessage('Step 5 complete: Mission Health Dossier generated.');
    }, 800);
  };

  // Run full automated judge presentation sequence
  const handleRunFullSequence = async () => {
    if (isAutoPlayRunning) {
      setIsAutoPlayRunning(false);
      return;
    }

    setIsAutoPlayRunning(true);
    setStatusMessage('Auto-Play: Executing scripted judge presentation (Steps 1–5)...');

    // Step 1
    await handleStep1GuidedTour();
    await new Promise((r) => setTimeout(r, 4000));
    if (!isAutoPlayRunning) return;

    // Step 2
    await handleStep2InjectScenarioB();
    await new Promise((r) => setTimeout(r, 5000));
    if (!isAutoPlayRunning) return;

    // Step 3
    handleStep3SelfHealing();
    await new Promise((r) => setTimeout(r, 4500));
    if (!isAutoPlayRunning) return;

    // Step 4
    handleStep4MonitoAi();
    await new Promise((r) => setTimeout(r, 5500));
    if (!isAutoPlayRunning) return;

    // Step 5
    handleStep5ExportReport();
    setIsAutoPlayRunning(false);
    setStatusMessage('Demo Script Finished! All 5 modules demonstrated successfully.');
  };

  const steps = [
    {
      num: 1,
      title: '7-Stage Tour',
      desc: 'Tour initialization & baseline check',
      action: handleStep1GuidedTour,
      icon: <Compass className="w-4 h-4 text-cyan-400" />,
    },
    {
      num: 2,
      title: 'Inject Scenario B',
      desc: 'Biometric deviation & verbal alert',
      action: handleStep2InjectScenarioB,
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    },
    {
      num: 3,
      title: 'Self-Healing Protocol',
      desc: 'Autonomous fail-safe countermeasure',
      action: handleStep3SelfHealing,
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
    },
    {
      num: 4,
      title: 'MONITO AI Diagnostic',
      desc: 'Query telemetry & HRP literature',
      action: handleStep4MonitoAi,
      icon: <Bot className="w-4 h-4 text-cyan-300" />,
    },
    {
      num: 5,
      title: 'Export Health Dossier',
      desc: 'NASA Gateway Expedition print PDF',
      action: handleStep5ExportReport,
      icon: <Printer className="w-4 h-4 text-indigo-400" />,
    },
  ];

  return (
    <div className="fixed bottom-4 right-3 sm:right-6 z-50 select-none font-sans">
      {/* FLOATING COLLAPSED BADGE / TOGGLE TRIGGER */}
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 rounded-2xl bg-[#09152B]/95 hover:bg-[#0E2042] border-2 border-[#00E5FF] text-white shadow-[0_0_25px_rgba(0,229,255,0.4)] backdrop-blur-xl transition-all cursor-pointer hover:scale-105 active:scale-95 group focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:outline-none min-h-[44px]"
          title="Open Hackathon Demo Assistant Suite"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00E5FF]" />
          </span>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wider text-[#00E5FF] uppercase font-mono leading-none">
              DEMO ASSISTANT
            </span>
            <span className="text-[10px] text-slate-300 font-mono hidden sm:inline leading-tight mt-0.5">
              5-Step Quick Script
            </span>
          </div>
          <ChevronUp className="w-4 h-4 text-[#00E5FF] group-hover:-translate-y-0.5 transition-transform" />
        </button>
      ) : (
        /* EXPANDED HIGH-CONTRAST MISSION DEMO CONTROL CONSOLE */
        <div className="w-[92vw] sm:w-[420px] rounded-3xl bg-[#050B1B]/98 border-2 border-[#00E5FF] shadow-[0_0_40px_rgba(0,0,0,0.8),0_0_30px_rgba(0,229,255,0.25)] backdrop-blur-2xl p-4 sm:p-5 text-slate-100 flex flex-col gap-3.5 transition-all animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#00E5FF]" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-black text-white font-mono uppercase tracking-wider">
                  SPACE HEALTH MONITO · DEMO SUITE
                </h4>
                <p className="text-[10px] text-slate-400 font-mono">
                  1-Click Scripted Sequence for Judges
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
                title="Minimize toolbar"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Status Message Ribbon */}
          <div className="px-3 py-1.5 rounded-xl bg-[#0B152B] border border-cyan-500/30 text-[11px] font-mono text-cyan-300 flex items-center justify-between gap-2">
            <span className="truncate">{statusMessage}</span>
            {activeStepRunning !== null && (
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            )}
          </div>

          {/* 5-Step Buttons List */}
          <div className="flex flex-col gap-2">
            {steps.map((st) => {
              const isRunning = activeStepRunning === st.num;
              const isSelected = currentStep === st.num;
              return (
                <button
                  key={st.num}
                  onClick={st.action}
                  disabled={activeStepRunning !== null}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all text-left cursor-pointer group focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:outline-none min-h-[46px] ${
                    isRunning
                      ? 'bg-cyan-950/90 border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.3)] animate-pulse'
                      : isSelected
                      ? 'bg-[#102244] border-cyan-500/60 text-white'
                      : 'bg-[#081226]/80 hover:bg-[#0E2042] border-slate-800 text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-700 font-mono text-[10px] font-extrabold flex items-center justify-center text-cyan-400 shrink-0">
                      {st.num}
                    </span>
                    <div className="p-1 rounded-md bg-slate-900/60 shrink-0">
                      {st.icon}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                        {st.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {st.desc}
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 shrink-0 ml-2 group-hover:bg-[#00E5FF] group-hover:text-slate-950 transition-colors">
                    {isRunning ? 'RUNNING' : 'RUN'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Actions: Auto-Play Full Demo Script + Reset Baseline */}
          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={handleRunFullSequence}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all cursor-pointer shadow-lg min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#00E5FF] ${
                isAutoPlayRunning
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-gradient-to-r from-[#00E5FF] to-[#438BFF] text-slate-950 hover:brightness-110 font-black'
              }`}
            >
              {isAutoPlayRunning ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>STOP AUTO-PLAY</span>
                </>
              ) : (
                <>
                  <FastForward className="w-3.5 h-3.5" />
                  <span>RUN FULL DEMO SCRIPT</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                handleStep3SelfHealing();
                setCurrentStep(0);
                setStatusMessage('System reset to nominal flight baseline.');
              }}
              className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white font-mono text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
              title="Reset all states to Nominal Baseline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">RESET</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
