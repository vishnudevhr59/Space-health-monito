import React, { useState } from 'react';
import {
  Activity,
  Heart,
  Brain,
  Bone,
  Thermometer,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { AstronautProfile, HealthMeasurement } from '../types';

interface AstronautDigitalTwinProps {
  astronaut: AstronautProfile;
  latestTelemetry?: HealthMeasurement | null;
}

type PhysiologicalSystemKey =
  | 'cardiovascular'
  | 'autonomic'
  | 'musculoskeletal'
  | 'thermoregulation'
  | 'neurocircadian'
  | 'radiation';

interface SystemDetail {
  id: PhysiologicalSystemKey;
  name: string;
  organ: string;
  status: 'Nominal' | 'Adaptive Shift' | 'Under Surveillance';
  statusColor: string;
  keyMetric: string;
  metricValue: string;
  baselineValue: string;
  zScore: string;
  mechanism: string;
  nasaEvidence: string;
  doi: string;
  activeCountermeasures: string[];
}

export const AstronautDigitalTwin: React.FC<AstronautDigitalTwinProps> = ({
  astronaut,
  latestTelemetry,
}) => {
  const [selectedSystem, setSelectedSystem] = useState<PhysiologicalSystemKey>('cardiovascular');

  const hr = latestTelemetry?.heartRate || astronaut.baselineVitals.restingHeartRate || 64;
  const spo2 = latestTelemetry?.spo2 || astronaut.baselineVitals.spo2 || 98.4;
  const hrv = latestTelemetry?.hrv || astronaut.baselineVitals.hrvMs || 58;
  const temp = latestTelemetry?.bodyTemperature || astronaut.baselineVitals.bodyTempC || 37.1;

  const systemsData: Record<PhysiologicalSystemKey, SystemDetail> = {
    cardiovascular: {
      id: 'cardiovascular',
      name: 'Cardiovascular Dynamics',
      organ: 'Myocardium & Microvasculature',
      status: hr > 80 ? 'Under Surveillance' : 'Adaptive Shift',
      statusColor: hr > 80 ? 'text-amber-400' : 'text-emerald-400',
      keyMetric: 'Resting Heart Rate & Baroreceptor Tone',
      metricValue: `${hr} BPM`,
      baselineValue: `${astronaut.baselineVitals.restingHeartRate} BPM (Pre-Flight)`,
      zScore: `+${((hr - astronaut.baselineVitals.restingHeartRate) / 4.2).toFixed(1)}σ`,
      mechanism:
        'Cephalad fluid shift eliminates hydrostatic gradient in microgravity, inducing baroreceptor down-regulation and adaptive resting rate elevation.',
      nasaEvidence: 'NASA OSDR Cardiovascular Longitudinal Data & Twins Study (2019)',
      doi: '10.1126/science.aau8650',
      activeCountermeasures: [
        'ARED 60-min daily resistive exercise',
        'Fluid load prior to high g-transitions',
        'Lower body negative pressure (LBNP) test',
      ],
    },
    autonomic: {
      id: 'autonomic',
      name: 'Autonomic Nervous Balance',
      organ: 'Sympathetic / Parasympathetic Axis',
      status: hrv < 40 ? 'Under Surveillance' : 'Nominal',
      statusColor: hrv < 40 ? 'text-amber-400' : 'text-emerald-400',
      keyMetric: 'Heart Rate Variability (rMSSD)',
      metricValue: `${hrv} ms`,
      baselineValue: `${astronaut.baselineVitals.hrvMs} ms (Pre-Flight)`,
      zScore: `${((hrv - astronaut.baselineVitals.hrvMs) / 8.5).toFixed(1)}σ`,
      mechanism:
        'Vagal tone suppression from operational stress, ambient acoustic noise (>62 dBA), and microgravity autonomic remodeling.',
      nasaEvidence: 'NASA Human Research Program (HRP) Autonomic Regulation Omnibus',
      doi: '10.1038/s41526-020-00124-7',
      activeCountermeasures: [
        'Resonant HRV biofeedback 20 min/sol',
        'Ear-clip transcutaneous vagal stimulation',
        'Active acoustic noise-canceling headsets in bunk',
      ],
    },
    musculoskeletal: {
      id: 'musculoskeletal',
      name: 'Musculoskeletal Integrity',
      organ: 'Proximal Femur & Soleus Complex',
      status: 'Adaptive Shift',
      statusColor: 'text-cyan-400',
      keyMetric: 'Bone Mineral Resorption Rate',
      metricValue: `-${astronaut.boneDensityLossRatePercentPerMonth}% / mo`,
      baselineValue: '0.0% / mo (Terrestrial)',
      zScore: '+1.4σ resorption marker',
      mechanism:
        'Absence of gravitational load disinhibits osteoclastic bone resorption and accelerates trabecular calcium egress.',
      nasaEvidence: 'NASA Bone Mineral Density Loss in Spaceflight Meta-Analysis',
      doi: '10.1016/j.bone.2021.115982',
      activeCountermeasures: [
        'ARED Heavy deadlifts & squats (2.5x bodyweight)',
        'Oral Vitamin D3 (2000 IU/sol) + Calcium',
        'Anti-resorptive bisphosphonate therapy (bi-monthly)',
      ],
    },
    thermoregulation: {
      id: 'thermoregulation',
      name: 'Spaceflight Thermoregulation',
      organ: 'Hypothalamic Core Setpoint',
      status: 'Adaptive Shift',
      statusColor: 'text-amber-400',
      keyMetric: 'Resting Core Body Temperature',
      metricValue: `${temp}°C`,
      baselineValue: `${astronaut.baselineVitals.bodyTempC}°C (Terrestrial)`,
      zScore: `+${((temp - astronaut.baselineVitals.bodyTempC) / 0.25).toFixed(1)}σ`,
      mechanism:
        'Persistent +0.5°C core temperature elevation due to reduced convective heat dissipation in microgravity and pro-inflammatory cytokine secretion.',
      nasaEvidence: 'ESA/NASA ThermoLab Core Body Temperature Study (Stahn et al., 2017)',
      doi: '10.1038/s41598-017-15560-0',
      activeCountermeasures: [
        'Liquid cooling garment (LCG) during exercise',
        'High convective airflow sleep cabin circulation',
        'Continuous double-sensor forehead heat-flux probe',
      ],
    },
    neurocircadian: {
      id: 'neurocircadian',
      name: 'Neuro-Circadian Actigraphy',
      organ: 'Suprachiasmatic Nucleus & Frontal Cortex',
      status: 'Nominal',
      statusColor: 'text-emerald-400',
      keyMetric: 'Circadian Phase Shift & Sleep Quality',
      metricValue: '88% Efficiency (6.8h)',
      baselineValue: '91% (Pre-Flight)',
      zScore: '-0.6σ sleep efficiency',
      mechanism:
        '90-minute orbital sunrise/sunset cycles disrupt endogenous melatonin synthesis without dynamic dynamic blue-depleted lighting schedules.',
      nasaEvidence: 'NASA Behavioral Health & Performance Sleep Study in Exploration Missions',
      doi: '10.1016/S1474-4422(14)70122-X',
      activeCountermeasures: [
        'Solid-state dynamic spectrum lighting (blue-depleted at 21:00 UTC)',
        'Actigraphy wristband sleep staging',
        'Targeted 0.5 mg exogenous melatonin protocol if needed',
      ],
    },
    radiation: {
      id: 'radiation',
      name: 'Cosmic Radiation Exposure',
      organ: 'Hematopoietic Stem Cells & DNA Repair',
      status: 'Nominal',
      statusColor: 'text-emerald-400',
      keyMetric: 'Cumulative Galactic Cosmic Rays (GCR)',
      metricValue: `${astronaut.radiationCumulativeMSv} mSv`,
      baselineValue: `< ${astronaut.radiationMissionLimitMSv} mSv (Career Limit)`,
      zScore: '31.4% of Career Permissible Limit',
      mechanism:
        'Heavy ion GCR (HZE nuclei) generate dense ionization tracks causing double-strand DNA breaks requiring non-homologous end joining repair.',
      nasaEvidence: 'NASA Space Radiation Cancer Risk Model & OSDR Dosimetry',
      doi: '10.1667/RADE-20-00188.1',
      activeCountermeasures: [
        'Water-wall shielded crew sleep quarters',
        'Automated SPE solar proton storm shelter alignment',
        'Personal active tissue-equivalent proportional counter',
      ],
    },
  };

  const currentSystem = systemsData[selectedSystem];

  return (
    <div className="bg-[#0B1224] rounded-2xl border border-cyan-900/40 p-4 sm:p-6 space-y-5 shadow-xl">
      {/* Header and Disclaimers */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-950/60 rounded-lg border border-cyan-500/40">
              <Zap className="w-5 h-5 text-[#00E5FF] animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>ASTRONAUT DIGITAL TWIN</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  PHYSIOLOGICAL STATE MODEL
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Multi-system organ setpoints calibrated to CDR {astronaut.name} · Day {astronaut.missionDay}
              </p>
            </div>
          </div>
        </div>

        {/* Prototype Disclaimer Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-[11px] text-slate-300 font-sans">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Research decision-support model; not a certified diagnostic device.</span>
        </div>
      </div>

      {/* Main Grid: Anatomical Interactive Representation & System Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Anatomical Node Map (5 cols) */}
        <div className="lg:col-span-5 bg-[#050816] rounded-xl border border-slate-800 p-4 flex flex-col items-center justify-between relative overflow-hidden min-h-[380px]">
          <div className="text-[11px] font-mono text-slate-400 w-full flex justify-between border-b border-slate-800/80 pb-2">
            <span>PHYSIOLOGICAL NODES</span>
            <span className="text-cyan-400">SELECT TO INSPECT</span>
          </div>

          {/* Futuristic Anatomical Vector Wireframe */}
          <div className="relative my-4 w-48 h-72 flex items-center justify-center">
            {/* SVG Astronaut Body Wireframe Silhouette */}
            <svg viewBox="0 0 160 260" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full opacity-60">
              {/* Head / Helmet */}
              <circle cx="80" cy="35" r="24" stroke="#00E5FF" strokeWidth="1.8" strokeDasharray="3 3" />
              <path d="M 62 38 C 62 26, 98 26, 98 38 C 98 50, 62 50, 62 38 Z" fill="#00E5FF" fillOpacity="0.15" />
              {/* Torso */}
              <path d="M 54 62 L 106 62 L 96 150 L 64 150 Z" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Arms */}
              <path d="M 54 64 L 32 110 L 26 155" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 106 64 L 128 110 L 134 155" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
              {/* Legs */}
              <path d="M 70 150 L 66 210 L 62 250" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M 90 150 L 94 210 L 98 250" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>

            {/* Interactive Node 1: Brain / Neuro-Circadian */}
            <button
              onClick={() => setSelectedSystem('neurocircadian')}
              className={`absolute top-[10%] left-[45%] -translate-x-1/2 p-2 rounded-full cursor-pointer transition-all ${
                selectedSystem === 'neurocircadian'
                  ? 'bg-cyan-500 text-black shadow-[0_0_20px_#00E5FF] scale-125 ring-2 ring-white'
                  : 'bg-slate-900 border border-cyan-400 text-cyan-300 hover:scale-110'
              }`}
              title="Brain: Neuro-Circadian Axis"
            >
              <Brain className="w-4 h-4" />
            </button>

            {/* Interactive Node 2: Heart / Cardiovascular */}
            <button
              onClick={() => setSelectedSystem('cardiovascular')}
              className={`absolute top-[32%] left-[44%] -translate-x-1/2 p-2 rounded-full cursor-pointer transition-all ${
                selectedSystem === 'cardiovascular'
                  ? 'bg-rose-500 text-white shadow-[0_0_20px_#f43f5e] scale-125 ring-2 ring-white animate-pulse'
                  : 'bg-slate-900 border border-rose-400 text-rose-300 hover:scale-110'
              }`}
              title="Heart: Cardiovascular Dynamics"
            >
              <Heart className="w-4 h-4" />
            </button>

            {/* Interactive Node 3: Autonomic Balance */}
            <button
              onClick={() => setSelectedSystem('autonomic')}
              className={`absolute top-[44%] left-[58%] -translate-x-1/2 p-1.5 rounded-full cursor-pointer transition-all ${
                selectedSystem === 'autonomic'
                  ? 'bg-purple-500 text-white shadow-[0_0_20px_#a855f7] scale-125 ring-2 ring-white'
                  : 'bg-slate-900 border border-purple-400 text-purple-300 hover:scale-110'
              }`}
              title="Autonomic Nervous Tone"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>

            {/* Interactive Node 4: Thermoregulation Core */}
            <button
              onClick={() => setSelectedSystem('thermoregulation')}
              className={`absolute top-[48%] left-[36%] -translate-x-1/2 p-1.5 rounded-full cursor-pointer transition-all ${
                selectedSystem === 'thermoregulation'
                  ? 'bg-amber-500 text-black shadow-[0_0_20px_#f59e0b] scale-125 ring-2 ring-white'
                  : 'bg-slate-900 border border-amber-400 text-amber-300 hover:scale-110'
              }`}
              title="Core Thermoregulation Setpoint"
            >
              <Thermometer className="w-3.5 h-3.5" />
            </button>

            {/* Interactive Node 5: Musculoskeletal Femur */}
            <button
              onClick={() => setSelectedSystem('musculoskeletal')}
              className={`absolute top-[68%] left-[45%] -translate-x-1/2 p-2 rounded-full cursor-pointer transition-all ${
                selectedSystem === 'musculoskeletal'
                  ? 'bg-emerald-500 text-black shadow-[0_0_20px_#10b981] scale-125 ring-2 ring-white'
                  : 'bg-slate-900 border border-emerald-400 text-emerald-300 hover:scale-110'
              }`}
              title="Musculoskeletal Proximal Femur"
            >
              <Bone className="w-4 h-4" />
            </button>

            {/* Interactive Node 6: Whole-Body Radiation Dosimeter */}
            <button
              onClick={() => setSelectedSystem('radiation')}
              className={`absolute bottom-[2%] right-[5%] p-2 rounded-full cursor-pointer transition-all ${
                selectedSystem === 'radiation'
                  ? 'bg-amber-500 text-black shadow-[0_0_20px_#f59e0b] scale-125 ring-2 ring-white'
                  : 'bg-slate-900 border border-amber-400 text-amber-300 hover:scale-110'
              }`}
              title="Radiation Dosimetry"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>

          {/* Quick System Selector Buttons */}
          <div className="w-full grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-800 text-[10px] font-mono">
            {Object.keys(systemsData).map((key) => {
              const sys = systemsData[key as PhysiologicalSystemKey];
              const isSelected = selectedSystem === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedSystem(key as PhysiologicalSystemKey)}
                  className={`p-1.5 rounded text-center transition-colors truncate cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500 font-bold'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {sys.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Clinical Detail & Countermeasures (7 cols) */}
        <div className="lg:col-span-7 bg-[#050816] rounded-xl border border-slate-800 p-4 sm:p-5 flex flex-col justify-between space-y-4">
          <div>
            {/* System Title and Status Pill */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{currentSystem.name}</span>
                </h4>
                <p className="text-xs text-slate-400 font-mono">{currentSystem.organ}</p>
              </div>
              <span
                className={`text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 font-bold ${currentSystem.statusColor}`}
              >
                {currentSystem.status}
              </span>
            </div>

            {/* Metrics Comparison Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-3.5">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">OBSERVED VALUE</span>
                <span className="text-sm font-bold text-white font-mono">{currentSystem.metricValue}</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">INDIVIDUAL BASELINE</span>
                <span className="text-xs font-semibold text-slate-300 font-mono">{currentSystem.baselineValue}</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 font-mono block">STATISTICAL DEVIATION</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">{currentSystem.zScore}</span>
              </div>
            </div>

            {/* Spaceflight Mechanism */}
            <div className="space-y-1 text-xs">
              <span className="text-slate-400 font-bold font-mono text-[11px]">PHYSIOLOGICAL MECHANISM:</span>
              <p className="text-slate-300 leading-relaxed font-sans text-xs bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/60">
                {currentSystem.mechanism}
              </p>
            </div>

            {/* NASA Evidence and DOI */}
            <div className="mt-3 p-2.5 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-xs space-y-1 font-mono">
              <span className="text-cyan-400 font-bold block text-[11px]">NASA RESEARCH PROVENANCE:</span>
              <div className="text-slate-200 text-[11px]">{currentSystem.nasaEvidence}</div>
              <div className="text-slate-400 text-[10px]">DOI: {currentSystem.doi}</div>
            </div>
          </div>

          {/* Active Countermeasures Footer */}
          <div className="pt-3 border-t border-slate-800">
            <span className="text-slate-400 font-bold font-mono text-[11px] block mb-1.5">
              ACTIVE NASA COUNTERMEASURES:
            </span>
            <div className="space-y-1">
              {currentSystem.activeCountermeasures.map((cm, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{cm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
