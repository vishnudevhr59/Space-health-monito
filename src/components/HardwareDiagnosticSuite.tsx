import React, { useState, useEffect } from 'react';
import {
  Watch,
  Heart,
  Droplets,
  Thermometer,
  Activity,
  Zap,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Send,
  AlertTriangle,
  Radio,
  Sparkles,
  FileText,
  Clock,
  X,
  Stethoscope,
  Maximize2,
  HelpCircle,
  Eye,
  Layers,
  Package,
  Crosshair,
  Video,
  PhoneCall,
  RotateCcw,
} from 'lucide-react';
import { HealthMeasurement, AstronautProfile } from '../types';
import { telemetryStreamEngine, TelemetryFrame } from '../services/telemetryStreamEngine';
import { voiceAlertService } from '../services/voiceAlertService';
import { missionAuditTrailService } from '../services/missionAuditTrailService';

interface HardwareDiagnosticSuiteProps {
  astronaut: AstronautProfile;
  onLogMeasurement: (meas: Partial<HealthMeasurement>) => Promise<void> | void;
  className?: string;
}

export interface SpaceMedicalDevice {
  id: string;
  name: string;
  category: 'TIER_1_CONTINUOUS' | 'TIER_2_SELF_EXAM' | 'TIER_3_EMERGENCY';
  type: 'WEARABLE_PATCH' | 'ULTRASOUND' | 'DOSIMETER' | 'BLOOD_ANALYZER' | 'OPTICAL' | 'MASS_DEVICE' | 'EMERGENCY_KIT';
  connectionStatus: 'CONNECTED' | 'MEASURING' | 'DISCONNECTED';
  batteryPercent: number;
  lastReadingTime: string;
  measuredParameters: string[];
  accuracy: string;
  agencyProvenance: 'NASA / CSA' | 'ISRO / IAM' | 'Axiom / Booz Allen' | 'ESA / JAXA';
}

