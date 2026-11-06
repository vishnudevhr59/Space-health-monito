import React from 'react';
import {
  AlertTriangle,
  Heart,
  Droplets,
  Wind,
  Compass,
  RotateCcw,
  Zap,
  Activity,
  ShieldCheck,
  X,
} from 'lucide-react';

export interface AnomalyInjectionState {
  isAnomalyActive: boolean;
  anomalyName: string;
  heartRate: number;
  spo2: number;
  bodyTemperature: number;
  bloodPressure: { systolic: number; diastolic: number };
  hrv: number;
  respiratoryRate: number;
  cabinPressurePsi: number;
  cabinCo2MmHg: number;
  vestibularConflictScore: number;
  severity: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  etiology: string;
  countermeasures: string[];
}

export const NOMINAL_HEALTH_STATE: AnomalyInjectionState = {
  isAnomalyActive: false,
  anomalyName: 'Nominal Operations',
  heartRate: 64,
  spo2: 98.4,
  bodyTemperature: 36.6,
  bloodPressure: { systolic: 114, diastolic: 72 },
  hrv: 62,
  respiratoryRate: 14,
  cabinPressurePsi: 14.7,
  cabinCo2MmHg: 2.2,
  vestibularConflictScore: 1.4,
  severity: 'NOMINAL',
  etiology: 'All physiological and environmental indicators calibrated to nominal microgravity setpoint.',
  countermeasures: ['Maintain scheduled ARED resistive workout', 'Routine hydration protocol'],
};

