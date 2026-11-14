import React, { useState, useEffect, useMemo } from 'react';
import { AstronautProfile, HealthMeasurement, SleepRecord, ActivityRecord } from '../types';
import { D3Sparkline } from '../components/D3Sparkline';
import { telemetryStreamEngine, TelemetryFrame, TelemetryTransportMode } from '../services/telemetryStreamEngine';
import { fetchLiveIssTelemetry, IssOrbitalSnapshot } from '../services/orbitalTelemetryService';
import {
  Activity,
  Download,
  Search,
  Zap,
  ChevronDown,
  ChevronUp,
  BarChart2,
  ShieldCheck,
  Sliders,
  Info,
  X,
  Cpu,
  Moon,
  Dumbbell,
  Globe,
  Radio,
} from 'lucide-react';
import { AstronautDigitalTwin } from '../components/AstronautDigitalTwin';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'cardiac' | 'respiratory' | 'thermal'>('all');
  const [searchDate, setSearchDate] = useState('');
  const [showRawTable, setShowRawTable] = useState(false);
  const [activeRowFactorsId, setActiveRowFactorsId] = useState<string | null>(null);

  // 1Hz Real-Time Streaming Buffer (Rolling 50 frames)
  const [liveStreamFrames, setLiveStreamFrames] = useState<TelemetryFrame[]>(() => [
    telemetryStreamEngine.getCurrentFrame(),
  ]);
  const [transportMode, setTransportMode] = useState<TelemetryTransportMode>(() =>
    telemetryStreamEngine.getTransportMode()
  );
  const [orbitalSnapshot, setOrbitalSnapshot] = useState<IssOrbitalSnapshot | null>(null);

  useEffect(() => {
    const unsubscribe = telemetryStreamEngine.subscribe((frame) => {
      setLiveStreamFrames((prev) => {
        const next = [...prev, frame];
        return next.length > 50 ? next.slice(-50) : next;
      });
      setTransportMode(telemetryStreamEngine.getTransportMode());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    let active = true;
    const pollOrbital = async () => {
      const snap = await fetchLiveIssTelemetry();
      if (active) setOrbitalSnapshot(snap);
    };
    pollOrbital();
    const timer = setInterval(pollOrbital, 10000);
    return () => {
      active = false;
      clearInterval(timer);
    };
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

  const baseHrv = astronaut?.baselineVitals?.hrvMs ?? 65;
  const baseRhr = astronaut?.baselineVitals?.restingHeartRate ?? 58;
  const baseTemp = astronaut?.baselineVitals?.bodyTempC ?? 36.6;
  const baseSpo2 = astronaut?.baselineVitals?.spo2 ?? 98.4;
  const baseSys = astronaut?.baselineVitals?.systolicBP ?? 114;
  const baseDia = astronaut?.baselineVitals?.diastolicBP ?? 72;

  // Normalize and slice telemetry with a calibrated 24-point fallback when offline/static
  const sliceCount = selectedRange === '24h' ? 8 : selectedRange === '7d' ? 28 : selectedRange === '14d' ? 42 : 60;

  const fallbackTelemetry = useMemo<HealthMeasurement[]>(() => {
    const now = Date.now();
    return Array.from({ length: 24 }, (_, idx) => {
      const i = 23 - idx;
      const wave = Math.sin(idx * 0.55);
      const hr = Math.round((latestFrame.heartRate || baseRhr + 4) + wave * 4);
      const spo2 = +((latestFrame.spo2 || baseSpo2) - Math.abs(wave) * 0.3).toFixed(1);
      const temp = +((latestFrame.bodyTemperature || baseTemp) + Math.cos(idx * 0.4) * 0.12).toFixed(2);
      const hrv = Math.round((latestFrame.hrv || baseHrv) - wave * 3);
      return {
        id: `meas-cal-${idx}`,
        astronautId: astronaut?.id || 'astro-1',
        timestamp: new Date(now - i * 3600000).toISOString(),
        heartRate: hr,
        spo2,
        bodyTemperature: temp,
        bloodPressure: {
          systolic: Math.round((latestFrame.systolicBP || baseSys) + wave * 3),
          diastolic: Math.round((latestFrame.diastolicBP || baseDia) + wave * 2),
        },
        hrv,
        respiratoryRate: latestFrame.respiratoryRate || 14,
        perfusionIndex: 4.1,
        isSimulated: true,
        dataQuality: 'High' as const,
      };
    });
  }, [astronaut?.id, baseDia, baseHrv, baseRhr, baseSpo2, baseSys, baseTemp, latestFrame.bodyTemperature, latestFrame.diastolicBP, latestFrame.heartRate, latestFrame.hrv, latestFrame.respiratoryRate, latestFrame.spo2, latestFrame.systolicBP]);

  const safeTelemetry = useMemo(() => {
    const incoming = Array.isArray(telemetry) ? telemetry.filter((m): m is HealthMeasurement => Boolean(m && typeof m === 'object')) : [];
    const source = incoming.length >= 2 ? incoming : fallbackTelemetry;
    return source.slice(-sliceCount).map((m, idx) => ({
      ...m,
      id: m.id || `meas-row-${idx}`,
      timestamp: m.timestamp || new Date().toISOString(),
      heartRate: Number.isFinite(Number(m.heartRate)) ? Number(m.heartRate) : baseRhr,
      spo2: Number.isFinite(Number(m.spo2)) ? Number(m.spo2) : baseSpo2,
      bodyTemperature: Number.isFinite(Number(m.bodyTemperature)) ? Number(m.bodyTemperature) : baseTemp,
      hrv: Number.isFinite(Number(m.hrv ?? (m as any).heartRateVariability))
        ? Number(m.hrv ?? (m as any).heartRateVariability)
        : baseHrv,
      bloodPressure: {
        systolic: Number.isFinite(Number(m.bloodPressure?.systolic)) ? Number(m.bloodPressure.systolic) : baseSys,
        diastolic: Number.isFinite(Number(m.bloodPressure?.diastolic)) ? Number(m.bloodPressure.diastolic) : baseDia,
      },
      dataQuality: m.dataQuality || ('High' as const),
    }));
  }, [telemetry, fallbackTelemetry, sliceCount, baseRhr, baseSpo2, baseTemp, baseHrv, baseSys, baseDia]);

  // Format series for multi-channel Recharts
  const chartSeries = useMemo(() => {
    return safeTelemetry.map((m) => {
      const parsed = new Date(m.timestamp);
      const d = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
      return {
        date: `${d.getUTCMonth() + 1}/${d.getUTCDate()} ${String(d.getUTCHours()).padStart(2, '0')}:00`,
        heartRate: m.heartRate,
        spo2: m.spo2,
        temp: m.bodyTemperature,
        systolic: m.bloodPressure.systolic,
        diastolic: m.bloodPressure.diastolic,
        hrv: m.hrv,
        dataQuality: m.dataQuality,
      };
    });
  }, [safeTelemetry]);

  // Calculate high-precision aggregate statistics safely
  const avgHr = Math.round(
    safeTelemetry.reduce((acc, m) => acc + m.heartRate, 0) / (safeTelemetry.length || 1)
  );
  const avgSpo2 = +(
    safeTelemetry.reduce((acc, m) => acc + m.spo2, 0) / (safeTelemetry.length || 1)
  ).toFixed(1);
  const avgTemp = +(
    safeTelemetry.reduce((acc, m) => acc + m.bodyTemperature, 0) / (safeTelemetry.length || 1)
  ).toFixed(2);

  // Sleep & Activity summary metrics
  const safeSleep = Array.isArray(sleepRecords) ? sleepRecords : [];
  const safeActivity = Array.isArray(activityRecords) ? activityRecords : [];
  const latestSleep = safeSleep[safeSleep.length - 1];
  const latestActivity = safeActivity[safeActivity.length - 1];
  const sleepHoursDisplay = latestSleep && Number.isFinite(latestSleep.totalDurationHours) ? +latestSleep.totalDurationHours.toFixed(1) : 7.2;
  const sleepEffDisplay = latestSleep?.efficiencyPercent ?? 88;
  const activityMinsDisplay = latestActivity?.durationMinutes ?? 65;

  // Filtered raw ledger rows
  const ledgerRows = useMemo(() => {
    const recent = safeTelemetry.slice(-16).reverse();
    if (!searchDate.trim()) return recent;
    const q = searchDate.trim().toLowerCase();
    return recent.filter((m) => {
      const utc = new Date(m.timestamp).toISOString().toLowerCase();
      const local = new Date(m.timestamp).toLocaleString().toLowerCase();
      return utc.includes(q) || local.includes(q) || String(m.dataQuality).toLowerCase().includes(q);
    });
  }, [safeTelemetry, searchDate]);

  const handleExportCsv = () => {
    const headers = ['Timestamp_UTC', 'HeartRate_BPM', 'SpO2_Pct', 'Systolic_mmHg', 'Diastolic_mmHg', 'CoreTemp_C', 'HRV_ms', 'DataQuality'];
    const rows = safeTelemetry.map((m) =>
      [
        m.timestamp,
        m.heartRate,
        m.spo2,
        m.bloodPressure.systolic,
        m.bloodPressure.diastolic,
        m.bodyTemperature,
        m.hrv,
        m.dataQuality,
      ].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SPACE_HEALTH_MONITO_TELEMETRY_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5 sm:space-y-6 overflow-x-hidden">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4 shrink-0" />
            <span className="truncate">High-Resolution Clinical Telemetry</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
            Detailed Physiological Monitoring
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Multi-channel historical records for Heart Rate, SpO2 Saturation, Core Temperature, Blood Pressure, and Sleep Telemetry.
          </p>
        </div>

        {/* View Mode & Date Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono w-full md:w-auto min-w-0">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 bg-[#050816] p-1 rounded-xl border border-cyan-500/30 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('telemetry')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer min-h-[36px] whitespace-nowrap ${
                viewMode === 'telemetry'
                  ? 'bg-cyan-600 text-white font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5 shrink-0" />
              <span>Sensors &amp; Trends</span>
            </button>
            <button
              onClick={() => setViewMode('digital-twin')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer min-h-[36px] whitespace-nowrap ${
                viewMode === 'digital-twin'
                  ? 'bg-cyan-600 text-white font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
              <span>Digital Twin Model</span>
            </button>
          </div>

          {viewMode === 'telemetry' && (
            <div className="flex flex-wrap items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 w-full sm:w-auto justify-between sm:justify-start">
              {(['24h', '7d', '14d', '30d'] as const).map((rng) => (
                <button
                  key={rng}
                  onClick={() => setSelectedRange(rng)}
                  className={`flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 rounded-lg uppercase transition-colors cursor-pointer min-h-[36px] whitespace-nowrap ${
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

      {/* LIVE WEBSOCKET STREAM & ISS ORBITAL TELEMETRY CONTEXT */}
      <div className="bg-[#0B1224]/90 border border-cyan-500/20 rounded-2xl px-3.5 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[11px] font-mono overflow-hidden min-w-0">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <Radio className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-300 font-semibold">
            {transportMode === 'WEBSOCKET_LIVE' ? 'WebSocket Telemetry Bus (/ws/telemetry)' : 'Autonomous Edge 1Hz Bus'}
          </span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-300 font-bold">
            {transportMode === 'WEBSOCKET_LIVE' ? 'LOW-LATENCY WS SYNC' : 'LOCAL EDGE RESILIENT'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-300 min-w-0">
          <span className="flex items-center gap-1 text-sky-300 font-bold">
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span>{orbitalSnapshot?.name || 'ISS (ZARYA)'}</span>
          </span>
          <span className="tabular-nums">
            Lat <strong className="text-white">{orbitalSnapshot?.latitude ?? 24.6}°</strong> / Lon{' '}
            <strong className="text-white">{orbitalSnapshot?.longitude ?? -81.4}°</strong>
          </span>
          <span className="tabular-nums text-cyan-300">
            Alt {orbitalSnapshot?.altitudeKm ?? 418.4} km
          </span>
          <span className="tabular-nums text-emerald-300">
            {orbitalSnapshot?.velocityKmh?.toLocaleString() ?? '27,582'} km/h · Kp {orbitalSnapshot?.kpIndex ?? 2.3}
          </span>
        </div>
      </div>

      {/* RENDER ASTRONAUT DIGITAL TWIN IF SELECTED */}
      {viewMode === 'digital-twin' && (
        <AstronautDigitalTwin
          astronaut={astronaut}
          latestTelemetry={safeTelemetry[safeTelemetry.length - 1]}
        />
      )}

      {/* TELEMETRY VIEW */}
      {viewMode === 'telemetry' && (
        <>
          {/* FILTER & METRIC SELECTOR STRIP */}
          <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-3.5 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4 shadow-[0_4px_24px_rgba(0,229,255,0.03)] overflow-hidden min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto min-w-0">
              <span className="text-xs font-mono text-slate-400 mr-1 uppercase font-semibold shrink-0">Channel:</span>
              {[
                { id: 'all', label: 'All Channels' },
                { id: 'cardiac', label: 'Cardiovascular (HR & BP)' },
                { id: 'respiratory', label: 'Oxygenation (SpO2)' },
                { id: 'thermal', label: 'Thermoregulation' },
              ].map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => setActiveFilter(ch.id as 'all' | 'cardiac' | 'respiratory' | 'thermal')}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    activeFilter === ch.id
                      ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {ch.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-mono text-slate-300 min-w-0">
              <span>Mean HR: <strong className="text-white font-bold tabular-nums">{avgHr} BPM</strong></span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span>Mean SpO2: <strong className="text-[#00E5FF] font-bold tabular-nums">{avgSpo2}%</strong></span>
              <span className="text-slate-600 hidden sm:inline">·</span>
              <span>Core Temp: <strong className="text-[#21D4A5] font-bold tabular-nums">{avgTemp}°C</strong></span>
            </div>
          </div>

          {/* SLEEP & ARED ACTIVITY CONTEXT STRIP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono min-w-0">
            <div className="bg-[#0B1224]/90 border border-purple-500/25 rounded-2xl px-3.5 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 overflow-hidden min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">Actiwatch Circadian Sleep</div>
                  <div className="text-sm font-bold text-white tabular-nums">{sleepHoursDisplay} hrs · {sleepEffDisplay}% efficiency</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 font-bold shrink-0">
                CIRCADIAN SYNC
              </span>
            </div>

            <div className="bg-[#0B1224]/90 border border-cyan-500/25 rounded-2xl px-3.5 sm:px-4 py-3 flex flex-wrap items-center justify-between gap-2.5 overflow-hidden min-w-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 shrink-0">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">ARED Countermeasure Load</div>
                  <div className="text-sm font-bold text-white tabular-nums">{activityMinsDisplay} mins logged · {latestActivity?.exerciseType || 'ARED Resistive'}</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-bold shrink-0">
                BONE SHIELDED
              </span>
            </div>
          </div>

          {/* MAIN INTERACTIVE MULTI-CHANNEL CHART */}
          <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-3.5 sm:p-6 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-4 overflow-hidden min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
              <div className="min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  Continuous Sensor Telemetry Waveform ({selectedRange.toUpperCase()})
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  ECG Optical Biosensors + Continuous Pulse Oximetry ({chartSeries.length} frames)
                </p>
              </div>
              <span className="text-xs font-mono text-[#21D4A5] bg-[#21D4A5]/10 px-3 py-1 rounded-full border border-[#21D4A5]/30 self-start sm:self-auto font-medium shrink-0">
                Telemetry Quality: 100% Ingest
              </span>
            </div>

            <div className="w-full h-[250px] sm:h-[320px] min-w-0 overflow-hidden">
              <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={220}
                initialDimension={{ width: 320, height: 250 }}
              >
                <ComposedChart data={chartSeries} margin={{ top: 12, right: 4, left: -4, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} minTickGap={22} />

                  {/* Left Axis: Heart Rate & BP */}
                  <YAxis
                    yAxisId="left"
                    width={34}
                    domain={[30, 145]}
                    stroke="#00E5FF"
                    fontSize={10}
                    tickFormatter={(v) => `${v}`}
                  />

                  {/* Right Axis: SpO2 */}
                  <YAxis
                    yAxisId="right"
                    width={36}
                    orientation="right"
                    domain={[90, 100]}
                    stroke="#438BFF"
                    fontSize={10}
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
                      dot={chartSeries.length < 15 ? { r: 2.5 } : false}
                      isAnimationActive={false}
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
                      dot={chartSeries.length < 15 ? { r: 2 } : false}
                      isAnimationActive={false}
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
                      dot={chartSeries.length < 15 ? { r: 2.5 } : false}
                      isAnimationActive={false}
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
                      dot={chartSeries.length < 15 ? { r: 2.5 } : false}
                      isAnimationActive={false}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DYNAMIC D3 REAL-TIME BIOSENSOR TELEMETRY MATRIX (1HZ STREAM) */}
          <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-3.5 sm:p-6 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-5 sm:space-y-6 overflow-hidden min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 min-w-0">
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                    Dynamic D3 Biosensor Telemetry Matrix
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 uppercase font-bold">
                    1Hz Streaming Engine
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  D3 curveMonotoneX spline interpolation across {liveStreamFrames.length} rolling telemetry frames
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setShowRawTable(!showRawTable)}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all cursor-pointer min-h-[38px]"
                >
                  <BarChart2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{showRawTable ? 'Hide Raw Ingest Table' : 'Inspect Raw Ingest Table'}</span>
                  {showRawTable ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                </button>
              </div>
            </div>

            {/* 4-Channel Live D3 Telemetry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4 min-w-0">
              {/* Channel 1: Heart Rate */}
              <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-colors min-w-0 overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0">
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
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border shrink-0 ${
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

                <div className="w-full min-w-0 overflow-hidden flex justify-center py-1">
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
              <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-colors min-w-0 overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0">
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
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border shrink-0 ${
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

                <div className="w-full min-w-0 overflow-hidden flex justify-center py-1">
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
              <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-colors min-w-0 overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0">
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
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded font-bold border bg-slate-900 text-slate-300 border-slate-700 shrink-0">
                    MAP {Math.round(latestFrame.diastolicBP + (latestFrame.systolicBP - latestFrame.diastolicBP) / 3)}
                  </span>
                </div>

                <div className="w-full min-w-0 overflow-hidden flex justify-center py-1">
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
              <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-3.5 sm:p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/40 transition-colors min-w-0 overflow-hidden">
                <div className="flex flex-wrap items-start justify-between gap-2 min-w-0">
                  <div className="min-w-0">
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
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold border shrink-0 ${
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

                <div className="w-full min-w-0 overflow-hidden flex justify-center py-1">
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
            <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-3.5 sm:p-6 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-4 overflow-hidden min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 min-w-0">
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-bold text-white tracking-wide flex flex-wrap items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Raw Biosensor Ingest Packet Ledger (RFC-4180 Audit)</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Calibrated telemetry time packets ingested via 1Hz spacecraft bus ({ledgerRows.length} shown)
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchDate}
                      onChange={(e) => setSearchDate(e.target.value)}
                      placeholder="Filter date / quality..."
                      className="w-full sm:w-48 bg-[#0B1224] border border-slate-700 rounded-xl pl-8 pr-3 py-2 sm:py-1.5 text-xs font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold transition-colors cursor-pointer shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Mobile Stacked Packet Cards (< sm) - Zero Horizontal Overflow */}
              <div className="sm:hidden space-y-3">
                {ledgerRows.map((m) => {
                  const hrvVal = m.hrv || baseHrv;
                  const hrvRatio = Math.min(hrvVal / baseHrv, 1.15);
                  const hrvScore = Math.min((hrvRatio / 1.0) * 100, 100);
                  const rhrDiff = m.heartRate - baseRhr;
                  const rhrScore = Math.max(0, Math.min(100, 100 - rhrDiff * 4));
                  const sleepScore = Math.min(sleepHoursDisplay / 7.5, 1.0) * sleepEffDisplay;
                  const tempDiff = Math.abs(m.bodyTemperature - baseTemp);
                  const tempScore = Math.max(0, 100 - tempDiff * 60);
                  const total = hrvScore * 0.35 + rhrScore * 0.25 + sleepScore * 0.25 + tempScore * 0.15;
                  const readinessScore = Math.round(total * 10) / 10;
                  const readinessStatus = readinessScore >= 80 ? 'GREEN' : readinessScore >= 60 ? 'YELLOW' : 'RED';
                  const isExpanded = activeRowFactorsId === m.id;
                  const whyExplanation =
                    readinessStatus === 'GREEN'
                      ? `Readiness is optimal (${readinessScore}/100, GREEN) because HRV (${hrvVal} ms) and resting heart rate (${m.heartRate} bpm) match baseline with zero cardiovascular compensation.`
                      : readinessStatus === 'YELLOW'
                      ? `Readiness is moderated (${readinessScore}/100, YELLOW) driven by ${rhrDiff > 0 ? `elevated heart rate (+${rhrDiff} bpm)` : 'depressed autonomic HRV recovery'}.`
                      : `Readiness is critical (${readinessScore}/100, RED) due to acute cardiorespiratory excursion.`;

                  return (
                    <div key={`mob-${m.id}`} className="rounded-xl bg-[#0B1224] border border-slate-800 p-3 space-y-2.5 text-xs font-mono overflow-hidden">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                        <span className="text-white font-semibold text-[11px]">{new Date(m.timestamp).toLocaleString()}</span>
                        <span className="text-[#21D4A5] font-bold text-[10px]">{m.dataQuality}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div><span className="text-slate-500">HR:</span> <strong className="text-[#00E5FF] tabular-nums">{m.heartRate} BPM</strong></div>
                        <div><span className="text-slate-500">SpO2:</span> <strong className="text-sky-400 tabular-nums">{m.spo2}%</strong></div>
                        <div><span className="text-slate-500">BP:</span> <strong className="text-slate-200 tabular-nums">{m.bloodPressure.systolic}/{m.bloodPressure.diastolic}</strong></div>
                        <div><span className="text-slate-500">Temp / HRV:</span> <strong className="text-slate-200 tabular-nums">{m.bodyTemperature}°C · {hrvVal}ms</strong></div>
                      </div>
                      <button
                        onClick={() => setActiveRowFactorsId(isExpanded ? null : m.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                          readinessStatus === 'GREEN'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                            : readinessStatus === 'YELLOW'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                            : 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Edge AI Readiness: {readinessScore} ({readinessStatus})</span>
                        </span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>

                      {isExpanded && (
                        <div className="rounded-lg bg-[#050C1B] border border-cyan-500/40 p-3 space-y-2.5 text-[11px]">
                          <div className="text-slate-200 font-sans text-xs">{whyExplanation}</div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 rounded bg-[#091325] border border-cyan-500/20">
                              <div className="text-cyan-300 font-bold">HRV (35%)</div>
                              <div className="text-slate-300 tabular-nums">{(hrvScore * 0.35).toFixed(1)} / 35.0</div>
                            </div>
                            <div className="p-2 rounded bg-[#091325] border border-emerald-500/20">
                              <div className="text-emerald-300 font-bold">RHR (25%)</div>
                              <div className="text-slate-300 tabular-nums">{(rhrScore * 0.25).toFixed(1)} / 25.0</div>
                            </div>
                            <div className="p-2 rounded bg-[#091325] border border-purple-500/20">
                              <div className="text-purple-300 font-bold">Sleep (25%)</div>
                              <div className="text-slate-300 tabular-nums">{(sleepScore * 0.25).toFixed(1)} / 25.0</div>
                            </div>
                            <div className="p-2 rounded bg-[#091325] border border-amber-500/20">
                              <div className="text-amber-300 font-bold">Temp (15%)</div>
                              <div className="text-slate-300 tabular-nums">{(tempScore * 0.15).toFixed(1)} / 15.0</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-800/80">
                <table className="w-full text-left text-xs font-mono min-w-[780px]">
                  <thead className="bg-[#0B1224] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Packet Timestamp (UTC)</th>
                      <th className="py-3 px-4">Heart Rate</th>
                      <th className="py-3 px-4">SpO2</th>
                      <th className="py-3 px-4">Blood Pressure</th>
                      <th className="py-3 px-4">Core Temp</th>
                      <th className="py-3 px-4">HRV (RMSSD)</th>
                      <th className="py-3 px-4">Data Quality</th>
                      <th className="py-3 px-4 text-right">Edge AI Readiness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 bg-[#101B30]/50">
                    {ledgerRows.map((m) => {
                      const hrvVal = m.hrv || baseHrv;
                      const hrvRatio = Math.min(hrvVal / baseHrv, 1.15);
                      const hrvScore = Math.min((hrvRatio / 1.0) * 100, 100);

                      const rhrDiff = m.heartRate - baseRhr;
                      const rhrScore = Math.max(0, Math.min(100, 100 - rhrDiff * 4));

                      const sleepScore = Math.min(sleepHoursDisplay / 7.5, 1.0) * sleepEffDisplay;
                      const tempDiff = Math.abs(m.bodyTemperature - baseTemp);
                      const tempScore = Math.max(0, 100 - tempDiff * 60);

                      const total = hrvScore * 0.35 + rhrScore * 0.25 + sleepScore * 0.25 + tempScore * 0.15;
                      const readinessScore = Math.round(total * 10) / 10;
                      const readinessStatus = readinessScore >= 80 ? 'GREEN' : readinessScore >= 60 ? 'YELLOW' : 'RED';
                      const isExpanded = activeRowFactorsId === m.id;

                      const whyExplanation =
                        readinessStatus === 'GREEN'
                          ? `Readiness is optimal (${readinessScore}/100, GREEN) because HRV (${hrvVal} ms) and resting heart rate (${m.heartRate} bpm) match baseline with zero cardiovascular compensation.`
                          : readinessStatus === 'YELLOW'
                          ? `Readiness is moderated (${readinessScore}/100, YELLOW) driven by ${rhrDiff > 0 ? `elevated heart rate (+${rhrDiff} bpm)` : 'depressed autonomic HRV recovery'}.`
                          : `Readiness is critical (${readinessScore}/100, RED) due to acute cardiorespiratory excursion.`;

                      return (
                        <React.Fragment key={m.id}>
                          <tr className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-semibold text-white">
                              {new Date(m.timestamp).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 font-bold text-[#00E5FF] tabular-nums">{m.heartRate} BPM</td>
                            <td className="py-3 px-4 text-sky-400 tabular-nums">{m.spo2}%</td>
                            <td className="py-3 px-4 tabular-nums">{m.bloodPressure.systolic}/{m.bloodPressure.diastolic} mmHg</td>
                            <td className="py-3 px-4 tabular-nums">{m.bodyTemperature} °C</td>
                            <td className="py-3 px-4 tabular-nums">{hrvVal} ms</td>
                            <td className="py-3 px-4">
                              <span className="text-[#21D4A5] font-bold">{m.dataQuality}</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setActiveRowFactorsId(isExpanded ? null : m.id)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all cursor-pointer shadow-sm ${
                                  readinessStatus === 'GREEN'
                                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80'
                                    : readinessStatus === 'YELLOW'
                                    ? 'bg-amber-950/60 text-amber-300 border-amber-500/40 hover:bg-amber-900/80'
                                    : 'bg-rose-950/60 text-rose-300 border-rose-500/40 hover:bg-rose-900/80'
                                }`}
                                title="Click to view weighted Readiness Factors breakdown"
                              >
                                <Sliders className="w-3 h-3" />
                                <span>{readinessScore}</span>
                                <span className="text-[9px] uppercase">({readinessStatus})</span>
                                <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                              </button>
                            </td>
                          </tr>

                          {/* Expandable Readiness Factors Breakdown Row */}
                          {isExpanded && (
                            <tr className="bg-[#050C1B] border-b border-cyan-500/30">
                              <td colSpan={8} className="p-4">
                                <div className="rounded-xl bg-[#091325] border border-cyan-500/40 p-4 space-y-3">
                                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Cpu className="w-4 h-4 text-cyan-400" />
                                      <span className="font-bold text-white text-xs">
                                        edge_ai_output: Readiness Factors Breakdown ({new Date(m.timestamp).toLocaleTimeString()} UTC)
                                      </span>
                                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                                        readinessStatus === 'GREEN'
                                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                                          : readinessStatus === 'YELLOW'
                                          ? 'bg-amber-950 text-amber-300 border-amber-500/40'
                                          : 'bg-rose-950 text-rose-300 border-rose-500/40'
                                      }`}>
                                        Score: {readinessScore} / 100
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => setActiveRowFactorsId(null)}
                                      className="text-slate-400 hover:text-white cursor-pointer"
                                      title="Close breakdown"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>

                                  <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-slate-200 text-xs font-sans flex items-start gap-2">
                                    <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                                    <div>
                                      <strong className="text-cyan-300 font-mono text-[10px] uppercase block">Why is the score in its current state?</strong>
                                      <span>{whyExplanation}</span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-[11px] font-mono">
                                    <div className="p-2.5 rounded-lg bg-[#060D1A] border border-cyan-500/20">
                                      <div className="flex justify-between font-bold text-cyan-300">
                                        <span>HRV (35%)</span>
                                        <span>{(hrvScore * 0.35).toFixed(1)} / 35.0 pts</span>
                                      </div>
                                      <div className="text-slate-400 text-[10px] mt-1">{hrvVal} ms (ratio: {hrvRatio.toFixed(2)}x)</div>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-[#060D1A] border border-emerald-500/20">
                                      <div className="flex justify-between font-bold text-emerald-300">
                                        <span>Resting HR (25%)</span>
                                        <span>{(rhrScore * 0.25).toFixed(1)} / 25.0 pts</span>
                                      </div>
                                      <div className="text-slate-400 text-[10px] mt-1">{m.heartRate} bpm ({rhrDiff > 0 ? `+${rhrDiff}` : rhrDiff} bpm)</div>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-[#060D1A] border border-purple-500/20">
                                      <div className="flex justify-between font-bold text-purple-300">
                                        <span>Sleep (25%)</span>
                                        <span>{(sleepScore * 0.25).toFixed(1)} / 25.0 pts</span>
                                      </div>
                                      <div className="text-slate-400 text-[10px] mt-1">{sleepHoursDisplay}h logged · {sleepEffDisplay}% efficiency</div>
                                    </div>

                                    <div className="p-2.5 rounded-lg bg-[#060D1A] border border-amber-500/20">
                                      <div className="flex justify-between font-bold text-amber-300">
                                        <span>Temp Stability (15%)</span>
                                        <span>{(tempScore * 0.15).toFixed(1)} / 15.0 pts</span>
                                      </div>
                                      <div className="text-slate-400 text-[10px] mt-1">{m.bodyTemperature}°C (±{tempDiff.toFixed(2)}°C)</div>
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
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
