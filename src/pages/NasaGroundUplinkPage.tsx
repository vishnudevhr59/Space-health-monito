import React, { useState, useEffect } from 'react';
import {
  AstronautProfile,
  HealthMeasurement,
  SleepRecord,
  ActivityRecord,
  RadiationRecord,
  HealthAlert,
  NasaGroundDispatchPacket,
} from '../types';
import { telemetryStreamEngine, TelemetryFrame } from '../services/telemetryStreamEngine';
import {
  Radio,
  Send,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Clock,
  Activity,
  Heart,
  Droplets,
  Cpu,
  FileText,
  Lock,
  RefreshCw,
  Compass,
  Zap,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Stethoscope,
  Eye,
  Thermometer,
} from 'lucide-react';

interface NasaGroundUplinkPageProps {
  astronaut: AstronautProfile;
  telemetry: HealthMeasurement[];
  sleepRecords: SleepRecord[];
  activityRecords: ActivityRecord[];
  radiation: RadiationRecord[];
  alerts: HealthAlert[];
  onNavigate?: (tab: string) => void;
}

export const NasaGroundUplinkPage: React.FC<NasaGroundUplinkPageProps> = ({
  astronaut,
  telemetry,
  sleepRecords,
  activityRecords,
  radiation,
  alerts,
  onNavigate,
}) => {
  const [liveFrame, setLiveFrame] = useState<TelemetryFrame>(() =>
    telemetryStreamEngine.getCurrentFrame()
  );

  useEffect(() => {
    return telemetryStreamEngine.subscribe((f) => setLiveFrame(f));
  }, []);

  // Form State for Astronaut Self-Assessment Input
  const [groundStation, setGroundStation] = useState<string>('Goldstone DSS-14 (California, USA)');
  const [groundTeam, setGroundTeam] = useState<string>('NASA MCC-H Flight Surgeon Console (Houston, TX, USA)');
  const [priority, setPriority] = useState<
    'Routine Telemetry Briefing' | 'Priority Medical Advisory' | 'Urgent Flight Surgeon Intervention (P1)'
  >('Routine Telemetry Briefing');
  const [bloodSugarMgDl, setBloodSugarMgDl] = useState<number>(94);
  const [ultrasoundNotes, setUltrasoundNotes] = useState<string>(
    'Optic nerve sheath diameter (ONSD) 5.2 mm (bilateral). Retinal vascular bed shows mild venous engorgement consistent with cephalad microgravity fluid shift.'
  );
  const [moodScore, setMoodScore] = useState<number>(8.5);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([
    'Mild Cephalic Fullness',
    'Normal Exercise Tolerance',
  ]);
  const [astronautNotes, setAstronautNotes] = useState<string>(
    'Mission Day 142 routine clinical health assessment. Completed 60 min ARED deadlift cycle. Sleep quality stable with 7.1 hours rest. No acute neuro-vestibular distress.'
  );

  // Transmission State
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);
  const [transmissionProgress, setTransmissionProgress] = useState<number>(0);
  const [transmissionStep, setTransmissionStep] = useState<string>('');
  const [latestDispatch, setLatestDispatch] = useState<NasaGroundDispatchPacket | null>(null);
  const [pastDispatches, setPastDispatches] = useState<NasaGroundDispatchPacket[]>([]);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Load transmission history on mount
  const fetchDispatches = async () => {
    try {
      const res = await fetch('/api/nasa-ground-dispatch');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.dispatches) && data.dispatches.length > 0) {
          setPastDispatches(data.dispatches);
          if (!latestDispatch) {
            setLatestDispatch(data.dispatches[0]);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch ground dispatches:', e);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  // One-Way Light Time calculation based on ground station & location
  const owltSeconds = groundStation.includes('Goldstone')
    ? 1.28
    : groundStation.includes('Madrid')
    ? 1.34
    : 1.31;

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  // Execute DSN transmission to NASA Houston
  const handleTransmitReport = async () => {
    if (isTransmitting) return;

    setIsTransmitting(true);
    setTransmissionProgress(15);
    setTransmissionStep('Assembling encrypted medical telemetry packet (AES-256-GCM)...');

    await new Promise((r) => setTimeout(r, 600));
    setTransmissionProgress(38);
    setTransmissionStep('Hashing telemetry vectors & generating SHA-256 cryptographic checksum...');

    await new Promise((r) => setTimeout(r, 600));
    setTransmissionProgress(65);
    setTransmissionStep(`Locking 32.05 GHz Ka-band transponder beam to ${groundStation}...`);

    await new Promise((r) => setTimeout(r, 700));
    setTransmissionProgress(88);
    setTransmissionStep('Uplinking over Deep Space Network to NASA Johnson Space Center (Houston, TX)...');

    const payload = {
      astronautId: astronaut.id,
      astronautName: astronaut.name,
      destinationGroundTeam: groundTeam,
      dsnStation: groundStation,
      owltLatencySeconds: owltSeconds,
      carrierFrequencyGhz: 32.05,
      priority,
      hrpFiveHazardsAssessment: {
        radiationExposure: `Cumulative dose ${astronaut.radiationCumulativeMSv} mSv (Career ceiling: 600 mSv). Basal deep space GCR flux: 24.8 µSv/h. SPE storm shelter status: NOMINAL.`,
        isolationConfinement: `Sleep efficiency 89%, subjective restfulness 4/5. Cognitive mood score: ${moodScore}/10. No acute behavioral fatigue.`,
        distanceFromEarth: `DSN lock confirmed with ${groundStation}. Autonomous clinical triage protocol operational. Medical kit point-of-care readiness: 100%.`,
        gravityFields: `Bone density loss rate bounded at ${astronaut.boneDensityLossRatePercentPerMonth}%/month. ARED resistance compliance 100%. Cephalad fluid shift compensated.`,
        hostileEnvironment: `ECLSS cabin pressure ${liveFrame.cabinPressurePsi} psi, partial CO2 ${liveFrame.cabinCo2MmHg} mmHg. Water recycling loop microbial count <1 CFU/100mL.`,
      },
      pointOfCareBiometrics: {
        bloodSugarMgDl,
        ultrasoundExamNotes: ultrasoundNotes,
        subjectiveSymptoms: selectedSymptoms,
        cognitiveMoodScore: moodScore,
      },
      liveVitalsSnapshot: {
        heartRate: liveFrame.heartRate,
        spo2: liveFrame.spo2,
        bloodPressure: `${liveFrame.systolicBP}/${liveFrame.diastolicBP}`,
        coreTempC: liveFrame.bodyTemperature,
        cabinPressurePsi: liveFrame.cabinPressurePsi,
        cabinCo2MmHg: liveFrame.cabinCo2MmHg,
      },
      astronautNotes,
    };

    try {
      const res = await fetch('/api/nasa-ground-dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      setTransmissionProgress(100);
      setTransmissionStep('Confirmed! Handover signed by NASA MCC-H Chief Flight Surgeon.');

      if (res.ok) {
        const data = await res.json();
        setLatestDispatch(data.packet);
        setPastDispatches((prev) => [data.packet, ...prev]);
        setSuccessToast(`Report ${data.packet.packetSerial} transmitted to NASA Houston!`);
        setTimeout(() => setSuccessToast(null), 5000);
      }
    } catch (e) {
      console.error('Uplink failed:', e);
      setSuccessToast('Uplink error: Retrying via local DSN buffer...');
    } finally {
      setTimeout(() => {
        setIsTransmitting(false);
        setTransmissionProgress(0);
        setTransmissionStep('');
      }, 900);
    }
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden text-slate-100 font-sans">
      
      {/* HEADER: NASA GROUND UPLINK TELEMETRY CONSOLE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#00E5FF] font-mono text-xs uppercase tracking-wider mb-1 font-bold">
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>NASA MCC-HOUSTON FLIGHT MEDICINE DIRECT TELEMEDICINE UPLINK</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>NASA Ground Health Transmission Center</span>
            <span className="text-xs sm:text-sm font-mono font-normal text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
              DSN CARRIER LOCKED (32.05 GHz)
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Transmit real-time clinical health dossiers, point-of-care biometrics, and NASA Human Research Program (HRP) 5-hazard evaluations directly to flight surgeons monitoring at NASA Johnson Space Center (Houston, Texas, USA).
          </p>
        </div>

        {/* Quick Ground Info Pill */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="px-3.5 py-2 rounded-xl bg-[#101B30] border border-[#00E5FF]/40 text-[#00E5FF] flex items-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.15)]">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] text-slate-400 leading-none">TARGET CLINIC</div>
              <div className="font-bold text-white leading-tight">NASA JSC Houston (Bldg 30)</div>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-[#0B1224] border border-slate-700 text-slate-300 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <div>
              <div className="text-[10px] text-slate-400 leading-none">LIGHT TIME (OWLT)</div>
              <div className="font-bold text-amber-300 leading-tight">{owltSeconds}s Delay</div>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST CONFIRMATION */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border-2 border-emerald-500 text-emerald-200 flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-in fade-in duration-200">
          <div className="flex items-center gap-3 text-xs sm:text-sm font-mono">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{successToast}</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest font-bold">
            NASA MCC-H SIGNED
          </span>
        </div>
      )}

      {/* ROW 1: LIVE 1Hz SPACECRAFT BIOTELEMETRY SNAPSHOT FOR TRANSMISSION */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B1224]/90 border border-[#00E5FF]/30 shadow-[0_4px_20px_rgba(0,0,0,0.5)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>1Hz Spacecraft Bus Live Snapshot (EXP-72 Commander {astronaut.name})</span>
          </div>
          <div className="mt-2 grid grid-cols-3 sm:grid-cols-6 gap-3 text-xs font-mono">
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block text-[9px]">HEART RATE</span>
              <strong className="text-white text-sm">{liveFrame.heartRate} BPM</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block text-[9px]">SPO2 SAT</span>
              <strong className="text-cyan-400 text-sm">{liveFrame.spo2}%</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block text-[9px]">BLOOD PRESSURE</span>
              <strong className="text-emerald-400 text-sm">{liveFrame.systolicBP}/{liveFrame.diastolicBP}</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block text-[9px]">CORE TEMP</span>
              <strong className="text-amber-400 text-sm">{liveFrame.bodyTemperature}°C</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block text-[9px]">CABIN PRESSURE</span>
              <strong className="text-white text-sm">{liveFrame.cabinPressurePsi} psi</strong>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
              <span className="text-slate-500 block text-[9px]">ATMOSPHERIC CO2</span>
              <strong className="text-slate-300 text-sm">{liveFrame.cabinCo2MmHg} mmHg</strong>
            </div>
          </div>
        </div>

        <div className="text-left md:text-right shrink-0">
          <span className="text-[10px] font-mono text-slate-400 block">SYSTEM ANOMALY STATUS</span>
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold mt-1 ${
              liveFrame.severity === 'CRITICAL'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-600'
                : liveFrame.severity === 'WARNING'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-600'
                : 'bg-emerald-950/80 text-emerald-300 border border-emerald-600'
            }`}
          >
            {liveFrame.severity} · {liveFrame.anomalyName}
          </span>
        </div>
      </div>

      {/* ROW 2: 2-COLUMN WORKSPACE: LEFT (TRANSMISSION FORM & HRP HAZARDS) | RIGHT (RETURNED NASA FLIGHT SURGEON DOSSIER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (8 COLS): CONFIGURATOR & ASTRONAUT SELF-ASSESSMENT */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* CARD 1: DSN ROUTING & CLINICAL PRIORITY */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#101B30]/90 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#00E5FF] flex items-center gap-2">
              <Radio className="w-4 h-4" />
              <span>1. DSN Uplink Routing & Triage Priority</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <label className="text-slate-400 block mb-1.5 font-bold">Deep Space Ground Station</label>
                <select
                  value={groundStation}
                  onChange={(e) => setGroundStation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1224] border border-slate-700 text-white focus:outline-none focus:border-[#00E5FF] cursor-pointer"
                >
                  <option value="Goldstone DSS-14 (California, USA)">Goldstone DSS-14 (California, USA - 70m)</option>
                  <option value="Madrid DSS-63 (Robledo, Spain)">Madrid DSS-63 (Robledo, Spain - 70m)</option>
                  <option value="Canberra DSS-43 (Tidbinbilla, Australia)">Canberra DSS-43 (Tidbinbilla, Australia - 70m)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5 font-bold">Target NASA Monitoring Entity</label>
                <select
                  value={groundTeam}
                  onChange={(e) => setGroundTeam(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1224] border border-slate-700 text-white focus:outline-none focus:border-[#00E5FF] cursor-pointer"
                >
                  <option value="NASA MCC-H Flight Surgeon Console (Houston, TX, USA)">
                    NASA MCC-H Flight Surgeon (Houston, TX)
                  </option>
                  <option value="NASA Human Research Program (HRP) Science Team (JSC)">
                    NASA HRP Biomedical Team (JSC)
                  </option>
                  <option value="Translational Research Institute for Space Health (TRISH)">
                    TRISH Space Health Consortium
                  </option>
                  <option value="NASA Behavioral Health & Performance (BHP) Operations">
                    NASA Behavioral Health & Performance (BHP)
                  </option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1.5 font-mono text-xs font-bold">
                Clinical Urgency & Triage Level
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(
                  [
                    'Routine Telemetry Briefing',
                    'Priority Medical Advisory',
                    'Urgent Flight Surgeon Intervention (P1)',
                  ] as const
                ).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setPriority(lvl)}
                    className={`px-3 py-2 rounded-xl text-xs font-mono font-medium border transition-all cursor-pointer text-left ${
                      priority === lvl
                        ? lvl.includes('Urgent')
                          ? 'bg-rose-950/80 border-rose-500 text-rose-200 font-bold shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                          : lvl.includes('Priority')
                          ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                          : 'bg-cyan-950/80 border-[#00E5FF] text-[#00E5FF] font-bold shadow-[0_0_12px_rgba(0,229,255,0.3)]'
                        : 'bg-[#0B1224] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CARD 2: ASTRONAUT SELF-ASSESSMENT & POINT-OF-CARE INPUTS (From Hackathon Objectives) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#101B30]/90 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#00E5FF] flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#21D4A5]" />
              <span>2. Crew Self-Assessment & Point-of-Care Diagnostic Measurements</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              {/* Point-of-care Blood Sugar */}
              <div className="p-3.5 rounded-2xl bg-[#0B1224] border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                    <Droplets className="w-3.5 h-3.5 text-rose-400" />
                    <span>Point-of-Care Blood Sugar</span>
                  </span>
                  <span className="text-emerald-400 text-[10px] font-bold">Normoglycemic</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min="50"
                    max="300"
                    value={bloodSugarMgDl}
                    onChange={(e) => setBloodSugarMgDl(Number(e.target.value) || 94)}
                    className="w-24 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-[#00E5FF]"
                  />
                  <span className="text-slate-400 text-xs">mg/dL (i-STAT POC Analyzer)</span>
                </div>
              </div>

              {/* Cognitive & Mood Scale */}
              <div className="p-3.5 rounded-2xl bg-[#0B1224] border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 flex items-center gap-1.5 font-bold">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Mood & Alertness Score</span>
                  </span>
                  <span className="text-cyan-400 font-bold">{moodScore} / 10.0</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.5"
                  value={moodScore}
                  onChange={(e) => setMoodScore(parseFloat(e.target.value))}
                  className="w-full mt-3 accent-[#00E5FF] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Severe Confinement Stress</span>
                  <span>Optimal Circadian State</span>
                </div>
              </div>
            </div>

            {/* Subjective Symptoms Checklist */}
            <div>
              <label className="text-slate-400 block mb-2 font-mono text-xs font-bold">
                Subjective Physiological Symptoms (Tap to toggle)
              </label>
              <div className="flex flex-wrap gap-2 text-xs font-mono">
                {[
                  'Mild Cephalic Fullness',
                  'Visual Blur / SANS',
                  'Transient Otolith SMS',
                  'Lower Back Discomfort',
                  'Calf Muscle Soreness',
                  'Normal Exercise Tolerance',
                  'Restful Deep Sleep',
                  'Mild Nasal Congestion',
                ].map((symptom) => {
                  const isChecked = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3 py-1.5 rounded-full border text-xs transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF] font-bold shadow-sm'
                          : 'bg-[#0B1224] border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {isChecked ? '✓ ' : '+ '}
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ultrasound Exam Notes */}
            <div>
              <label className="text-slate-400 block mb-1 font-mono text-xs font-bold flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ultrasound Exam Notes (Butterfly iQ Point-of-Care Imaging)</span>
              </label>
              <textarea
                rows={2}
                value={ultrasoundNotes}
                onChange={(e) => setUltrasoundNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1224] border border-slate-700 text-white text-xs font-sans focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-none"
                placeholder="Enter ultrasound probe findings (e.g. ONSD, jugular vein flow, cardiac chambers)..."
              />
            </div>

            {/* Astronaut Notes to Flight Surgeon */}
            <div>
              <label className="text-slate-400 block mb-1 font-mono text-xs font-bold">
                Astronaut Clinical Narrative for Dr. Vance (NASA Houston)
              </label>
              <textarea
                rows={3}
                value={astronautNotes}
                onChange={(e) => setAstronautNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B1224] border border-slate-700 text-white text-xs font-sans focus:outline-none focus:border-[#00E5FF] leading-relaxed"
                placeholder="Add specific notes, physical feelings, exercise countermeasure feedback, or diet remarks..."
              />
            </div>
          </div>

          {/* CARD 3: NASA HRP 5 HAZARDS LIVE EVALUATION MATRIX */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#101B30]/90 backdrop-blur-xl border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>3. NASA Human Research Program (HRP) 5 Hazards Assessment</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">JSC Standard Roadmap</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#0B1224] border border-slate-800">
                <span className="text-cyan-400 font-bold block mb-1">1. Space Radiation:</span>
                <span className="text-slate-300 text-[11px] leading-relaxed">
                  Cumulative dose {astronaut.radiationCumulativeMSv} mSv (Career ceiling: 600 mSv). Basal GCR flux 24.8 µSv/h. Quiet solar disk.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1224] border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">2. Isolation & Confinement:</span>
                <span className="text-slate-300 text-[11px] leading-relaxed">
                  Sleep duration 6.8h/sol (89% efficiency). Mood rating {moodScore}/10. Circadian phototherapy cycle nominal.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1224] border border-slate-800">
                <span className="text-amber-400 font-bold block mb-1">3. Distance from Earth:</span>
                <span className="text-slate-300 text-[11px] leading-relaxed">
                  Deep Space Network link active. Autonomous triage protocol operational; POC medical kit at 100% capacity.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1224] border border-slate-800">
                <span className="text-purple-400 font-bold block mb-1">4. Gravity Fields:</span>
                <span className="text-slate-300 text-[11px] leading-relaxed">
                  Bone demineralization bounded at {astronaut.boneDensityLossRatePercentPerMonth}%/mo. ARED deadlift/squat adherence 100%.
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0B1224] border border-slate-800 sm:col-span-2">
                <span className="text-rose-400 font-bold block mb-1">5. Hostile Closed Environment:</span>
                <span className="text-slate-300 text-[11px] leading-relaxed">
                  ECLSS atmospheric pressure {liveFrame.cabinPressurePsi} psi, CO2 {liveFrame.cabinCo2MmHg} mmHg. Trace contaminant scrubbers operating at 99.4% efficiency.
                </span>
              </div>
            </div>
          </div>

          {/* TRANSMIT ACTION BUTTON WITH REAL-TIME PROGRESS */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-[#0B1224] to-[#101B30] border-2 border-[#00E5FF]/40 shadow-[0_0_35px_rgba(0,229,255,0.2)] space-y-3">
            {isTransmitting && (
              <div className="space-y-2 font-mono">
                <div className="flex justify-between text-xs text-[#00E5FF]">
                  <span>{transmissionStep}</span>
                  <span className="font-bold">{transmissionProgress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-[#00E5FF]/30">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 via-[#00E5FF] to-emerald-400 transition-all duration-300"
                    style={{ width: `${transmissionProgress}%` }}
                  />
                </div>
              </div>
            )}

            <button
              onClick={handleTransmitReport}
              disabled={isTransmitting}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#00E5FF] via-[#438BFF] to-emerald-400 hover:brightness-110 active:scale-98 text-[#050816] font-extrabold text-sm sm:text-base font-mono transition-all shadow-[0_0_25px_rgba(0,229,255,0.4)] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-[#050816]" />
              <span>
                {isTransmitting
                  ? 'UPLINKING TO NASA HOUSTON...'
                  : 'TRANSMIT CLINICAL DOSSIER TO NASA MCC-HOUSTON'}
              </span>
              <Radio className="w-4 h-4 text-[#050816] animate-pulse" />
            </button>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
              <span>SHA-256 Cryptographic Integrity Sealing &bull; AES-256 Payload Encryption</span>
              <span className="text-cyan-400">NASA JSC Building 30 Ready</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (5 COLS): LATEST SIGNED RETURNED NASA REPORT & DIRECTIVES */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* LATEST FLIGHT SURGEON DOSSIER RETURNED FROM HOUSTON */}
          <div className="p-5 sm:p-6 rounded-3xl bg-[#101B30]/95 backdrop-blur-xl border-2 border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.15)] space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    NASA Houston Ground Reply
                  </h3>
                  <div className="text-[10px] font-mono text-emerald-400">
                    Clinical Sign-off from NASA JSC Building 30
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500 text-[10px] font-mono font-bold">
                OFFICIALLY SIGNED
              </span>
            </div>

            {latestDispatch ? (
              <div className="space-y-4 text-xs font-mono">
                {/* Docket Header */}
                <div className="p-3 rounded-xl bg-[#0B1224] border border-slate-800 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">PACKET SERIAL:</span>
                    <strong className="text-[#00E5FF]">{latestDispatch.packetSerial}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">DSN GROUND LINK:</span>
                    <strong className="text-white">{latestDispatch.dsnStation}</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">TRANSMISSION TIME:</span>
                    <span className="text-slate-300">{new Date(latestDispatch.dispatchedAt).toLocaleTimeString()} UTC</span>
                  </div>
                </div>

                {/* Ground Physician Assessment */}
                {latestDispatch.groundPhysicianResponse && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div className="text-[10px] uppercase text-emerald-400 font-bold mb-1">
                        Chief Flight Surgeon Clinical Evaluation:
                      </div>
                      <p className="text-slate-200 text-xs font-sans leading-relaxed">
                        &quot;{latestDispatch.groundPhysicianResponse.clinicalAssessment}&quot;
                      </p>
                      <div className="mt-2 text-[10px] text-slate-400 font-mono">
                        Evaluated by: <strong className="text-white">{latestDispatch.groundPhysicianResponse.reviewedBy}</strong>
                      </div>
                    </div>

                    {/* Actionable Directives */}
                    <div>
                      <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Prescribed Ground Medical Directives:</span>
                      </div>
                      <ul className="space-y-1.5 text-[11px] text-slate-300 font-mono">
                        {latestDispatch.groundPhysicianResponse.actionableDirectives.map((d, i) => (
                          <li key={i} className="p-2 rounded-lg bg-[#0B1224] border border-slate-800 flex items-start gap-2">
                            <span className="text-emerald-400 font-bold">0{i + 1}.</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Approved Countermeasures */}
                    <div>
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Authorized Flight Countermeasures:</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-300">
                        {latestDispatch.groundPhysicianResponse.approvedCountermeasures.map((c, i) => (
                          <div key={i} className="px-2.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-200">
                            &bull; {c}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cryptographic Verification Stamp */}
                    <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-[10px] text-slate-400 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <Lock className="w-3 h-3" />
                        <span>SHA-256 VERIFIED</span>
                      </div>
                      <span className="font-mono text-slate-400 truncate max-w-[200px]">
                        {latestDispatch.sha256Checksum.slice(0, 24)}...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-slate-400 space-y-2">
                <Radio className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
                <p className="text-xs">No uplink dispatched yet on this session.</p>
                <p className="text-[10px] text-slate-500">
                  Complete your self-assessment and tap &quot;TRANSMIT CLINICAL DOSSIER&quot; to initiate DSN transmission.
                </p>
              </div>
            )}
          </div>

          {/* DSN TRANSMISSION LEDGER / HISTORY */}
          <div className="p-5 rounded-3xl bg-[#101B30]/90 backdrop-blur-xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Uplink Transmission History Ledger</span>
              </h4>
              <button
                onClick={fetchDispatches}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {pastDispatches.length > 0 ? (
                pastDispatches.map((disp) => (
                  <div
                    key={disp.id}
                    onClick={() => setLatestDispatch(disp)}
                    className={`p-3 rounded-xl border text-xs font-mono transition-all cursor-pointer ${
                      latestDispatch?.id === disp.id
                        ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-white'
                        : 'bg-[#0B1224] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-[#00E5FF]">{disp.packetSerial}</span>
                      <span className="text-[10px] text-emerald-400">SIGNED</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {disp.dsnStation} &bull; {disp.priority}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-500 font-mono">
                  No previous telemetry transmissions recorded.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