export const HardwareDiagnosticSuite: React.FC<HardwareDiagnosticSuiteProps> = ({
  astronaut,
  onLogMeasurement,
  className = '',
}) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('astra-smart-vest');
  const [activeTierTab, setActiveTierTab] = useState<'ALL' | 'TIER_1_CONTINUOUS' | 'TIER_2_SELF_EXAM' | 'TIER_3_EMERGENCY'>('ALL');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [isUltrasoundSimOpen, setIsUltrasoundSimOpen] = useState<boolean>(false);
  const [ultrasoundTarget, setUltrasoundTarget] = useState<'JUGULAR' | 'OPTIC_NERVE' | 'CARDIAC'>('OPTIC_NERVE');
  const [probeAngle, setProbeAngle] = useState<number>(0);
  const [probeAligned, setProbeAligned] = useState<boolean>(true);
  const [flightSurgeonCue, setFlightSurgeonCue] = useState<string>(
    'Flight Surgeon (Houston): "Probe alignment optimal. Optic nerve sheath diameter locked: 5.4 mm (Nominal)."'
  );

  const [generatedReport, setGeneratedReport] = useState<{
    id: string;
    timestamp: string;
    astronautName: string;
    heartRate: number;
    spo2: number;
    bodyTemp: number;
    systolicBP: number;
    diastolicBP: number;
    hrv: number;
    radiationMicroSv: number;
    cardiacOutputLpm: number;
    otolithScore: number;
    cgmGlucoseMgDl: number;
    onsdMm: number;
    hydrationStatus: 'Optimal' | 'Mild Hypovolemia' | 'Requires Electrolytes';
    summary: string;
    recommendations: string[];
    riskLevel: 'NOMINAL' | 'WARNING' | 'DANGER';
  } | null>(null);

  const [activeFrame, setActiveFrame] = useState<TelemetryFrame>(telemetryStreamEngine.getCurrentFrame());

  useEffect(() => {
    return telemetryStreamEngine.subscribe((frame) => {
      setActiveFrame(frame);
    });
  }, []);

  const devices: SpaceMedicalDevice[] = [
    // TIER 1: CONTINUOUS BIOMETRICS & LIFE SUPPORT
    {
      id: 'astra-smart-vest',
      name: 'Bio-Monitor Smart Vest & Actiwatch (NASA/CSA)',
      category: 'TIER_1_CONTINUOUS',
      type: 'WEARABLE_PATCH',
      connectionStatus: 'CONNECTED',
      batteryPercent: 94,
      lastReadingTime: 'Live (1s)',
      measuredParameters: ['Continuous 3-Lead ECG', 'Respiration Rate', 'Skin Temperature', 'Circadian Lux Exposure'],
      accuracy: '±0.5% Clinical Class II',
      agencyProvenance: 'NASA / CSA',
    },
    {
      id: 'gaganyaan-vest',
      name: 'ISRO Gaganyaan IVA Biometric Garment (IAM Bengaluru)',
      category: 'TIER_1_CONTINUOUS',
      type: 'WEARABLE_PATCH',
      connectionStatus: 'CONNECTED',
      batteryPercent: 96,
      lastReadingTime: 'Live (IDRSS Downlink)',
      measuredParameters: ['Inner-Suit ECG & SpO2', 'Respiration Volumetrics', 'ISTRAC Telemetry Multiplex', 'Body Core Temp'],
      accuracy: 'IAF Aerospace Medicine Certified',
      agencyProvenance: 'ISRO / IAM',
    },
    {
      id: 'oura-edge-ring',
      name: 'Oura Ring & Edge-Computing Readiness Module (Ax-4)',
      category: 'TIER_1_CONTINUOUS',
      type: 'WEARABLE_PATCH',
      connectionStatus: 'CONNECTED',
      batteryPercent: 91,
      lastReadingTime: 'Live (Bluetooth LE)',
      measuredParameters: ['HRV RMSSD Nocturnal', 'Resting Heart Rate', 'Skin Temp Stability', 'Local 0-100 Readiness'],
      accuracy: 'Booz Allen Edge AI Architecture',
      agencyProvenance: 'Axiom / Booz Allen',
    },
    {
      id: 'silicon-dosimeter',
      name: 'CPDS Active Radiation Silicon Dosimeter',
      category: 'TIER_1_CONTINUOUS',
      type: 'DOSIMETER',
      connectionStatus: 'CONNECTED',
      batteryPercent: 99,
      lastReadingTime: 'Live (Ka-Band)',
      measuredParameters: ['GCR Heavy Ion Flux', 'SPE Proton Dose Rate', 'Microdosimetry Equivalent'],
      accuracy: '±0.01 μSv/h Microdosimetric',
      agencyProvenance: 'NASA / CSA',
    },

    // TIER 2: SCHEDULED SELF-EXAMS & DIAGNOSTICS (CHeCS)
    {
      id: 'tele-ultrasound',
      name: 'Butterfly iQ+ Tele-Guided Point-of-Care Ultrasound',
      category: 'TIER_2_SELF_EXAM',
      type: 'ULTRASOUND',
      connectionStatus: 'CONNECTED',
      batteryPercent: 88,
      lastReadingTime: '12 min ago',
      measuredParameters: ['Optic Nerve Sheath (SANS)', 'Internal Jugular Fluid Shift', 'Cardiac Stroke Volume'],
      accuracy: 'High-Res Transducer (1-15 MHz) + AR Alignment',
      agencyProvenance: 'NASA / CSA',
    },
    {
      id: 'oct-tonometer',
      name: 'Tabletop OCT Retinal Scanner & Cornea Tonometer',
      category: 'TIER_2_SELF_EXAM',
      type: 'OPTICAL',
      connectionStatus: 'CONNECTED',
      batteryPercent: 85,
      lastReadingTime: 'Yesterday 18:00 UTC',
      measuredParameters: ['Sub-mm Retinal Nerve Fiber Layer', 'Optic Disc Edema (Papilledema)', 'Intraocular Pressure (IOP)'],
      accuracy: 'Optical Coherence Interferometry',
      agencyProvenance: 'NASA / CSA',
    },
    {
      id: 'istat-analyzer',
      name: 'i-STAT 1 Portable Blood Gas & Biomarker Cartridge',
      category: 'TIER_2_SELF_EXAM',
      type: 'BLOOD_ANALYZER',
      connectionStatus: 'CONNECTED',
      batteryPercent: 82,
      lastReadingTime: 'Today 06:30 UTC',
      measuredParameters: ['Cardiac Troponin-I', 'Continuous Glucose (CGM)', 'Electrolytes (Na/K/Cl)', 'Blood Lactate & pH'],
      accuracy: '2-Drop Microfluidic POC Certified',
      agencyProvenance: 'NASA / CSA',
    },
    {
      id: 'slammd-mass',
      name: 'Space Linear Acceleration Mass Measurement (SLAMMD)',
      category: 'TIER_2_SELF_EXAM',
      type: 'MASS_DEVICE',
      connectionStatus: 'CONNECTED',
      batteryPercent: 97,
      lastReadingTime: 'Sol 140 Check',
      measuredParameters: ['Spring Oscillatory Body Mass', 'Fluid Redistribution Shift', 'Lean Muscle Mass Retention'],
      accuracy: "Newton's Second Law F=ma (±0.1 kg)",
      agencyProvenance: 'NASA / CSA',
    },

    // TIER 3: EMERGENCY HARDWARE & GROUND SUPPORT
    {
      id: 'checs-emergency-kit',
      name: 'CHeCS Space Medical Kit & Restraint Table System',
      category: 'TIER_3_EMERGENCY',
      type: 'EMERGENCY_KIT',
      connectionStatus: 'CONNECTED',
      batteryPercent: 100,
      lastReadingTime: 'Standby / Verified',
      measuredParameters: ['Pressurized Zero-g IV Sleeves', 'Spark-Safe Mini-Ventilator', 'Promethazine SMS Auto-Injectors', 'Defibrillator Heart Pacing'],
      accuracy: 'Level-5 Emergency Space Trauma Kit',
      agencyProvenance: 'NASA / CSA',
    },
  ];

  // Filtered devices based on tier tab
  const filteredDevices =
    activeTierTab === 'ALL'
      ? devices
      : devices.filter((d) => d.category === activeTierTab);

  // Initiate automated hardware scan and report synthesis
  const handleRunFullHardwareScan = () => {
    setIsScanning(true);
    setScanProgress(5);
    setGeneratedReport(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval);
          finishScan();
          return 100;
        }
        return prev + 15;
      });
    }, 280);
  };

  const finishScan = () => {
    setIsScanning(false);

    // Harvest latest real-time frame values
    const hr = activeFrame.heartRate || 68;
    const spo2 = activeFrame.spo2 || 98.4;
    const temp = activeFrame.bodyTemperature || 36.6;
    const sys = activeFrame.systolicBP || 116;
    const dia = activeFrame.diastolicBP || 74;
    const hrv = activeFrame.hrv || 62;
    const vest = activeFrame.vestibularConflictScore || 1.4;

    let risk: 'NOMINAL' | 'WARNING' | 'DANGER' = 'NOMINAL';
    if (activeFrame.severity === 'CRITICAL' || hr > 120 || spo2 < 90) {
      risk = 'DANGER';
    } else if (activeFrame.severity === 'WARNING' || hr > 95 || spo2 < 95) {
      risk = 'WARNING';
    }

    const report = {
      id: `NASA-BIO-${Date.now().toString(36).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      astronautName: astronaut.name,
      heartRate: hr,
      spo2: spo2,
      bodyTemp: temp,
      systolicBP: sys,
      diastolicBP: dia,
      hrv: hrv,
      radiationMicroSv: Math.round((astronaut.radiationCumulativeMSv || 78.4) * 1000),
      cardiacOutputLpm: Number((hr * 0.075).toFixed(1)),
      otolithScore: vest,
      cgmGlucoseMgDl: 94,
      onsdMm: 5.4,
      hydrationStatus: (sys < 105 ? 'Mild Hypovolemia' : 'Optimal') as 'Optimal' | 'Mild Hypovolemia' | 'Requires Electrolytes',
      summary:
        risk === 'DANGER'
          ? 'Emergency triage alert: Critical cardiorespiratory excursion or cabin pressure anomaly detected. Deploy CHeCS Medical Restraint Table and initiate tele-guided ultrasound.'
          : risk === 'WARNING'
          ? 'Moderate cephalad fluid shift and elevated heart rate observed. Optical Coherence Tomography (OCT) reveals mild optic sheath engorgement (5.4 mm ONSD). Recommend 30-min LBNP session.'
          : 'All Tier-1 continuous wearables, tele-guided ultrasound, and i-STAT biomarkers demonstrate nominal adaptation. Microgravity cardiac output and blood glucose stability are optimal.',
      recommendations: [
        'Complete scheduled 2.5h ARED resistive exercise session at 14:00 UTC.',
        'Perform tele-guided ultrasound verification of internal jugular vein cross-section.',
        'Maintain 460nm blue phototherapy during working shift to suppress melatonin.',
        'Review CHeCS emergency auto-injector status with Crew Medical Officer (CMO).',
      ],
      riskLevel: risk,
    };

    setGeneratedReport(report);

    // Synchronize to global telemetry state
    onLogMeasurement({
      heartRate: report.heartRate,
      spo2: report.spo2,
      bodyTemperature: report.bodyTemp,
      bloodPressure: { systolic: report.systolicBP, diastolic: report.diastolicBP },
      hrv: report.hrv,
    });

    missionAuditTrailService.logEvent({
      eventType: 'AI_DIAGNOSTIC_GENERATED',
      severity: risk === 'DANGER' ? 'CRITICAL' : risk === 'WARNING' ? 'WARNING' : 'NOMINAL',
      metTimestamp: `MET +${astronaut.missionDay}d 08:30:00`,
      title: `Hardware Diagnostic Report Generated: ${report.id}`,
      description: `Synchronized Bio-Monitor, ISRO IVA Garment, Ultrasound, and i-STAT POC measurements for ${astronaut.name}.`,
      actor: 'Space Medical Hardware Suite',
    });

    if (risk === 'DANGER') {
      voiceAlertService.speakCriticalAlert('Hardware Diagnostic Warning', 'Critical physiological deviation detected.');
    } else {
      voiceAlertService.speakWarningAlert('Hardware Diagnostic Complete', 'Astronaut telemetry report generated.');
    }
  };

  const selectedDev = devices.find((d) => d.id === selectedDevice) || devices[0];

  // Tele-guided ultrasound probe angle adjustments
  const adjustAngle = (delta: number) => {
    const next = probeAngle + delta;
    setProbeAngle(next);
    if (Math.abs(next) <= 2) {
      setProbeAligned(true);
      setFlightSurgeonCue(
        `Flight Surgeon (Houston): "Alignment locked on ${
          ultrasoundTarget === 'OPTIC_NERVE' ? 'Optic Nerve Sheath (5.4 mm - Nominal)' : 'Internal Jugular Vein (Distension Normal)'
        }. Hold position."`
      );
    } else {
      setProbeAligned(false);
      setFlightSurgeonCue(
        `Flight Surgeon (Houston): "Tilt probe ${next > 0 ? 'left' : 'right'} by ${Math.abs(next)}° to center acoustic beam."`
      );
    }
  };

  return (
    <div className={`rounded-3xl bg-[#091124] border border-blue-500/30 p-5 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.6)] space-y-6 ${className}`}>
      
      {/* SECTION HEADER: HARDWARE INTEGRATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase font-bold tracking-wider">
            <Watch className="w-4 h-4 text-blue-400" />
            <span>Three-Tier Spaceflight Medical Architecture</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400">NASA · ISRO · Axiom-4</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight flex flex-wrap items-center gap-2.5">
            Spaceflight Medical Hardware & Diagnostic Suite
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
              {devices.length} HARDWARE SYSTEMS ACTIVE
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl font-mono">
            Combines continuous wearable tracking (Bio-Monitor / ISRO Garment / Oura Ring), scheduled self-exams (tele-guided ultrasound & OCT), and ground support with autonomous CMO protocols.
          </p>
        </div>

        {/* Scan Trigger Button + Tele-Ultrasound Simulator Button */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setIsUltrasoundSimOpen(!isUltrasoundSimOpen)}
            className="px-4 py-3 rounded-2xl bg-[#0F1B34] hover:bg-[#16274B] border border-cyan-500/50 text-cyan-300 font-mono text-xs sm:text-sm font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            title="Launch Tele-Guided Ultrasound & SANS Simulator"
          >
            <Video className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Tele-Guided Ultrasound & SANS</span>
          </button>

          <button
            onClick={handleRunFullHardwareScan}
            disabled={isScanning}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 hover:brightness-110 text-white font-mono text-xs sm:text-sm font-extrabold transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 active:scale-95"
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>Scanning Sensors ({scanProgress}%)...</span>
              </>
            ) : (
              <>
                <Stethoscope className="w-4 h-4 text-white" />
                <span>Execute Diagnostic Scan</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3-TIER SYSTEM SELECTOR TABS */}
      <div className="flex flex-wrap items-center gap-2 bg-[#050C1B] p-1.5 rounded-2xl border border-slate-800 text-xs font-mono">
        <button
          onClick={() => setActiveTierTab('ALL')}
          className={`py-2 px-3 rounded-xl transition-all font-bold cursor-pointer ${
            activeTierTab === 'ALL'
              ? 'bg-blue-950 text-blue-200 border border-blue-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Diagnostic Tools ({devices.length})
        </button>
        <button
          onClick={() => setActiveTierTab('TIER_1_CONTINUOUS')}
          className={`py-2 px-3 rounded-xl transition-all font-bold cursor-pointer ${
            activeTierTab === 'TIER_1_CONTINUOUS'
              ? 'bg-blue-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tier 1: Continuous Wearables & Life-Support
        </button>
        <button
          onClick={() => setActiveTierTab('TIER_2_SELF_EXAM')}
          className={`py-2 px-3 rounded-xl transition-all font-bold cursor-pointer ${
            activeTierTab === 'TIER_2_SELF_EXAM'
              ? 'bg-blue-950 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tier 2: Scheduled Self-Exams (Ultrasound/OCT/i-STAT)
        </button>
        <button
          onClick={() => setActiveTierTab('TIER_3_EMERGENCY')}
          className={`py-2 px-3 rounded-xl transition-all font-bold cursor-pointer ${
            activeTierTab === 'TIER_3_EMERGENCY'
              ? 'bg-blue-950 text-amber-300 border border-amber-500/40 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tier 3: Emergency Kit & Ground Support
        </button>
      </div>

      {/* TELE-GUIDED ULTRASOUND & SANS SIMULATOR (EXPANDABLE) */}
      {isUltrasoundSimOpen && (
        <div className="rounded-2xl bg-[#040916] border border-cyan-500/40 p-5 space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Crosshair className="w-5 h-5 text-cyan-400 animate-spin" />
              <div>
                <h4 className="text-sm sm:text-base font-bold text-white">
                  Tele-Guided Ultrasound & SANS Optic Sheath Scanner
                </h4>
                <div className="text-[11px] font-mono text-cyan-300">
                  Simulating remote flight surgeon visual guidance & AR directional cues (Houston Mission Control)
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(['OPTIC_NERVE', 'JUGULAR', 'CARDIAC'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setUltrasoundTarget(t)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    ultrasoundTarget === t
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-400'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {t === 'OPTIC_NERVE' ? 'SANS Optic Nerve' : t === 'JUGULAR' ? 'Jugular Vein' : 'Cardiac Echo'}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Ultrasound Viewport & Flight Surgeon Audio/Text Guidance */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
            
            {/* Left: Ultrasound Screen with Acoustic Beam & AR Crosshairs */}
            <div className="lg:col-span-7 rounded-xl bg-[#02050E] border border-slate-800 p-4 relative min-h-[220px] flex flex-col items-center justify-center overflow-hidden">
              <div className="absolute top-2 left-3 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE FEED · MCC-HOUSTON FLIGHT SURGEON CONSOLE</span>
              </div>

              {/* Ultrasound Acoustic Sector representation */}
              <div className="relative w-48 h-36 border-b-2 border-cyan-500/50 rounded-b-full flex items-center justify-center bg-gradient-to-b from-cyan-950/10 via-blue-950/20 to-cyan-900/30">
                {/* Acoustic scan lines */}
                <div
                  className="w-28 h-20 rounded-full border border-dashed border-cyan-400/60 flex items-center justify-center transition-transform duration-300"
                  style={{ transform: `rotate(${probeAngle * 3}deg)` }}
                >
                  <div className={`w-12 h-12 rounded-full ${probeAligned ? 'bg-emerald-500/30 border-2 border-emerald-400' : 'bg-amber-500/30 border-2 border-amber-400'} flex items-center justify-center text-[10px] font-mono font-bold text-white`}>
                    {probeAligned ? 'LOCKED' : 'ALIGN'}
                  </div>
                </div>

                {/* AR Crosshair */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-0.5 bg-cyan-400/40" />
                  <div className="h-32 w-0.5 bg-cyan-400/40 absolute" />
                </div>
              </div>

              <div className="text-[11px] font-mono text-slate-300 mt-2">
                Probe Angle Offset: <strong className={probeAligned ? 'text-emerald-400' : 'text-amber-400'}>{probeAngle}°</strong> {probeAligned ? '(Perfect Acoustic Alignment)' : '(Re-orient)'}
              </div>
            </div>

            {/* Right: Remote Flight Surgeon Guidance & Controls */}
            <div className="lg:col-span-5 space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-200">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
                  <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
                  <span>Real-Time Flight Surgeon Voice/Text Loop:</span>
                </div>
                <p className="leading-relaxed text-white text-[11px]">{flightSurgeonCue}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                <span className="text-slate-400 block text-[11px]">Manual Probe Angle Fine-Tuning:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => adjustAngle(-2)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                  >
                    ◀ Tilt Left 2°
                  </button>
                  <button
                    onClick={() => {
                      setProbeAngle(0);
                      setProbeAligned(true);
                      setFlightSurgeonCue('Flight Surgeon: "Acoustic center lock established. 5.4 mm ONSD recorded."');
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 font-bold border border-cyan-500/40 cursor-pointer"
                  >
                    Auto-Lock
                  </button>
                  <button
                    onClick={() => adjustAngle(2)}
                    className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                  >
                    Tilt Right 2° ▶
                  </button>
                </div>
              </div>

              <div className="text-[10px] text-slate-400">
                *Captures sub-millimeter retrobulbar optic nerve sheath diameter (ONSD) to detect intracranial hypertension from microgravity cephalad fluid redistribution.
              </div>
            </div>

          </div>
        </div>
      )}

      {/* HARDWARE DEVICE SELECTOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {filteredDevices.map((device) => {
          const isSelected = selectedDevice === device.id;
          return (
            <div
              key={device.id}
              onClick={() => setSelectedDevice(device.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#101F42] border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.25)] ring-1 ring-blue-400/50'
                  : 'bg-[#060D1E] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{device.connectionStatus}</span>
                  </span>
                  <span className="text-slate-400 font-mono">⚡ {device.batteryPercent}%</span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-2">{device.name}</h4>
                <div className="mt-2 space-y-1 text-[11px] font-mono text-slate-300">
                  <div className="text-slate-400">Stream: <span className="text-cyan-300">{device.lastReadingTime}</span></div>
                  <div className="text-slate-400 truncate">Agency: <span className="text-emerald-300">{device.agencyProvenance}</span></div>
                  <div className="text-slate-400 truncate">Spec: <span className="text-slate-200">{device.accuracy}</span></div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-blue-300 font-semibold">{isSelected ? 'Active System' : 'Click to View'}</span>
                <span className="text-[10px] text-slate-400 uppercase">
                  {device.category.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SELECTED SENSOR CAPABILITIES DETAIL BAR */}
      <div className="p-4 rounded-2xl bg-[#060D1E] border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-slate-300">
            Active Channel: <strong className="text-white">{selectedDev.name}</strong>
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-400">Tracked Vitals:</span>
          {selectedDev.measuredParameters.map((p, idx) => (
            <span
              key={idx}
              className="px-2.5 py-0.5 rounded-lg bg-blue-950/70 border border-blue-500/30 text-blue-200 text-[11px]"
            >
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* REAL-TIME GENERATED HEALTH REPORT (AFTER HARDWARE MEASURES) */}
      {generatedReport ? (
        <div
          className={`p-5 sm:p-7 rounded-3xl border transition-all space-y-5 animate-fade-in ${
            generatedReport.riskLevel === 'DANGER'
              ? 'bg-rose-950/30 border-rose-500/60 shadow-[0_0_35px_rgba(244,63,94,0.3)]'
              : generatedReport.riskLevel === 'WARNING'
              ? 'bg-amber-950/30 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
              : 'bg-emerald-950/25 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.25)]'
          }`}
        >
          {/* REPORT HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl font-bold ${
                  generatedReport.riskLevel === 'DANGER'
                    ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                    : generatedReport.riskLevel === 'WARNING'
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                    : 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                }`}
              >
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg sm:text-xl font-black text-white">
                    Astronaut Comprehensive Multi-Tier Health Report
                  </h4>
                  <span
                    className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full uppercase border ${
                      generatedReport.riskLevel === 'DANGER'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500'
                        : generatedReport.riskLevel === 'WARNING'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500'
                    }`}
                  >
                    {generatedReport.riskLevel} STATUS
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-mono mt-0.5">
                  Report ID: <span className="text-white font-bold">{generatedReport.id}</span> · Subject:{' '}
                  <span className="text-cyan-300 font-bold">{generatedReport.astronautName}</span> · Sol{' '}
                  {astronaut.missionDay}
                </div>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-400">
              <div>Synced: {new Date(generatedReport.timestamp).toLocaleTimeString()} UTC</div>
              <div className="text-emerald-400 font-bold">✓ Committed to Biotelemetry Store & DSN Link</div>
            </div>
          </div>

          {/* COLOR-CODED VITAL METRICS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Heart Rate */}
            <div className="p-3.5 rounded-2xl bg-[#070D1C] border border-blue-500/30">
              <span className="text-[10px] font-mono text-slate-400 block">HEART RATE</span>
              <div className="text-2xl font-black text-white mt-1 tabular-nums flex items-baseline gap-1">
                <span>{generatedReport.heartRate}</span>
                <span className="text-xs text-slate-400 font-normal">BPM</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 mt-1 block">Baseline: 58</span>
            </div>

            {/* SpO2 */}
            <div className="p-3.5 rounded-2xl bg-[#070D1C] border border-emerald-500/30">
              <span className="text-[10px] font-mono text-slate-400 block">ARTERIAL SpO2</span>
              <div className="text-2xl font-black text-emerald-400 mt-1 tabular-nums flex items-baseline gap-1">
                <span>{generatedReport.spo2}</span>
                <span className="text-xs text-slate-400 font-normal">%</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 mt-1 block">Optimal &gt;97%</span>
            </div>

            {/* Blood Pressure */}
            <div className="p-3.5 rounded-2xl bg-[#070D1C] border border-blue-500/30">
              <span className="text-[10px] font-mono text-slate-400 block">BLOOD PRESSURE</span>
              <div className="text-xl font-black text-white mt-1 tabular-nums">
                {generatedReport.systolicBP}/{generatedReport.diastolicBP}
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-1 block">mmHg (MAP 88)</span>
            </div>

            {/* Core Body Temperature */}
            <div className="p-3.5 rounded-2xl bg-[#070D1C] border border-purple-500/30">
              <span className="text-[10px] font-mono text-slate-400 block">CORE BODY TEMP</span>
              <div className="text-2xl font-black text-purple-300 mt-1 tabular-nums flex items-baseline gap-1">
                <span>{generatedReport.bodyTemp}</span>
                <span className="text-xs text-slate-400 font-normal">°C</span>
              </div>
              <span className="text-[10px] font-mono text-purple-400 mt-1 block">Circadian Drift: OK</span>
            </div>

            {/* Blood Glucose CGM */}
            <div className="p-3.5 rounded-2xl bg-[#070D1C] border border-teal-500/30">
              <span className="text-[10px] font-mono text-slate-400 block">CGM GLUCOSE</span>
              <div className="text-2xl font-black text-teal-300 mt-1 tabular-nums flex items-baseline gap-1">
                <span>{generatedReport.cgmGlucoseMgDl}</span>
                <span className="text-xs text-slate-400 font-normal">mg/dL</span>
              </div>
              <span className="text-[10px] font-mono text-teal-400 mt-1 block">Suite Ride Study</span>
            </div>

            {/* SANS Optic Nerve Sheath */}
            <div className="p-3.5 rounded-2xl bg-[#070D1C] border border-cyan-500/30">
              <span className="text-[10px] font-mono text-slate-400 block">SANS ONSD</span>
              <div className="text-2xl font-black text-cyan-300 mt-1 tabular-nums flex items-baseline gap-1">
                <span>{generatedReport.onsdMm}</span>
                <span className="text-xs text-slate-400 font-normal">mm</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 mt-1 block">Threshold &lt;5.8 mm</span>
            </div>
          </div>

          {/* CLINICAL SUMMARY & HEALTH SUGGESTIONS (COLOR CODED) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Clinical Findings */}
            <div className="p-4 rounded-2xl bg-[#070D1C] border border-slate-700/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 font-bold uppercase">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Space Clinical Findings & Etiology</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {generatedReport.summary}
              </p>
            </div>

            {/* Actionable Health Suggestions (Green color-coded) */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 font-bold uppercase">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Actionable Health Suggestions & Countermeasures</span>
              </div>
              <ul className="space-y-1.5 text-xs text-emerald-100 font-sans">
                {generatedReport.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Empty State Prompt before scanning */
        <div className="p-6 rounded-2xl bg-[#060D1E] border border-dashed border-slate-800 text-center space-y-2">
          <Stethoscope className="w-8 h-8 text-blue-400 mx-auto opacity-70" />
          <h4 className="text-base font-bold text-white">Multi-Tier Hardware Diagnostic Ready</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click <strong>"Execute Diagnostic Scan"</strong> or launch the <strong>"Tele-Guided Ultrasound & SANS"</strong> module above to poll all paired spaceflight diagnostic sensors.
          </p>
        </div>
      )}
    </div>
  );
};
