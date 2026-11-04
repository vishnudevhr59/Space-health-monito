import React, { useState } from 'react';
import {
  AstronautProfile,
  HealthMeasurement,
  SleepRecord,
  ActivityRecord,
  RadiationRecord,
  HealthAlert,
} from '../types';
import { MetricCard } from '../components/MetricCard';
import { LivePhysiologicalTrends } from '../components/LivePhysiologicalTrends';
import { DailyBriefing } from '../components/DailyBriefing';
import { ContextExplorer } from '../components/ContextExplorer';
import { MissionTimeline } from '../components/MissionTimeline';
import {
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Moon,
  Zap,
  Radio,
  Dna,
  Smile,
  RefreshCw,
  PlusCircle,
  AlertTriangle,
  Info,
  Bell,
  Compass,
  Wifi,
  Database,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface DashboardPageProps {
  astronaut: AstronautProfile;
  telemetry: HealthMeasurement[];
  sleepRecords: SleepRecord[];
  activityRecords: ActivityRecord[];
  radiation: RadiationRecord[];
  alerts: HealthAlert[];
  onRefreshTelemetry: () => void;
  onLogMeasurement: (m: Partial<HealthMeasurement>) => void;
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  astronaut,
  telemetry,
  sleepRecords,
  activityRecords,
  radiation,
  alerts,
  onRefreshTelemetry,
  onLogMeasurement,
  onNavigate,
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d'>('7d');
  const [activeModuleTab, setActiveModuleTab] = useState<'briefing' | 'trends' | 'context' | 'timeline'>('briefing');
  const [showLogModal, setShowLogModal] = useState(false);
  const [newHr, setNewHr] = useState(72);
  const [newSpo2, setNewSpo2] = useState(98.5);
  const [newTemp, setNewTemp] = useState(36.7);
  const [newSys, setNewSys] = useState(118);
  const [newDia, setNewDia] = useState(76);

  const latestVital = telemetry[telemetry.length - 1] || {
    heartRate: 64,
    spo2: 98.4,
    bodyTemperature: 36.6,
    bloodPressure: { systolic: 114, diastolic: 72 },
    hrv: 64,
    respiratoryRate: 14,
    perfusionIndex: 3.8,
    dataQuality: 'High',
    timestamp: new Date().toISOString(),
  };

  const latestSleep = sleepRecords[sleepRecords.length - 1] || {
    totalDurationHours: 6.8,
    efficiencyPercent: 86,
    qualityRating: 4,
  };

  const latestExercise = activityRecords[activityRecords.length - 1] || {
    exerciseType: 'ARED Resistive',
    durationMinutes: 65,
    completionRatePercent: 100,
  };

  // Prepare chart series
  const chartData = telemetry.slice(selectedTimeRange === '24h' ? -8 : -28).map((m) => {
    const d = new Date(m.timestamp);
    return {
      time: `${d.getUTCHours()}:00`,
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      heartRate: m.heartRate,
      spo2: m.spo2,
      hrv: m.hrv,
      temp: m.bodyTemperature,
    };
  });

  const handleCreateVital = (e: React.FormEvent) => {
    e.preventDefault();
    onLogMeasurement({
      heartRate: Number(newHr),
      spo2: Number(newSpo2),
      bodyTemperature: Number(newTemp),
      bloodPressure: { systolic: Number(newSys), diastolic: Number(newDia) },
      hrv: 62,
      respiratoryRate: 14,
    });
    setShowLogModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* SIMULATED DATA NOTICE STRIP */}
      <div className="p-3.5 rounded-2xl bg-[#0B1224]/90 border border-[#00E5FF]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-[#00E5FF] shrink-0" />
          <span className="text-slate-300">
            <strong className="text-[#00E5FF]">Simulated Astronaut Demonstration Data:</strong> Calibrated with NASA Human Research Program baseline datasets for deep space exploration.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#21D4A5] animate-pulse" />
            <span>DSN TELEMETRY: 100% NOMINAL</span>
          </span>
          <button
            onClick={onRefreshTelemetry}
            className="p-1.5 rounded-lg bg-[#101B30] hover:bg-[#101B30]/80 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Poll Telemetry"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* DASHBOARD HERO: PROMINENT MISSION OVERVIEW SECTION */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#101B30] via-[#0B1224] to-[#101B30] border border-[#00E5FF]/30 p-6 sm:p-8 shadow-[0_0_35px_-5px_rgba(0,229,255,0.12)] overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="flex items-start sm:items-center gap-5">
            {/* Astronaut Avatar / Callsign Insignia */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-[#050816] border-2 border-[#00E5FF]/60 flex items-center justify-center font-black text-2xl text-[#00E5FF] font-mono shadow-[0_0_20px_rgba(0,229,255,0.25)]">
                SC
              </div>
              <div className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-extrabold bg-[#050816] text-[#00E5FF] border border-[#00E5FF]">
                CDR
              </div>
            </div>

            {/* Mission & Astronaut Identifiers */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-[#00E5FF] mb-1">
                <span>Welcome back, Commander {astronaut.name.split(' ')[0]}</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">Callsign: &quot;{astronaut.callsign}&quot;</span>
                <span className="text-slate-600">·</span>
                <span className="text-slate-400">{astronaut.destination}</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {astronaut.mission}
                </h2>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-[#21D4A5]/15 text-[#21D4A5] border border-[#21D4A5]/40 font-bold">
                  ● {astronaut.currentStatus}
                </span>
              </div>

              {/* Mission Indicators Grid */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-3 text-xs text-slate-300 font-mono">
                <div>
                  <span className="text-slate-500">Mission Day:</span>{' '}
                  <strong className="text-[#00E5FF] text-sm">T+{astronaut.missionDay}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Duration in Space:</span>{' '}
                  <strong className="text-white">{astronaut.totalDaysInSpace} Days</strong>
                </div>
                <div>
                  <span className="text-slate-500">Last Sync:</span>{' '}
                  <strong className="text-slate-200">{new Date(latestVital.timestamp).toLocaleTimeString()} UTC</strong>
                </div>
                <div>
                  <span className="text-slate-500">Source:</span>{' '}
                  <strong className="text-[#21D4A5]">NASA Deep Space Network</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Mission Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification Center */}
            <button
              onClick={() => onNavigate('alerts')}
              className="relative p-3 rounded-xl bg-[#050816] border border-slate-700 hover:border-[#00E5FF]/50 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Active Threshold Notifications"
            >
              <Bell className="w-5 h-5 text-[#00E5FF]" />
              {alerts.filter(a => a.status === 'Active').length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF5368] text-white font-mono font-black text-[9px] flex items-center justify-center animate-bounce">
                  {alerts.filter(a => a.status === 'Active').length}
                </span>
              )}
            </button>

            <button
              onClick={() => setShowLogModal(true)}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#438BFF] text-[#050816] font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_-3px_rgba(0,229,255,0.4)] cursor-pointer hover:opacity-95"
            >
              <PlusCircle className="w-4 h-4 text-[#050816]" />
              <span>Log Telemetry</span>
            </button>

            <button
              onClick={() => onNavigate('reports')}
              className="px-4 py-3 rounded-xl bg-[#101B30] hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Generate Report
            </button>
          </div>

        </div>

      </div>

      {/* 8 REQUIRED SOPHISTICATED HEALTH METRIC CARDS */}
      <div>
        <div className="flex items-center justify-between mb-3 font-mono text-xs text-slate-400">
          <span className="uppercase tracking-wider font-semibold">
            Real-Time Physiological Telemetry (8 Primary Biosensors)
          </span>
          <span className="text-[11px] text-slate-500">
            Sampling: <span className="text-[#21D4A5] font-bold">1Hz Continuous</span> · Ingest Quality: 100%
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* 1. Heart Rate */}
          <MetricCard
            label="Heart Rate"
            value={latestVital.heartRate}
            unit="BPM"
            statusText="Nominal"
            status="nominal"
            trend="stable"
            trendLabel="Resting: 58 BPM"
            historicalComparison="Δ +6 BPM vs pre-flight"
            icon={<Heart className="w-3.5 h-3.5" />}
            sparklineData={[58, 62, 60, 68, 64, 72, 64]}
            lastUpdated="Updated 2s ago"
          />

          {/* 2. SpO2 */}
          <MetricCard
            label="Oxygen Saturation"
            value={latestVital.spo2}
            unit="%"
            statusText="Nominal"
            status="nominal"
            trend="stable"
            trendLabel="Target > 95%"
            historicalComparison="Normoxic range"
            icon={<Droplets className="w-3.5 h-3.5" />}
            sparklineData={[98.2, 98.6, 98.4, 98.1, 98.5, 98.4]}
            lastUpdated="Updated 2s ago"
          />

          {/* 3. Body Temperature */}
          <MetricCard
            label="Core Temperature"
            value={latestVital.bodyTemperature}
            unit="°C"
            statusText="Calibrated"
            status="nominal"
            trend="stable"
            trendLabel="Baseline 36.6°C"
            historicalComparison="Circadian: Normal"
            icon={<Thermometer className="w-3.5 h-3.5" />}
            sparklineData={[36.5, 36.6, 36.7, 36.6, 36.6]}
            lastUpdated="Updated 2s ago"
          />

          {/* 4. Blood Pressure */}
          <MetricCard
            label="Blood Pressure"
            value={`${latestVital.bloodPressure.systolic}/${latestVital.bloodPressure.diastolic}`}
            unit="mmHg"
            statusText="Optimal"
            status="nominal"
            trend="stable"
            trendLabel="MAP: 86 mmHg"
            historicalComparison="Cephalad fluid stable"
            icon={<Activity className="w-3.5 h-3.5" />}
            sparklineData={[112, 114, 118, 114, 116]}
            lastUpdated="Updated 1m ago"
          />

          {/* 5. Sleep Duration */}
          <MetricCard
            label="Sleep Duration"
            value={latestSleep.totalDurationHours}
            unit="Hours"
            statusText={latestSleep.totalDurationHours >= 7 ? 'Restorative' : 'Shortened'}
            status={latestSleep.totalDurationHours >= 7 ? 'nominal' : 'warning'}
            trend={latestSleep.totalDurationHours >= 7 ? 'up' : 'down'}
            trendLabel={`Efficiency: ${latestSleep.efficiencyPercent}%`}
            historicalComparison="Target: > 7.0 Hours"
            icon={<Moon className="w-3.5 h-3.5" />}
            sparklineData={[6.2, 6.5, 7.1, 6.8, 7.4]}
            lastUpdated="Last sleep cycle"
          />

          {/* 6. Physical Activity */}
          <MetricCard
            label="Daily Exercise"
            value={latestExercise.durationMinutes}
            unit="Mins"
            statusText="Completed"
            status="nominal"
            trend="up"
            trendLabel={latestExercise.exerciseType}
            historicalComparison="100% Mandate goal"
            icon={<Zap className="w-3.5 h-3.5" />}
            sparklineData={[60, 65, 70, 65, 65]}
            lastUpdated="ARED session logged"
          />

          {/* 7. HRV (Heart Rate Variability) */}
          <MetricCard
            label="HRV (RMSSD)"
            value={latestVital.hrv}
            unit="ms"
            statusText={latestVital.hrv < 48 ? 'Attenuated' : 'Nominal'}
            status={latestVital.hrv < 48 ? 'warning' : 'nominal'}
            trend={latestVital.hrv < 48 ? 'down' : 'stable'}
            trendLabel="Autonomic Balance"
            historicalComparison="Baseline: 65 ms"
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            sparklineData={[65, 68, 62, 54, 48, 41, 64]}
            lastUpdated="Updated 2s ago"
          />

          {/* 8. Radiation Exposure */}
          <MetricCard
            label="Cumulative Radiation"
            value={astronaut.radiationCumulativeMSv}
            unit="mSv"
            statusText="Monitored"
            status="nominal"
            trend="up"
            trendLabel="0.55 mSv / day"
            historicalComparison="31.4% of Mission Cap"
            icon={<Radio className="w-3.5 h-3.5" />}
            sparklineData={[74, 75, 76, 77, 78.4]}
            lastUpdated="Active dosimeter"
          />

        </div>
      </div>

      {/* MISSION CONTROL WORKFLOW MODULE TABS */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#0B1224] border border-slate-800 font-mono text-xs">
          <button
            onClick={() => setActiveModuleTab('briefing')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeModuleTab === 'briefing'
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold shadow-lg shadow-[#00E5FF]/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
            <span>1. Daily Clinical Briefing</span>
          </button>

          <button
            onClick={() => setActiveModuleTab('trends')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeModuleTab === 'trends'
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold shadow-lg shadow-[#00E5FF]/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>2. Live Physiological Trends</span>
          </button>

          <button
            onClick={() => setActiveModuleTab('context')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeModuleTab === 'context'
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold shadow-lg shadow-[#00E5FF]/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>3. Context Explorer</span>
          </button>

          <button
            onClick={() => setActiveModuleTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${
              activeModuleTab === 'timeline'
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold shadow-lg shadow-[#00E5FF]/10'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4. Mission Timeline</span>
          </button>
        </div>

        {/* Tab 1: Daily Clinical Briefing */}
        {activeModuleTab === 'briefing' && (
          <DailyBriefing astronaut={astronaut} onNavigate={onNavigate} />
        )}

        {/* Tab 2: Live Physiological Trends */}
        {activeModuleTab === 'trends' && (
          <LivePhysiologicalTrends
            telemetry={telemetry}
            baselineHeartRate={astronaut.baselineVitals?.restingHeartRate || 58}
            baselineSpo2={astronaut.baselineVitals?.spo2 || 98.4}
          />
        )}

        {/* Tab 3: Context Explorer */}
        {activeModuleTab === 'context' && (
          <ContextExplorer astronaut={astronaut} />
        )}

        {/* Tab 4: Mission Timeline */}
        {activeModuleTab === 'timeline' && (
          <MissionTimeline astronaut={astronaut} />
        )}
      </div>

      {/* HEALTH CORRELATION ANALYSIS (ADVANCED MULTI-VARIATE ASSOCIATIONS) */}
      <div className="rounded-3xl bg-[#101B30]/80 border border-[#00E5FF]/20 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] uppercase font-bold">
              <Cpu className="w-4 h-4" />
              <span>Multi-Variate Correlation Matrix</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              Health Metric Associations & Coupled Dynamics
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400 bg-[#050816] px-3 py-1 rounded-full border border-slate-800">
            Statistical Associations · Not Proof of Causation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-4 rounded-2xl bg-[#050816] border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-white font-bold">Sleep &lt; 6.5h ⇄ Next-Day Resting HR</span>
              <span className="text-[#00E5FF] font-bold text-sm">r = +0.78</span>
            </div>
            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
              Statistically strong inverse association: Sleep deprivation correlates directly with sympathetic autonomic overdrive and delayed heart rate recovery.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#050816] border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-white font-bold">ARED Loading ⇄ Serum Osteocalcin</span>
              <span className="text-[#21D4A5] font-bold text-sm">r = +0.86</span>
            </div>
            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
              Positive countermeasure association: Higher mechanical heel-strike strain correlates with maintained osteoblast activity, slowing microgravity bone resorption.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#050816] border border-slate-800 space-y-2">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-white font-bold">Cabin CO2 &gt; 3.0 mmHg ⇄ Fatigue Index</span>
              <span className="text-[#FFB547] font-bold text-sm">r = +0.72</span>
            </div>
            <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
              Environmental association: Elevated microgravity ambient carbon dioxide pockets correlate with reported cognitive fatigue and transient headaches.
            </p>
          </div>
        </div>
      </div>

      {/* 4-QUADRANT SCIENTIFIC VISUALIZATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Heart Rate & SpO2 Historical Trend */}
        <div className="bg-[#101B30]/80 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-white">
                Heart Rate & SpO2 Telemetry Timeline
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Continuous ECG sensor readings vs resting baseline
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#050816] p-1 rounded-xl border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setSelectedTimeRange('24h')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedTimeRange === '24h'
                    ? 'bg-[#00E5FF] text-[#050816] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                24H
              </button>
              <button
                onClick={() => setSelectedTimeRange('7d')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedTimeRange === '7d'
                    ? 'bg-[#00E5FF] text-[#050816] font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                7D
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey={selectedTimeRange === '24h' ? 'time' : 'date'} stroke="#64748b" fontSize={11} />
                <YAxis yAxisId="hr" stroke="#00E5FF" domain={[50, 110]} fontSize={11} />
                <YAxis yAxisId="spo2" orientation="right" stroke="#438BFF" domain={[92, 100]} fontSize={11} hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050816', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                />
                <Line
                  yAxisId="hr"
                  type="monotone"
                  dataKey="heartRate"
                  stroke="#00E5FF"
                  strokeWidth={2.5}
                  dot={false}
                  name="Heart Rate (BPM)"
                />
                <Line
                  yAxisId="spo2"
                  type="monotone"
                  dataKey="spo2"
                  stroke="#438BFF"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  name="SpO2 (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800/80">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#00E5FF] inline-block" /> Heart Rate</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-[#438BFF] inline-block border-b border-dashed" /> SpO2 Saturation</span>
            </div>
            <span>Calibrated Baseline: 58 BPM</span>
          </div>
        </div>

        {/* Chart 2: Radiation Dosimetry & Daily Rate (GCR vs SPE) */}
        <div className="bg-[#101B30]/80 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-white">
                Space Radiation Dosimetry (Past 7 Days)
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Galactic Cosmic Rays (GCR) + Solar Particle Events (μSv/h)
              </p>
            </div>
            <span className="text-xs font-mono text-[#FFB547] bg-[#FFB547]/10 px-2.5 py-0.5 rounded-full border border-[#FFB547]/30">
              Active Shielding 78%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={radiation.map(r => ({
                  day: new Date(r.timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
                  rate: r.doseRateMicroSvPerHour,
                  dailyMSv: r.accumulatedDailyMSv,
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#FFB547" domain={[10, 50]} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050816', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#FFB547"
                  fill="#FFB54720"
                  strokeWidth={2}
                  name="Dose Rate (μSv/h)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800/80">
            <span className="text-slate-400">Sensor: Personal Active Silicon Dosimeter</span>
            <span className="text-[#FFB547]">Warning Limit: &gt; 30 μSv/h</span>
          </div>
        </div>

        {/* Chart 3: Weekly Sleep Architecture (Deep / REM / Light) */}
        <div className="bg-[#101B30]/80 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-white">
                Weekly Sleep Duration & Polysomnography
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                REM, Deep (Slow-Wave), and Light Sleep per night
              </p>
            </div>
            <span className="text-xs font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2.5 py-0.5 rounded-full border border-[#00E5FF]/30">
              Avg: 6.8h / 86% Eff
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sleepRecords.slice(-7).map(s => ({
                  day: new Date(s.date).toLocaleDateString(undefined, { weekday: 'short' }),
                  total: s.totalDurationHours,
                  deep: +((s.deepSleepPercent * s.totalDurationHours) / 100).toFixed(1),
                  rem: +((s.remSleepPercent * s.totalDurationHours) / 100).toFixed(1),
                  light: +((s.lightSleepPercent * s.totalDurationHours) / 100).toFixed(1),
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" domain={[0, 9]} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050816', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="deep" name="Deep (Slow-Wave)" stackId="a" fill="#00E5FF" />
                <Bar dataKey="rem" name="REM" stackId="a" fill="#8B5CF6" />
                <Bar dataKey="light" name="Light" stackId="a" fill="#334155" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800/80">
            <span>Target: &ge; 7.0 Hours</span>
            <span className="text-[#21D4A5]">Circadian: Synchronized</span>
          </div>
        </div>

        {/* Chart 4: Physical Countermeasure Workload (ARED) */}
        <div className="bg-[#101B30]/80 border border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-base font-bold text-white">
                Physical Countermeasure Workload (Past 7 Days)
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                ARED Resistive Force & Cardiovascular Conditioning
              </p>
            </div>
            <span className="text-xs font-mono text-[#21D4A5] bg-[#21D4A5]/10 px-2.5 py-0.5 rounded-full border border-[#21D4A5]/30">
              100% Adherence
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={activityRecords.slice(-7).map(a => ({
                  day: new Date(a.date).toLocaleDateString(undefined, { weekday: 'short' }),
                  duration: a.durationMinutes,
                  type: a.exerciseType.split(' ')[0],
                  calories: a.caloriesBurned,
                }))}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" domain={[0, 90]} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#050816', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                />
                <Bar dataKey="duration" name="Duration (Mins)" fill="#00E5FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800/80">
            <span>Mandate: 60–90 min/day</span>
            <span className="text-[#00E5FF]">7 of 7 Sessions Verified</span>
          </div>
        </div>

      </div>

      {/* RECENT ALERTS QUICK VIEW */}
      <div className="rounded-3xl bg-[#101B30]/80 border border-slate-800 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#FFB547]" />
            <h4 className="text-base font-bold text-white">
              Active Biomedical Alerts & Threshold Flags
            </h4>
          </div>
          <button
            onClick={() => onNavigate('alerts')}
            className="text-xs font-mono text-[#00E5FF] hover:underline cursor-pointer"
          >
            Open Alert Center ({alerts.length}) →
          </button>
        </div>

        <div className="space-y-2.5">
          {alerts.filter(a => a.status === 'Active').slice(0, 2).map((a) => (
            <div
              key={a.id}
              className="p-4 rounded-2xl bg-[#050816] border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-white text-sm">{a.title}</span>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                    a.severity === 'Critical' ? 'bg-[#FF5368]/15 text-[#FF5368] border-[#FF5368]/30' : 'bg-[#FFB547]/15 text-[#FFB547] border-[#FFB547]/30'
                  }`}>
                    {a.severity}
                  </span>
                </div>
                <div className="text-slate-400 text-xs">{a.reason}</div>
              </div>
              <div className="text-right shrink-0 font-mono">
                <span className="text-[#00E5FF] font-bold text-sm block">{a.observedValue}</span>
                <span className="text-slate-500 text-[10px]">Threshold: {a.configuredThreshold}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LOG TELEMETRY MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#101B30] border border-[#00E5FF]/40 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-[0_0_40px_rgba(0,229,255,0.25)]">
            <h3 className="text-lg font-bold text-white mb-1">Log Astronaut Measurement</h3>
            <p className="text-xs text-slate-400 mb-5">
              Simulate real-time biosensor ingest to evaluate automated anomaly scoring and dashed baseline triggers.
            </p>

            <form onSubmit={handleCreateVital} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-300 mb-1">Heart Rate (BPM)</label>
                <input
                  type="number"
                  value={newHr}
                  onChange={(e) => setNewHr(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#050816] border border-slate-700 rounded-xl text-white font-bold text-[#00E5FF] focus:outline-none focus:border-[#00E5FF]"
                  min="30"
                  max="220"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Blood Oxygen SpO2 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newSpo2}
                  onChange={(e) => setNewSpo2(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#050816] border border-slate-700 rounded-xl text-white font-bold text-[#438BFF] focus:outline-none focus:border-[#00E5FF]"
                  min="80"
                  max="100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Body Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newTemp}
                  onChange={(e) => setNewTemp(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#050816] border border-slate-700 rounded-xl text-white font-bold text-[#21D4A5] focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Systolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newSys}
                    onChange={(e) => setNewSys(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#050816] border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Diastolic BP (mmHg)</label>
                  <input
                    type="number"
                    value={newDia}
                    onChange={(e) => setNewDia(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#050816] border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#438BFF] text-[#050816] font-extrabold uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Ingest Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
