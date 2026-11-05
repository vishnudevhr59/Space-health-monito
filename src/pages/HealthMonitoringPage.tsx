import React, { useState, useEffect, useMemo } from 'react';
import { AstronautProfile, HealthMeasurement, SleepRecord, ActivityRecord } from '../types';
import { MetricCard } from '../components/MetricCard';
import { D3Sparkline } from '../components/D3Sparkline';
import { telemetryStreamEngine, TelemetryFrame } from '../services/telemetryStreamEngine';
import {
  Activity,
  Heart,
  Droplets,
  Thermometer,
  Calendar,
  Filter,
  Download,
  Search,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Radio,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  BarChart2,
  ShieldCheck,
} from 'lucide-react';
import { AstronautDigitalTwin } from '../components/AstronautDigitalTwin';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface HealthMonitoringPageProps {
  astronaut: AstronautProfile;
  telemetry: HealthMeasurement[];
  sleepRecords: SleepRecord[];
  activityRecords: ActivityRecord[];
}

export const HealthMonitoringPage: React.FC<HealthMonitoringPageProps> = ({
  astronaut,
  telemetry,
  sleepRecords,
  activityRecords,
}) => {
  const [viewMode, setViewMode] = useState<'telemetry' | 'digital-twin'>('telemetry');
  const [selectedRange, setSelectedRange] = useState<'24h' | '7d' | '14d' | '30d'>('7d');
  const [activeFilter, setActiveFilter] = useState<'all' | 'cardiac' | 'respiratory' | 'thermal' | 'activity'>('all');
  const [searchDate, setSearchDate] = useState('');
  const [showRawTable, setShowRawTable] = useState(false);

  // 1Hz Real-Time Streaming Buffer (Rolling 50 frames)
  const [liveStreamFrames, setLiveStreamFrames] = useState<TelemetryFrame[]>(() => [
    telemetryStreamEngine.getCurrentFrame(),
  ]);

  useEffect(() => {
    const unsubscribe = telemetryStreamEngine.subscribe((frame) => {
      setLiveStreamFrames((prev) => {
        const next = [...prev, frame];
        return next.length > 50 ? next.slice(-50) : next;
      });
    });
    return unsubscribe;
  }, []);

  const latestFrame = liveStreamFrames[liveStreamFrames.length - 1] || telemetryStreamEngine.getCurrentFrame();

  // Dynamic D3 Series for live charts
  const hrSeries = useMemo(() => liveStreamFrames.map((f) => f.heartRate), [liveStreamFrames]);
  const spo2Series = useMemo(() => liveStreamFrames.map((f) => f.spo2), [liveStreamFrames]);
  const bpSeries = useMemo(() => liveStreamFrames.map((f) => f.systolicBP), [liveStreamFrames]);
  const tempSeries = useMemo(() => liveStreamFrames.map((f) => f.bodyTemperature), [liveStreamFrames]);

  const calcStats = (arr: number[]) => {
    if (!arr.length) return { min: 0, max: 0, avg: 0, std: 0 };
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = arr.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / arr.length;
    return {
      min: +min.toFixed(1),
      max: +max.toFixed(1),
      avg: +avg.toFixed(1),
      std: +Math.sqrt(variance).toFixed(2),
    };
  };

  const hrStats = useMemo(() => calcStats(hrSeries), [hrSeries]);
  const spo2Stats = useMemo(() => calcStats(spo2Series), [spo2Series]);
  const bpStats = useMemo(() => calcStats(bpSeries), [bpSeries]);
  const tempStats = useMemo(() => calcStats(tempSeries), [tempSeries]);

  // Sliced data based on time range
  const sliceCount = selectedRange === '24h' ? 8 : selectedRange === '7d' ? 28 : 60;
  const filteredTelemetry = telemetry.slice(-sliceCount);

  // Format series for multi-channel Recharts
  const chartSeries = filteredTelemetry.map((m) => {
    const d = new Date(m.timestamp);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()} ${d.getUTCHours()}:00`,
      heartRate: m.heartRate,
      spo2: m.spo2,
      temp: m.bodyTemperature,
      systolic: m.bloodPressure.systolic,
      diastolic: m.bloodPressure.diastolic,
      hrv: m.hrv,
      dataQuality: m.dataQuality,
    };
  });

  // Calculate high-precision aggregate statistics
  const avgHr = Math.round(
    filteredTelemetry.reduce((acc, m) => acc + m.heartRate, 0) / (filteredTelemetry.length || 1)
  );
  const avgSpo2 = +(
    filteredTelemetry.reduce((acc, m) => acc + m.spo2, 0) / (filteredTelemetry.length || 1)
  ).toFixed(1);
  const avgTemp = +(
    filteredTelemetry.reduce((acc, m) => acc + m.bodyTemperature, 0) / (filteredTelemetry.length || 1)
  ).toFixed(2);
  const maxHr = Math.max(...filteredTelemetry.map((m) => m.heartRate));
  const minHr = Math.min(...filteredTelemetry.map((m) => m.heartRate));

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>High-Resolution Clinical Telemetry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Detailed Physiological Monitoring
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Multi-channel historical records for Heart Rate, SpO2 Saturation, Core Temperature, Blood Pressure, and Sleep Telemetry.
          </p>
        </div>

        {/* View Mode & Date Selector */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 bg-[#050816] p-1 rounded-xl border border-cyan-500/30">
            <button
              onClick={() => setViewMode('telemetry')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'telemetry'
                  ? 'bg-cyan-600 text-white font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Sensors & Trends</span>
            </button>
            <button
              onClick={() => setViewMode('digital-twin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'digital-twin'
                  ? 'bg-cyan-600 text-white font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300" />
              <span>Digital Twin Model</span>
            </button>
          </div>

          {viewMode === 'telemetry' && (
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              {(['24h', '7d', '14d', '30d'] as const).map((rng) => (
                <button
                  key={rng}
                  onClick={() => setSelectedRange(rng)}
                  className={`px-3 py-1.5 rounded-lg uppercase transition-colors cursor-pointer ${
                    selectedRange === rng
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {rng}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RENDER ASTRONAUT DIGITAL TWIN IF SELECTED */}
      {viewMode === 'digital-twin' && (
        <AstronautDigitalTwin
          astronaut={astronaut}
          latestTelemetry={telemetry[telemetry.length - 1]}
        />
      )}

      {/* FILTER & METRIC SELECTOR STRIP */}
      {viewMode === 'telemetry' && (
        <>
          <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_4px_24px_rgba(0,229,255,0.03)]">
        
        {/* Category Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          <span className="text-xs font-mono text-slate-400 mr-2 uppercase font-semibold">Channel:</span>
          {[
            { id: 'all', label: 'All Channels' },
            { id: 'cardiac', label: 'Cardiovascular (HR & BP)' },
            { id: 'respiratory', label: 'Oxygenation (SpO2)' },
            { id: 'thermal', label: 'Thermoregulation' },
          ].map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveFilter(ch.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
                activeFilter === ch.id
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-4 text-xs font-mono text-slate-300">
          <span>Range Mean HR: <strong className="text-white font-bold tabular-nums">{avgHr} BPM</strong></span>
          <span className="text-slate-600">·</span>
          <span>Mean SpO2: <strong className="text-[#00E5FF] font-bold tabular-nums">{avgSpo2}%</strong></span>
          <span className="text-slate-600">·</span>
          <span>Core Temp: <strong className="text-[#21D4A5] font-bold tabular-nums">{avgTemp}°C</strong></span>
        </div>

      </div>

      {/* MAIN INTERACTIVE MULTI-CHANNEL CHART */}
      <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Continuous Sensor Telemetry Waveform ({selectedRange.toUpperCase()})
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              ECG Optical Biosensors + Continuous Pulse Oximetry
            </p>
          </div>
          <span className="text-xs font-mono text-[#21D4A5] bg-[#21D4A5]/10 px-3 py-1 rounded-full border border-[#21D4A5]/30 self-start sm:self-auto font-medium">
            Telemetry Quality: 100% Ingest
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartSeries} margin={{ top: 15, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
              
              {/* Left Axis: Heart Rate & BP */}
              <YAxis
                yAxisId="left"
                domain={[45, 135]}
                stroke="#00E5FF"
                fontSize={11}
                tickFormatter={(v) => `${v}`}
              />

              {/* Right Axis: SpO2 */}
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[92, 100]}
                stroke="#438BFF"
                fontSize={11}
                tickFormatter={(v) => `${v}%`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#0B1224',
                  borderColor: 'rgba(0,229,255,0.3)',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono',
                  color: '#FFFFFF',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />

              {(activeFilter === 'all' || activeFilter === 'cardiac') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (BPM)"
                  stroke="#00E5FF"
                  strokeWidth={2}
                  dot={false}
                />
              )}

              {(activeFilter === 'all' || activeFilter === 'cardiac') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="systolic"
                  name="Systolic BP (mmHg)"
                  stroke="#8B5CF6"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              )}

              {(activeFilter === 'all' || activeFilter === 'respiratory') && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="spo2"
                  name="SpO2 Saturation (%)"
                  stroke="#438BFF"
                  strokeWidth={2}
                  dot={false}
                />
              )}

              {(activeFilter === 'all' || activeFilter === 'thermal') && (
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="temp"
                  name="Core Temp (°C)"
                  stroke="#21D4A5"
                  strokeWidth={2}
                  dot={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DYNAMIC D3 REAL-TIME BIOSENSOR TELEMETRY MATRIX (1HZ STREAM) */}
      <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </span>
              <h3 className="text-base font-bold text-white tracking-wide">
                Dynamic D3 Biosensor Telemetry Matrix
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 uppercase font-bold">
                1Hz Streaming Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              60fps GPU-accelerated d3.curveMonotoneX spline interpolation across 50 rolling telemetry frames
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowRawTable(!showRawTable)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showRawTable ? 'Hide Raw Ingest Table' : 'Inspect Raw Ingest Table'}</span>
              {showRawTable ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        {/* 4-Channel Live D3 Telemetry Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Channel 1: Heart Rate */}
          <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  Cardiovascular (HR)
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
                    {latestFrame.heartRate}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">BPM</span>
                </div>
              </div>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${
                  latestFrame.heartRate > 120
                    ? 'bg-rose-950/80 text-rose-400 border-rose-800/80'
                    : latestFrame.heartRate > 95
                    ? 'bg-amber-950/80 text-amber-400 border-amber-800/80'
                    : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
                }`}
              >
                {latestFrame.heartRate > 120 ? 'CRITICAL' : latestFrame.heartRate > 95 ? 'WARNING' : 'NOMINAL'}
              </span>
            </div>

            {/* D3 Dynamic Sparkline */}
            <div className="w-full flex justify-center py-1">
              <D3Sparkline
                data={hrSeries}
                width={240}
                height={68}
                color="#00E5FF"
                minDomain={45}
                maxDomain={140}
                thresholdWarning={95}
                thresholdCritical={120}
                unit="BPM"
                showArea={true}
                showGrid={true}
                showLatestPoint={true}
              />
            </div>

            {/* Rolling Frame Statistics */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 text-center">
              <div>
                <div className="text-[9px] text-slate-500">MIN</div>
                <div className="text-white font-semibold tabular-nums">{hrStats.min}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500">MAX</div>
                <div className="text-white font-semibold tabular-nums">{hrStats.max}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500">AVG</div>
                <div className="text-cyan-400 font-semibold tabular-nums">{hrStats.avg}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500">σ (STD)</div>
                <div className="text-slate-300 font-semibold tabular-nums">±{hrStats.std}</div>
              </div>
            </div>
          </div>

          {/* Channel 2: Arterial Oxygenation (SpO2) */}
          <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  Oxygenation (SpO2)
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
                    {latestFrame.spo2}%
                  </span>
                  <span className="text-xs font-mono text-sky-400 font-bold">SAT</span>
                </div>
              </div>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${
                  latestFrame.spo2 < 88
                    ? 'bg-rose-950/80 text-rose-400 border-rose-800/80'
                    : latestFrame.spo2 < 93
                    ? 'bg-amber-950/80 text-amber-400 border-amber-800/80'
                    : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
                }`}
              >
                {latestFrame.spo2 < 88 ? 'HYPOXIC' : latestFrame.spo2 < 93 ? 'ELEVATED' : 'NORMOXIC'}
              </span>
            </div>

            {/* D3 Dynamic Sparkline */}
            <div className="w-full flex justify-center py-1">
              <D3Sparkline
                data={spo2Series}
                width={240}
                height={68}
                color="#38BDF8"
                minDomain={82}
                maxDomain={100}
                thresholdWarning={92}
                thresholdCritical={88}
                unit="%"
                showArea={true}
                showGrid={true}
                showLatestPoint={true}
              />
            </div>

            {/* Rolling Frame Statistics */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 text-center">
              <div>
                <div className="text-[9px] text-slate-500">MIN</div>
                <div className="text-white font-semibold tabular-nums">{spo2Stats.min}%</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500">MAX</div>
                <div className="text-white font-semibold tabular-nums">{spo2Stats.max}%</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500">AVG</div>
                <div className="text-sky-400 font-semibold tabular-nums">{spo2Stats.avg}%</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500">σ (STD)</div>
                <div className="text-slate-300 font-semibold tabular-nums">±{spo2Stats.std}</div>
              </div>
            </div>
          </div>

          {/* Channel 3: Blood Pressure & MAP */}
          <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  Hemodynamics (BP / MAP)
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
                    {latestFrame.systolicBP}/{latestFrame.diastolicBP}
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">mmHg</span>
                </div>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded font-bold border bg-slate-900 text-slate-300 border-slate-700">
                MAP {Math.round(latestFrame.diastolicBP + (latestFrame.systolicBP - latestFrame.diastolicBP) / 3)}
              </span>
            </div>

            {/* D3 Dynamic Sparkline */}
            <div className="w-full flex justify-center py-1">
              <D3Sparkline
                data={bpSeries}
                width={240}
                height={68}
                color="#21D4A5"
                minDomain={80}
                maxDomain={160}
                thresholdWarning={135}
                thresholdCritical={150}
                unit="mmHg"
                showArea={true}
                showGrid={true}
                showLatestPoint={true}
              />
            </div>

            {/* Rolling Frame Statistics */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 text-center">
              <div>
                <div className="text-[9px] text-slate-500">MIN</div>
                <div className="text-white font-semibold tabular-nums">{bpStats.min}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500">MAX</div>
                <div className="text-white font-semibold tabular-nums">{bpStats.max}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500">AVG</div>
                <div className="text-emerald-400 font-semibold tabular-nums">{bpStats.avg}</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500">σ (STD)</div>
                <div className="text-slate-300 font-semibold tabular-nums">±{bpStats.std}</div>
              </div>
            </div>
          </div>

          {/* Channel 4: Core Temperature */}
          <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  Core Temp (ThermoLab)
                </span>
                <div className="flex items-baseline gap-1.5 mt-0.5">
                  <span className="text-2xl font-extrabold text-white font-mono tabular-nums">
                    {latestFrame.bodyTemperature}°C
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-bold">CORE</span>
                </div>
              </div>
              <span
                className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border ${
                  latestFrame.bodyTemperature > 38.5
                    ? 'bg-rose-950/80 text-rose-400 border-rose-800/80'
                    : latestFrame.bodyTemperature > 37.8
                    ? 'bg-amber-950/80 text-amber-400 border-amber-800/80'
                    : 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80'
                }`}
              >
                {latestFrame.bodyTemperature > 38.5 ? 'PYREXIA' : latestFrame.bodyTemperature > 37.8 ? 'ELEVATED' : 'SPACE NORM'}
              </span>
            </div>

            {/* D3 Dynamic Sparkline */}
            <div className="w-full flex justify-center py-1">
              <D3Sparkline
                data={tempSeries}
                width={240}
                height={68}
                color="#FFB547"
                minDomain={35.5}
                maxDomain={39.5}
                thresholdWarning={37.8}
                thresholdCritical={38.5}
                unit="°C"
                showArea={true}
                showGrid={true}
                showLatestPoint={true}
              />
            </div>

            {/* Rolling Frame Statistics */}
            <div className="grid grid-cols-4 gap-1 text-[10px] font-mono text-slate-400 border-t border-slate-800/80 pt-2 text-center">
              <div>
                <div className="text-[9px] text-slate-500">MIN</div>
                <div className="text-white font-semibold tabular-nums">{tempStats.min}°</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500">MAX</div>
                <div className="text-white font-semibold tabular-nums">{tempStats.max}°</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500">AVG</div>
                <div className="text-amber-400 font-semibold tabular-nums">{tempStats.avg}°</div>
              </div>
              <div>
                <div className="text-[9px] text-slate-500">σ (STD)</div>
                <div className="text-slate-300 font-semibold tabular-nums">±{tempStats.std}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE RAW BIOSENSOR INGEST PACKET AUDIT */}
      {showRawTable && (
        <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Raw Biosensor Ingest Packet Ledger (RFC-4180 Audit)</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Calibrated demonstration telemetry time packets ingested via 1Hz spacecraft bus
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Showing {filteredTelemetry.length} recent packets
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#0B1224] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Packet Timestamp (UTC)</th>
                  <th className="py-3 px-4">Heart Rate</th>
                  <th className="py-3 px-4">SpO2</th>
                  <th className="py-3 px-4">Blood Pressure</th>
                  <th className="py-3 px-4">Core Temp</th>
                  <th className="py-3 px-4">HRV (RMSSD)</th>
                  <th className="py-3 px-4">Data Quality</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 bg-[#101B30]/50">
                {filteredTelemetry.slice(-10).reverse().map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      {new Date(m.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#00E5FF] tabular-nums">{m.heartRate} BPM</td>
                    <td className="py-3 px-4 text-sky-400 tabular-nums">{m.spo2}%</td>
                    <td className="py-3 px-4 tabular-nums">{m.bloodPressure.systolic}/{m.bloodPressure.diastolic} mmHg</td>
                    <td className="py-3 px-4 tabular-nums">{m.bodyTemperature} °C</td>
                    <td className="py-3 px-4 tabular-nums">{m.hrv} ms</td>
                    <td className="py-3 px-4">
                      <span className="text-[#21D4A5] font-bold">{m.dataQuality}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      </>
      )}

    </div>
  );
};
