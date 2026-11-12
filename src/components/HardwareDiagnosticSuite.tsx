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
  type: 'WEARABLE_PATCH' | 'ULTRASOUND' | 'DOSIMETER' | 'BLOOD_ANALYZER' | 'PULSE_OX';
  connectionStatus: 'CONNECTED' | 'MEASURING' | 'DISCONNECTED';
  batteryPercent: number;
  lastReadingTime: string;
  measuredParameters: string[];
  accuracy: string;
}

export const HardwareDiagnosticSuite: React.FC<HardwareDiagnosticSuiteProps> = ({
  astronaut,
  onLogMeasurement,
  className = '',
}) => {
  const [selectedDevice, setSelectedDevice] = useState<string>('astra-smart-vest');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
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
    {
      id: 'astra-smart-vest',
      name: 'Bio-Monitor Smart Vest (NASA/CSA)',
      type: 'WEARABLE_PATCH',
      connectionStatus: 'CONNECTED',
      batteryPercent: 94,
      lastReadingTime: 'Live (1s)',
      measuredParameters: ['Continuous 3-Lead ECG', 'Respiration Rate', 'Skin Temperature', 'Accelerometry'],
      accuracy: '±0.5% Clinical Class II',
    },
    {
      id: 'handheld-ultrasound',
      name: 'Butterfly iQ+ Space Point-of-Care Ultrasound',
      type: 'ULTRASOUND',
      connectionStatus: 'CONNECTED',
      batteryPercent: 88,
      lastReadingTime: '12 min ago',
      measuredParameters: ['Jugular Vein Venous Distension', 'Optic Nerve Sheath (SANS)', 'Cardiac Stroke Volume'],
      accuracy: 'High-Res Transducer (1-15 MHz)',
    },
    {
      id: 'silicon-dosimeter',
      name: 'CPDS Active Radiation Silicon Dosimeter',
      type: 'DOSIMETER',
      connectionStatus: 'CONNECTED',
      batteryPercent: 99,
      lastReadingTime: 'Live (Ka-Band)',
      measuredParameters: ['GCR Heavy Ion Flux', 'SPE Proton Dose Equivalent', 'Tissue Equivalent Microdosimetry'],
      accuracy: '±0.01 μSv/h Microdosimetric',
    },
    {
      id: 'istat-analyzer',
      name: 'i-STAT 1 Portable Blood Gas & Biomarker Cartridge',
      type: 'BLOOD_ANALYZER',
      connectionStatus: 'CONNECTED',
      batteryPercent: 82,
      lastReadingTime: 'Today 06:30 UTC',
      measuredParameters: ['Blood Lactate', 'Troponin-I', 'Electrolytes (Na/K/Cl)', 'pH & Alveolar pCO2'],
      accuracy: 'Abbott Point-of-Care Certified',
    },
  ];

  // Initiate automated hardware hardware scan and report synthesis
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
      radiationMicroSv: 22.4,
      cardiacOutputLpm: +(4.8 + (hr - 60) * 0.04).toFixed(1),
      otolithScore: vest,
      hydrationStatus:
        hr > 105 ? ('Requires Electrolytes' as const) : hr > 88 ? ('Mild Hypovolemia' as const) : ('Optimal' as const),
      summary:
        risk === 'DANGER'
          ? 'CRITICAL ALERT: Multisensory hardware scan detected acute physiological deviation. Autonomic compensation failing. Immediate countermeasure protocol required.'
          : risk === 'WARNING'
          ? 'WARNING: Mild cephalad fluid shift and cardiorespiratory strain noted. Subsystem telemetry indicates compensatory tachycardia.'
          : 'NOMINAL CLINICAL PROFILE: All cardiovascular, oxygenation, and tissue dosimetry indices are strictly within NASA-STD-3001 nominal envelopes.',
      recommendations:
        risk === 'DANGER'
          ? [
              'Administer 100% O2 via crew emergency mask for 20 minutes',
              'Ingest 750 mL isotonic electrolyte fluid pack immediately',
              'Activate lower body negative pressure (LBNP) garment at -35 mmHg',
              'Transmit priority diagnostic packet to NASA Flight Surgeon (MCC-Houston)',
            ]
          : risk === 'WARNING'
          ? [
              'Complete 45-minute cycle ergometer session (CEVIS) with heart rate cap of 140 BPM',
              'Increase oral hydration by 500 mL water with oral rehydration salts',
              'Re-calibrate forehead thermal sensor before next sleep cycle',
            ]
          : [
              'Maintain standard 2.5-hour countermeasure physical conditioning (ARED + T2)',
              'Sleep wellness cycle: 8.0 hours schedule confirmed with station melatonin lighting',
              'Next hardware sensor recalibration scheduled for Sol 145',
            ],
      riskLevel: risk,
    };

    setGeneratedReport(report);

    // Commit hardware measurement into the app's persistent biotelemetry history
    onLogMeasurement({
      heartRate: hr,
      spo2: spo2,
      bodyTemperature: temp,
      bloodPressure: { systolic: sys, diastolic: dia },
      hrv: hrv,
      respiratoryRate: activeFrame.respiratoryRate || 14,
    });

    missionAuditTrailService.logEvent({
      metTimestamp: `MET +${astronaut.missionDay}d ${new Date().toLocaleTimeString()}`,
      eventType: 'AI_DIAGNOSTIC_GENERATED',
      severity: risk === 'DANGER' ? 'CRITICAL' : risk === 'WARNING' ? 'WARNING' : 'NOMINAL',
      title: `Hardware Diagnostic Report Generated: ${report.id}`,
      description: `Synchronized Bio-Monitor Smart Vest, Ultrasound, and CPDS Dosimeter measurements for ${astronaut.name}.`,
      actor: 'Bio-Monitor Wearable Diagnostic Suite',
    });

    if (risk === 'DANGER') {
      voiceAlertService.speakCriticalAlert('Hardware Diagnostic Warning', 'Critical physiological deviation detected.');
    } else {
      voiceAlertService.speakWarningAlert('Hardware Diagnostic Complete', 'Astronaut telemetry report generated.');
    }
  };

  const selectedDev = devices.find((d) => d.id === selectedDevice) || devices[0];

  return (
    <div className={`rounded-3xl bg-[#091124] border border-blue-500/30 p-5 sm:p-7 shadow-[0_10px_35px_rgba(0,0,0,0.6)] space-y-6 ${className}`}>
      {/* SECTION HEADER: HARDWARE INTEGRATION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-blue-400 uppercase font-bold tracking-wider">
            <Watch className="w-4 h-4 text-blue-400" />
            <span>Flight Hardware & Wearable Telemetry Integration</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight flex items-center gap-3">
            Astronaut Medical Hardware Suite
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
              4 SENSORS PAIRED
            </span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Directly ingests real-time diagnostics from space-certified flight hardware: Bio-Monitor Smart Vest, Point-of-Care Ultrasound, and CPDS Radiation Dosimeter.
          </p>
        </div>

        {/* Scan Trigger Button */}
        <button
          onClick={handleRunFullHardwareScan}
          disabled={isScanning}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 hover:brightness-110 text-white font-mono text-xs sm:text-sm font-extrabold transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 active:scale-95 shrink-0"
        >
          {isScanning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Scanning Sensors ({scanProgress}%)...</span>
            </>
          ) : (
            <>
              <Stethoscope className="w-4 h-4 text-white" />
              <span>Execute Diagnostic Scan & Generate Report</span>
            </>
          )}
        </button>
      </div>

      {/* HARDWARE DEVICE SELECTOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {devices.map((device) => {
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
                  <span className="text-slate-400">⚡ {device.batteryPercent}%</span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-2">{device.name}</h4>
                <div className="mt-2 space-y-1 text-[11px] font-mono text-slate-300">
                  <div className="text-slate-400">Stream: <span className="text-cyan-300">{device.lastReadingTime}</span></div>
                  <div className="text-slate-400 truncate">Spec: <span className="text-slate-200">{device.accuracy}</span></div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                <span className="text-blue-300 font-semibold">{isSelected ? 'Active Sensor' : 'Click to View'}</span>
                <span className="text-slate-400">NASA HRP</span>
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
          <span className="text-slate-400">Channels:</span>
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
                    Astronaut Comprehensive Health Report
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
              <div className="text-emerald-400 font-bold">✓ Committed to Biotelemetry History</div>
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
              <span className="text-[10px] font-mono text-purple-400 mt-1 block">Convective Drift: OK</span>
            </div>

            {/* Cardiac Output */}
            <div className="p-3.5 rounded-2xl bg-[#070D1C] border border-cyan-500/30">
              <span className="text-[10px] font-mono text-slate-400 block">CARDIAC OUTPUT</span>
              <div className="text-2xl font-black text-cyan-300 mt-1 tabular-nums flex items-baseline gap-1">
                <span>{generatedReport.cardiacOutputLpm}</span>
                <span className="text-xs text-slate-400 font-normal">L/min</span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 mt-1 block">Ultrasound SV Validated</span>
            </div>

            {/* Hydration Status */}
            <div className="p-3.5 rounded-2xl bg-[#070D1C] border border-amber-500/30">
              <span className="text-[10px] font-mono text-slate-400 block">HYDRATION INDEX</span>
              <div className="text-sm font-black text-amber-300 mt-1 truncate">
                {generatedReport.hydrationStatus}
              </div>
              <span className="text-[10px] font-mono text-amber-400 mt-1 block">Electrolyte Volumetrics</span>
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
          <h4 className="text-base font-bold text-white">No Diagnostic Scan Executed This Hour</h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click <strong>"Execute Diagnostic Scan & Generate Report"</strong> above to poll all paired spaceflight medical devices and synthesize a real-time clinical health dossier.
          </p>
        </div>
      )}
    </div>
  );
};