interface SimulationAnomalyPanelProps {
  currentState: AnomalyInjectionState;
  onInjectAnomaly: (state: AnomalyInjectionState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SimulationAnomalyPanel: React.FC<SimulationAnomalyPanelProps> = ({
  currentState,
  onInjectAnomaly,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const anomalyPresets: Array<{
    id: string;
    title: string;
    description: string;
    severity: 'WARNING' | 'CRITICAL';
    icon: React.ReactNode;
    state: Partial<AnomalyInjectionState>;
  }> = [
    {
      id: 'tachycardia',
      title: 'Elevated Heart Rate Spike',
      description: 'Acute resting tachycardia (142 BPM) with severe parasympathetic vagal withdrawal.',
      severity: 'CRITICAL',
      icon: <Heart className="w-4 h-4 text-rose-400" />,
      state: {
        isAnomalyActive: true,
        anomalyName: 'Acute Resting Tachycardia & Autonomic Exhaustion',
        heartRate: 142,
        hrv: 18,
        bloodPressure: { systolic: 154, diastolic: 96 },
        respiratoryRate: 24,
        severity: 'CRITICAL',
        etiology: 'Sympathovagal deconditioning and cephalad fluid loss with suspected cardiac hyper-irritability.',
        countermeasures: [
          'Immediate cessation of high-g activity and transition to 15° head-up sleep rack',
          'Oral saline rehydration salt bolus 750 mL within 30 minutes',
          'Initiate continuous 12-lead ECG telemetry downlink to NASA Houston MCC / DSN Goldstone',
          'Perform 20-minute resonant diaphragmatic breathing biofeedback',
        ],
      },
    },
    {
      id: 'decompression',
      title: 'Cabin Pressure Drop (Decompression)',
      description: 'Rapid cabin depressurization from 14.7 psi down to 11.2 psi due to micrometeoroid penetration.',
      severity: 'CRITICAL',
      icon: <Wind className="w-4 h-4 text-rose-400" />,
      state: {
        isAnomalyActive: true,
        anomalyName: 'Rapid Habitat Depressurization (ECLSS Alert)',
        cabinPressurePsi: 11.2,
        spo2: 91.0,
        heartRate: 118,
        respiratoryRate: 26,
        severity: 'CRITICAL',
        etiology: 'Atmospheric containment leak in Lunar Gateway HALO module; risk of ebullism and hypoxia.',
        countermeasures: [
          'Immediate crew donning of emergency launch-entry pressure suits (ACES/Orion suit)',
          'Automated isolation valve closure for HALO Node 2 bulkhead hatch',
          'Switch oxygen generator assembly (OGA) to emergency high-flow 100% O2 delivery',
          'Verify hull puncture seal sealant deployment kit',
        ],
      },
    },
    {
      id: 'hypoxia',
      title: 'Severe Hypoxia (SpO2 Drop)',
      description: 'Blood oxygen saturation plunges to 89.2% with peripheral cyanosis risk.',
      severity: 'CRITICAL',
      icon: <Droplets className="w-4 h-4 text-rose-400" />,
      state: {
        isAnomalyActive: true,
        anomalyName: 'Severe Arterial Hypoxemia (SpO2 < 90%)',
        spo2: 89.2,
        heartRate: 108,
        respiratoryRate: 22,
        severity: 'CRITICAL',
        etiology: 'Reduced alveolar partial pressure and vent-perfusion mismatch in microgravity.',
        countermeasures: [
          'Immediate administration of supplemental O2 via crew nasal cannula at 4 L/min',
          'Measure venous blood lactate using handheld i-STAT biomedical analyzer',
          'Inspect cabin atmospheric recirculation fans for carbon monoxide or argon pockets',
        ],
      },
    },
    {
      id: 'co2_saturation',
      title: 'CO2 Scrubber Saturation (Hypercapnia)',
      description: 'CDRA bed saturation causes ambient CO2 to exceed 4.8 mmHg; frontal cephalalgia.',
      severity: 'WARNING',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
      state: {
        isAnomalyActive: true,
        anomalyName: 'Ambient CO2 Saturation & Hypercapnia Risk',
        cabinCo2MmHg: 4.8,
        heartRate: 86,
        bodyTemperature: 37.3,
        severity: 'WARNING',
        etiology: 'Sorbent canister breakthrough in Carbon Dioxide Removal Assembly (CDRA); hypercapnic cerebral vasodilation.',
        countermeasures: [
          'Manual thermal regeneration override of CDRA desiccant bed A & B',
          'Deploy backup LiOH (Lithium Hydroxide) emergency air scrubbers in crew quarters',
          'Crew administration of 400 mg oral ibuprofen for CO2-induced cranial hypertension',
        ],
      },
    },
    {
      id: 'vestibular',
      title: 'Vestibular Disorientation (SMS)',
      description: 'Severe Space Motion Sickness with otolith-ocular counter-rolling discordance (Score 8.8/10).',
      severity: 'WARNING',
      icon: <Compass className="w-4 h-4 text-amber-400" />,
      state: {
        isAnomalyActive: true,
        anomalyName: 'Microgravity Neuro-Vestibular Disorientation & SMS',
        vestibularConflictScore: 8.8,
        heartRate: 82,
        severity: 'WARNING',
        etiology: 'Sensory mismatch between visual cues and absence of otolith gravitational shear forces.',
        countermeasures: [
          'Promethazine 25 mg intramuscular / oral countermeasure administration',
          'Head and cervical immobilization protocol during orbital station reboost',
          'Engage tactile anchor harness inside crew quarters to restore proprioceptive orientation',
        ],
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#070D1F] border-2 border-cyan-500/60 rounded-2xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-[0_0_50px_rgba(0,229,255,0.25)] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-900/50 flex items-center justify-between bg-cyan-950/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/20 rounded-xl border border-cyan-500/50">
              <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <span>TACTICAL ANOMALY INJECTION PANEL</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/50">
                  JUDGE SIMULATOR
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Inject real-time anomalies to observe the AI Diagnostic Engine & Flight Surgeon response
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs font-mono">
          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">CURRENT SIMULATED STATE:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  currentState.severity === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-300 border border-rose-500 animate-pulse'
                    : currentState.severity === 'WARNING'
                    ? 'bg-amber-950 text-amber-300 border border-amber-500'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                }`}
              >
                ● {currentState.anomalyName} ({currentState.severity})
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-slate-400 font-bold text-[11px] block">AVAILABLE INJECTION ANOMALIES:</span>
            {anomalyPresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => {
                  onInjectAnomaly({
                    ...currentState,
                    ...preset.state,
                  });
                  onClose();
                }}
                className="w-full text-left p-3 rounded-xl bg-[#0B152B] hover:bg-[#101F42] border border-cyan-900/40 hover:border-cyan-400/60 transition-all flex items-start gap-3 cursor-pointer group shadow-sm"
              >
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-700 group-hover:border-cyan-400 transition-colors shrink-0 mt-0.5">
                  {preset.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white text-xs group-hover:text-cyan-300 transition-colors truncate">
                      {preset.title}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono shrink-0 ${
                        preset.severity === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      }`}
                    >
                      {preset.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5 leading-snug">
                    {preset.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={() => {
              onInjectAnomaly(NOMINAL_HEALTH_STATE);
              onClose();
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 font-bold text-xs font-mono transition-colors cursor-pointer shadow-[0_0_15px_rgba(33,212,165,0.2)]"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span>RESET TO NOMINAL BASELINE</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
