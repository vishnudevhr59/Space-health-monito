import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  TrendingUp,
  AlertCircle,
  HelpCircle,
  Activity,
  Moon,
  Zap,
  Radio,
  Dna,
  RefreshCw,
  Info,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { AstronautProfile } from '../types';

interface ContextExplorerProps {
  astronaut: AstronautProfile;
}

export const ContextExplorer: React.FC<ContextExplorerProps> = ({ astronaut }) => {
  const [metricA, setMetricA] = useState<string>('sleepDurationHours');
  const [metricB, setMetricB] = useState<string>('heartRate');
  const [windowDays, setWindowDays] = useState<number>(7);
  const [correlationData, setCorrelationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCorrelation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/context/correlation?astronautId=${astronaut.id}&metricA=${metricA}&metricB=${metricB}&windowDays=${windowDays}`
      );
      if (res.ok) {
        const data = await res.json();
        setCorrelationData(data);
      }
    } catch (err) {
      console.warn('Failed to fetch correlation analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCorrelation();
  }, [astronaut.id, metricA, metricB, windowDays]);

  const metricOptionsA = [
    { id: 'sleepDurationHours', label: 'Sleep Duration (Hours)', unit: 'Hours', icon: Moon },
    { id: 'cabinCO2', label: 'Habitat CO2 (mmHg)', unit: 'mmHg', icon: Radio },
    { id: 'exerciseMinutes', label: 'ARED Exercise Duration (Min)', unit: 'Min', icon: Zap },
  ];

  const metricOptionsB = [
    { id: 'heartRate', label: 'Resting Heart Rate (BPM)', unit: 'BPM', icon: Activity },
    { id: 'hrv', label: 'Heart Rate Variability (ms RMSSD)', unit: 'ms', icon: Dna },
    { id: 'bodyTemperature', label: 'Core Body Temperature (°C)', unit: '°C', icon: TrendingUp },
  ];

  const r = correlationData?.pearsonCorrelationR ?? 0;
  const pairedCount = correlationData?.pairedObservationCount ?? 0;

  return (
    <div className="p-6 rounded-2xl bg-[#0B1224] border border-[#00E5FF]/20 space-y-6 shadow-xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#00E5FF] font-semibold block">
            Multi-System Spaceflight Correlation Engine
          </span>
          <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2 mt-0.5">
            <GitCompare className="w-5 h-5 text-[#00E5FF]" />
            CONTEXTUAL ANALYSIS EXPLORER
          </h3>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400">Analysis Window:</span>
          {[7, 14, 30].map((days) => (
            <button
              key={days}
              onClick={() => setWindowDays(days)}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                windowDays === days
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              {days} Sol
            </button>
          ))}
        </div>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Metric A Selector */}
        <div className="p-3.5 rounded-xl bg-[#101B30] border border-slate-800 space-y-2">
          <label className="text-[11px] font-mono text-slate-400 block uppercase font-semibold">
            Input Variable A (Environmental / Behavioral Context):
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {metricOptionsA.map((opt) => {
              const Icon = opt.icon;
              const isSelected = metricA === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setMetricA(opt.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#00E5FF]/20 text-white border border-[#00E5FF]/40 font-bold'
                      : 'bg-[#050816] text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#00E5FF]' : 'text-slate-500'}`} />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Metric B Selector */}
        <div className="p-3.5 rounded-xl bg-[#101B30] border border-slate-800 space-y-2">
          <label className="text-[11px] font-mono text-slate-400 block uppercase font-semibold">
            Input Variable B (Physiological Response):
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {metricOptionsB.map((opt) => {
              const Icon = opt.icon;
              const isSelected = metricB === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setMetricB(opt.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono transition-all text-left cursor-pointer ${
                    isSelected
                      ? 'bg-[#21D4A5]/20 text-white border border-[#21D4A5]/40 font-bold'
                      : 'bg-[#050816] text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#21D4A5]' : 'text-slate-500'}`} />
                  <span className="truncate">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Statistical Outcome Card */}
      <div className="p-4 rounded-xl bg-[#050816] border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Statistical Correlation</span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className={`text-xl font-bold ${Math.abs(r) >= 0.5 ? 'text-[#00E5FF]' : 'text-slate-200'}`}>
              r = {r > 0 ? `+${r}` : r}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">{correlationData?.interpretation || 'Evaluating...'}</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Aligned Sample Size</span>
          <span className="text-xl font-bold text-white block mt-0.5">{pairedCount} Paired Sols</span>
          <span className="text-[11px] text-emerald-400 block mt-0.5">Zero Clock Drift / Mismatches</span>
        </div>

        <div>
          <span className="text-[10px] text-slate-500 uppercase block">Mathematical Method</span>
          <span className="text-xs font-bold text-slate-200 block mt-0.5">Pearson Product-Moment</span>
          <span className="text-[10px] text-slate-500 block mt-0.5">Temporal alignment: 24h diurnal cycle</span>
        </div>
      </div>

      {/* Dual Axis Time Series Chart */}
      <div className="p-4 rounded-xl bg-[#050816] border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300 font-semibold">Dual-Axis Temporal Alignment Overlay</span>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="flex items-center gap-1.5 text-[#00E5FF]">
              <span className="w-2.5 h-0.5 bg-[#00E5FF]" /> Variable A (Left Axis)
            </span>
            <span className="flex items-center gap-1.5 text-[#21D4A5]">
              <span className="w-2.5 h-0.5 bg-[#21D4A5]" /> Variable B (Right Axis)
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-[#00E5FF] animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={correlationData?.alignedData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis yAxisId="left" stroke="#00E5FF" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <YAxis yAxisId="right" orientation="right" stroke="#21D4A5" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0B1224',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="valA"
                  name="Variable A"
                  stroke="#00E5FF"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#00E5FF' }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="valB"
                  name="Variable B"
                  stroke="#21D4A5"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#21D4A5' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* MANDATORY ETHICAL NON-CAUSATION DISCLAIMER */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 font-mono block">SCIENTIFIC RESPONSIBILITY DISCLAIMER:</strong>
          <p className="text-[11px] leading-relaxed">
            {correlationData?.disclaimer ||
              'Statistical correlation does NOT establish clinical causation. In spaceflight, cardiovascular adaptations and sleep shifts frequently co-occur under microgravity cephalad fluid redistribution and environmental acoustic stressors.'}
          </p>
        </div>
      </div>

    </div>
  );
};
