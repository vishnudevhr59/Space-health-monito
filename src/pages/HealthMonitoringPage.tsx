import React, { useState } from 'react';
import { AstronautProfile, HealthMeasurement, SleepRecord, ActivityRecord } from '../types';
import { MetricCard } from '../components/MetricCard';
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
} from 'lucide-react';
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
  const [selectedRange, setSelectedRange] = useState<'24h' | '7d' | '14d' | '30d'>('7d');
  const [activeFilter, setActiveFilter] = useState<'all' | 'cardiac' | 'respiratory' | 'thermal' | 'activity'>('all');
  const [searchDate, setSearchDate] = useState('');

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
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

        {/* Date Selector & Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
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
        </div>
      </div>

      {/* FILTER & METRIC SELECTOR STRIP */}
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

      {/* RECENT TELEMETRY RECORD TABLE */}
      <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,229,255,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Raw Biosensor Ingest Log
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Calibrated demonstration telemetry time packets
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

    </div>
  );
};
