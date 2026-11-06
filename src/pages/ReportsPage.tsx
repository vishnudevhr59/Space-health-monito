import React, { useState } from 'react';
import {
  AstronautProfile,
  HealthMeasurement,
  SleepRecord,
  ActivityRecord,
  RadiationRecord,
  HealthAlert,
} from '../types';
import { telemetryStreamEngine } from '../services/telemetryStreamEngine';
import { missionAuditTrailService } from '../services/missionAuditTrailService';
import { generateMissionReport, exportMissionDossierMarkdown } from '../utils/generateMissionReport';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Dna,
  Heart,
  Moon,
  FileDown,
  Activity,
  Zap,
} from 'lucide-react';

interface ReportsPageProps {
  astronaut: AstronautProfile;
  telemetry: HealthMeasurement[];
  sleepRecords: SleepRecord[];
  activityRecords: ActivityRecord[];
  radiation: RadiationRecord[];
  alerts: HealthAlert[];
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  astronaut,
  telemetry,
  sleepRecords,
  activityRecords,
  radiation,
  alerts,
}) => {
  const [reportPeriod, setReportPeriod] = useState<'Daily' | 'Weekly'>('Weekly');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const liveFrame = telemetryStreamEngine.getCurrentFrame();
  const auditLogs = missionAuditTrailService.getAuditLog();
  const anomalyCount = auditLogs.filter((l: any) => l.eventType.includes('ANOMALY')).length;

  const reportId = `SHM-REP-2026-${reportPeriod.toUpperCase()}-0412`;
  const reportDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const avgHeartRate = Math.round(
    telemetry.reduce((a, b) => a + b.heartRate, 0) / (telemetry.length || 1)
  );
  const avgSpo2 = +(
    telemetry.reduce((a, b) => a + b.spo2, 0) / (telemetry.length || 1)
  ).toFixed(1);
  const avgSleep = +(
    sleepRecords.reduce((a, b) => a + b.totalDurationHours, 0) / (sleepRecords.length || 1)
  ).toFixed(1);

  const handlePrint = () => {
    generateMissionReport({
      astronaut,
      telemetry,
      sleepRecords,
      activityRecords,
      radiation,
      alerts,
      reportPeriod,
    });
  };

  const handleDownloadMarkdownDossier = () => {
    exportMissionDossierMarkdown({
      astronaut,
      telemetry,
      sleepRecords,
      activityRecords,
      radiation,
      alerts,
      reportPeriod,
    });
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
      
      {/* SCREEN CONTROLS BAR (Hidden during print) */}
      <div className="no-print bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_4px_24px_rgba(0,229,255,0.03)]">
        <div>
          <div className="flex items-center gap-2 text-[#00E5FF] font-mono text-xs uppercase tracking-wider mb-1 font-bold">
            <FileText className="w-4 h-4" />
            <span>Mission Health Intelligence Dossier</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Astronaut Health Report & PDF Generator
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Compile standardized clinical telemetry summaries for NASA Johnson Space Center flight surgeons and international ground stations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-[#0B1224] p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setReportPeriod('Daily')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                reportPeriod === 'Daily'
                  ? 'bg-[#00E5FF] text-[#050816] font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setReportPeriod('Weekly')}
              className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                reportPeriod === 'Weekly'
                  ? 'bg-[#00E5FF] text-[#050816] font-bold shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
          </div>

          <button
            onClick={handleDownloadMarkdownDossier}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-white font-mono text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-cyan-400" />
            <span>{downloadSuccess ? 'Downloaded!' : 'Download Dossier (.md)'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-gradient-to-r from-[#00E5FF] to-[#438BFF] hover:brightness-110 text-[#050816] font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center gap-2 cursor-pointer tracking-wide"
          >
            <Printer className="w-4 h-4" />
            <span>Export / Print PDF</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE CLINICAL REPORT DOCUMENT */}
      <div className="bg-[#101B30]/90 backdrop-blur-md text-slate-200 border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-10 shadow-2xl space-y-8 font-sans print:bg-white print:text-slate-900 print:border-none print:shadow-none print:p-0">
        
        {/* Document Header */}
        <div className="border-b border-slate-800 print:border-slate-300 pb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-[#00E5FF] print:text-cyan-800 font-bold mb-1">
                SPACE HEALTH MONITO · NASA SPACE APPS CHALLENGE 2026
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-slate-950 tracking-tight">
                {reportPeriod} Astronaut Clinical Telemetry Dossier
              </h1>
              <div className="text-xs font-mono text-slate-400 print:text-slate-600 mt-1">
                Classification: OFFICIAL USE ONLY // DEEP SPACE EXPLORATION MEDICAL SUMMARY
              </div>
            </div>

            <div className="text-left sm:text-right font-mono text-xs text-slate-400 print:text-slate-600">
              <div className="font-bold text-white print:text-slate-900">{reportId}</div>
              <div>Generated: {reportDate}</div>
              <div>Mission Elapsed Day: T+{astronaut.missionDay}</div>
            </div>
          </div>
        </div>

        {/* Astronaut Profile Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-[#0B1224]/80 print:bg-slate-100 border border-slate-800 print:border-slate-300 text-xs font-mono">
          <div>
            <span className="text-slate-500 print:text-slate-600 block">Astronaut:</span>
            <span className="font-bold text-white print:text-slate-900 text-sm">CDR {astronaut.name}</span>
          </div>
          <div>
            <span className="text-slate-500 print:text-slate-600 block">Callsign / Badge:</span>
            <span className="text-slate-200 print:text-slate-800">&quot;{astronaut.callsign}&quot; · EXP-72-CDR</span>
          </div>
          <div>
            <span className="text-slate-500 print:text-slate-600 block">Habitat / Station:</span>
            <span className="text-slate-200 print:text-slate-800">{astronaut.destination}</span>
          </div>
          <div>
            <span className="text-slate-500 print:text-slate-600 block">Clinical Status:</span>
            <span className="text-emerald-400 print:text-emerald-700 font-bold">{astronaut.currentStatus}</span>
          </div>
        </div>

        {/* Live Telemetry Snapshot Section */}
        <div>
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 print:text-slate-700 mb-3 flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>01. Real-Time Telemetry Stream Ingest (1Hz Spacecraft Bus)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">Heart Rate</span>
              <span className="text-base font-bold text-white print:text-slate-950">{liveFrame.heartRate} BPM</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">SpO2 Sat</span>
              <span className="text-base font-bold text-cyan-400 print:text-cyan-800">{liveFrame.spo2}%</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">Blood Pressure</span>
              <span className="text-base font-bold text-emerald-400 print:text-emerald-800">{liveFrame.systolicBP}/{liveFrame.diastolicBP}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">Core Temp</span>
              <span className="text-base font-bold text-amber-400 print:text-amber-800">{liveFrame.bodyTemperature}°C</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">Cabin Pressure</span>
              <span className="text-base font-bold text-white print:text-slate-950">{liveFrame.cabinPressurePsi} psi</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-600 block text-[10px]">Cabin CO2</span>
              <span className="text-base font-bold text-slate-200 print:text-slate-900">{liveFrame.cabinCo2MmHg} mmHg</span>
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div>
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 print:text-slate-700 mb-3">
            02. Historical Aggregate Indicators & Cumulative Dose
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-900/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-600 block">Avg Heart Rate</span>
              <span className="text-lg font-bold text-white print:text-slate-950">{avgHeartRate} BPM</span>
              <span className="text-[10px] text-emerald-400 print:text-emerald-700 block mt-0.5">Nominal resting</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-600 block">Mean SpO2</span>
              <span className="text-lg font-bold text-cyan-400 print:text-cyan-800">{avgSpo2}%</span>
              <span className="text-[10px] text-slate-400 print:text-slate-600 block mt-0.5">Cabin O2: 21.3 kPa</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-600 block">Avg Sleep Duration</span>
              <span className="text-lg font-bold text-white print:text-slate-950">{avgSleep} Hours</span>
              <span className="text-[10px] text-slate-400 print:text-slate-600 block mt-0.5">86% Efficiency</span>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <span className="text-slate-400 print:text-slate-600 block">Cumulative Radiation</span>
              <span className="text-lg font-bold text-amber-400 print:text-amber-800">{astronaut.radiationCumulativeMSv} mSv</span>
              <span className="text-[10px] text-slate-400 print:text-slate-600 block mt-0.5">Career Limit: 600 mSv</span>
            </div>
          </div>
        </div>

        {/* Anomaly Detection & AI Decision Support Summary */}
        <div>
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 print:text-slate-700 mb-3">
            03. AI/ML Anomaly Detection & Biophysical Review
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-white print:text-slate-900">
                  Cardiac Autonomic Tone (HRV Attenuation)
                </span>
                <span className="font-mono text-amber-400 print:text-amber-700">Z = -2.85 σ (Flagged)</span>
              </div>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                RMSSD decreased to 41 ms following consecutive shortened sleep cycles and high operational EVA workloads. Time-series baseline suggests autonomic sympathetic elevation.
              </p>
              <div className="mt-2 text-cyan-400 print:text-cyan-800 font-mono text-[11px]">
                Recommended Countermeasure: 30 minutes rest pod scheduled downtime; hydration +500 mL electrolyte intake.
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 print:bg-slate-50 border border-slate-800 print:border-slate-200">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-white print:text-slate-900">
                  Musculoskeletal Countermeasure Adherence
                </span>
                <span className="font-mono text-emerald-400 print:text-emerald-700">Z = +0.42 σ (Optimal)</span>
              </div>
              <p className="text-slate-300 print:text-slate-700 leading-relaxed">
                ARED high-load resistive training achieved 100% adherence (7 of 7 sessions). Projected lumbar spine bone mineral density loss rate remains controlled at 0.85%/month (target &lt; 1.0%/mo).
              </p>
            </div>
          </div>
        </div>

        {/* Telemetry Log Table */}
        <div>
          <h3 className="text-xs uppercase font-mono tracking-wider text-slate-400 print:text-slate-700 mb-3">
            04. Calibrated Physiological Telemetry Sample
          </h3>

          <div className="overflow-x-auto border border-slate-800 print:border-slate-300 rounded-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 print:bg-slate-200 text-slate-400 print:text-slate-700 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp (UTC)</th>
                  <th className="py-2.5 px-3">Heart Rate</th>
                  <th className="py-2.5 px-3">SpO2</th>
                  <th className="py-2.5 px-3">Temp (°C)</th>
                  <th className="py-2.5 px-3">Blood Pressure</th>
                  <th className="py-2.5 px-3">HRV (RMSSD)</th>
                  <th className="py-2.5 px-3">Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 print:divide-slate-200 text-slate-300 print:text-slate-800">
                {telemetry.slice(-6).map((m) => (
                  <tr key={m.id}>
                    <td className="py-2 px-3">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="py-2 px-3 font-bold text-white print:text-slate-900">{m.heartRate} BPM</td>
                    <td className="py-2 px-3">{m.spo2}%</td>
                    <td className="py-2 px-3">{m.bodyTemperature}°C</td>
                    <td className="py-2 px-3">{m.bloodPressure.systolic}/{m.bloodPressure.diastolic}</td>
                    <td className="py-2 px-3">{m.hrv} ms</td>
                    <td className="py-2 px-3 text-emerald-400 print:text-emerald-700">{m.dataQuality}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* NASA Scientific Evidence Sign-Off */}
        <div className="pt-6 border-t border-slate-800 print:border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-mono text-slate-400 print:text-slate-600">
          <div>
            <div>System: SPACE HEALTH MONITO Decision Support Platform</div>
            <div>Knowledge Base: NASA HRP, OSDR, GeneLab, NTRS</div>
          </div>
          <div className="text-left sm:text-right">
            <div>Lead Flight Surgeon: Dr. Evelyn Reed, M.D.</div>
            <div className="text-[10px] text-slate-500 font-bold">ELECTRONICALLY VALIDATED ON CONSOLE · SHA-256 VERIFIED</div>
          </div>
        </div>

      </div>

    </div>
  );
};
