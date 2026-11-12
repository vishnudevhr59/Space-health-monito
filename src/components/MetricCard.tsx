import React from 'react';
import { D3Sparkline } from './D3Sparkline';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'stable';
  trendLabel?: string;
  historicalComparison?: string;
  status?: 'nominal' | 'warning' | 'critical' | 'info';
  statusText?: string;
  secondaryInfo?: string;
  sparklineData?: number[];
  theme?: 'danger' | 'space' | 'health' | 'purple' | 'amber' | 'cyan';
  icon?: React.ReactNode;
  lastUpdated?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subValue,
  trend,
  trendLabel,
  historicalComparison,
  status = 'nominal',
  statusText,
  secondaryInfo,
  sparklineData,
  theme,
  icon,
  lastUpdated,
}) => {
  // Color configuration:
  // Red for Danger/Alerts, Blue for Space/Physical, Green for Health Suggestions, Purple for Neuro/Sleep, Amber for Warnings
  const themeCardBorder = {
    danger: 'border-rose-500/40 bg-gradient-to-b from-rose-950/30 to-[#0A1024] shadow-[0_0_20px_rgba(244,63,94,0.15)] hover:border-rose-400',
    space: 'border-blue-500/40 bg-gradient-to-b from-blue-950/30 to-[#0A1024] shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:border-blue-400',
    health: 'border-emerald-500/40 bg-gradient-to-b from-emerald-950/30 to-[#0A1024] shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:border-emerald-400',
    purple: 'border-purple-500/40 bg-gradient-to-b from-purple-950/30 to-[#0A1024] shadow-[0_0_20px_rgba(168,85,247,0.15)] hover:border-purple-400',
    amber: 'border-amber-500/40 bg-gradient-to-b from-amber-950/30 to-[#0A1024] shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:border-amber-400',
    cyan: 'border-cyan-500/40 bg-gradient-to-b from-cyan-950/30 to-[#0A1024] shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:border-cyan-400',
  }[theme || (status === 'critical' ? 'danger' : status === 'warning' ? 'amber' : 'cyan')];

  const statusColor = {
    nominal: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/40',
    warning: 'text-amber-300 bg-amber-950/40 border-amber-500/40',
    critical: 'text-rose-400 bg-rose-950/50 border-rose-500/50 animate-pulse',
    info: 'text-cyan-300 bg-cyan-950/40 border-cyan-500/40',
  }[status];

  const statusGlyph = {
    nominal: '●',
    warning: '▲',
    critical: '✖',
    info: '◆',
  }[status];

  const sparklineStroke = {
    nominal: '#10B981',
    warning: '#F59E0B',
    critical: '#F43F5E',
    info: '#06B6D4',
  }[status];

  const themeIconBox = {
    danger: 'bg-rose-950/60 text-rose-400 border-rose-500/40',
    space: 'bg-blue-950/60 text-blue-400 border-blue-500/40',
    health: 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40',
    purple: 'bg-purple-950/60 text-purple-400 border-purple-500/40',
    amber: 'bg-amber-950/60 text-amber-400 border-amber-500/40',
    cyan: 'bg-cyan-950/60 text-cyan-400 border-cyan-500/40',
  }[theme || (status === 'critical' ? 'danger' : status === 'warning' ? 'amber' : 'cyan')];

  // Fallback sparkline if none provided
  const points = sparklineData && sparklineData.length >= 4 
    ? sparklineData 
    : [30, 45, 38, 55, 48, 62, 58, 65];

  return (
    <div className={`group relative rounded-2xl p-4.5 backdrop-blur-md border transition-all duration-300 shadow-lg hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${themeCardBorder}`}>
      
      {/* Subtle corner tech accent */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-30 group-hover:opacity-80 transition-opacity">
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full text-current">
          <path d="M0 0 L32 0 L32 32" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Header: Label + Status Indicator */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <div className={`p-1.5 rounded-lg border ${themeIconBox}`}>
              {icon}
            </div>
          )}
          <span className="text-[11px] uppercase tracking-wider font-mono text-slate-200 font-bold truncate">
            {label}
          </span>
        </div>

        {statusText && (
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0 ${statusColor}`}>
            <span>{statusGlyph}</span>
            <span>{statusText}</span>
          </span>
        )}
      </div>

      {/* Measurement & Mini Sparkline Row */}
      <div className="flex items-end justify-between gap-2 my-2">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-white tracking-tight group-hover:text-[#00E5FF] transition-colors">
            {value}
          </span>
          {unit && (
            <span className="text-xs uppercase font-mono text-slate-400 font-medium">
              {unit}
            </span>
          )}
          {subValue && (
            <span className="text-xs font-mono text-slate-400 ml-1.5">
              {subValue}
            </span>
          )}
        </div>

        {/* Dynamic D3 Animated Sparkline Graph */}
        <div className="shrink-0 w-24 h-8 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
          <D3Sparkline
            data={points}
            width={96}
            height={30}
            color={sparklineStroke}
            showArea={false}
            showGrid={false}
            showLatestPoint={true}
          />
        </div>
      </div>

      {/* Bottom Historical Comparison & Telemetry Time */}
      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div>
          {historicalComparison ? (
            <span className="text-slate-300">
              {historicalComparison}
            </span>
          ) : trendLabel ? (
            <span className="flex items-center gap-1">
              {trend === 'up' && <span className="text-[#00E5FF]">▲</span>}
              {trend === 'down' && <span className="text-[#FFB547]">▼</span>}
              {trend === 'stable' && <span className="text-slate-400">―</span>}
              <span>{trendLabel}</span>
            </span>
          ) : (
            <span>Baseline nominal</span>
          )}
        </div>

        <div className="text-[10px] text-slate-500">
          {lastUpdated ? lastUpdated : secondaryInfo || 'Live 1Hz'}
        </div>
      </div>

    </div>
  );
};
