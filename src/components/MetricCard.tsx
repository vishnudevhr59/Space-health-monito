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
  icon,
  lastUpdated,
}) => {
  const statusColor = {
    nominal: 'text-[#21D4A5] bg-[#21D4A5]/10 border-[#21D4A5]/30',
    warning: 'text-[#FFB547] bg-[#FFB547]/10 border-[#FFB547]/30',
    critical: 'text-[#FF5368] bg-[#FF5368]/10 border-[#FF5368]/30',
    info: 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30',
  }[status];

  const statusGlyph = {
    nominal: '●',
    warning: '▲',
    critical: '✖',
    info: '◆',
  }[status];

  const sparklineStroke = {
    nominal: '#21D4A5',
    warning: '#FFB547',
    critical: '#FF5368',
    info: '#00E5FF',
  }[status];

  // Fallback sparkline if none provided
  const points = sparklineData && sparklineData.length >= 4 
    ? sparklineData 
    : [30, 45, 38, 55, 48, 62, 58, 65];

  return (
    <div className="group relative rounded-2xl p-4.5 bg-[#101B30]/85 backdrop-blur-md border border-[#00E5FF]/15 hover:border-[#00E5FF]/45 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_-5px_rgba(0,229,255,0.18)] hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      
      {/* Subtle corner tech accent */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none opacity-30 group-hover:opacity-80 transition-opacity">
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full text-[#00E5FF]">
          <path d="M0 0 L32 0 L32 32" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Header: Label + Status Indicator */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {icon && (
            <div className="p-1 rounded-lg bg-[#0B1224] text-[#00E5FF] border border-[#00E5FF]/20">
              {icon}
            </div>
          )}
          <span className="text-[11px] uppercase tracking-wider font-mono text-slate-300 font-semibold truncate">
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
