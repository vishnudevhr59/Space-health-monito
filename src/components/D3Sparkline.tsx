import React, { useMemo, useId } from 'react';
import * as d3 from 'd3';

export interface SparklinePoint {
  value: number;
  timestamp?: string | number;
}

interface D3SparklineProps {
  data: number[] | SparklinePoint[];
  width?: number;
  height?: number;
  color?: string; // e.g. '#00E5FF' | '#21D4A5' | '#FFB547' | '#FF5368'
  minDomain?: number;
  maxDomain?: number;
  unit?: string;
  label?: string;
  showArea?: boolean;
  showGrid?: boolean;
  showLatestPoint?: boolean;
  thresholdWarning?: number;
  thresholdCritical?: number;
  className?: string;
}

export const D3Sparkline: React.FC<D3SparklineProps> = ({
  data,
  width = 240,
  height = 68,
  color = '#00E5FF',
  minDomain,
  maxDomain,
  unit = '',
  label,
  showArea = true,
  showGrid = true,
  showLatestPoint = true,
  thresholdWarning,
  thresholdCritical,
  className = '',
}) => {
  const uniqueId = useId().replace(/:/g, '');
  const gradientId = `spark-grad-${uniqueId}`;
  const areaGradId = `spark-area-${uniqueId}`;

  // Extract raw numerical values safely, filtering out NaN or undefined
  const safeData = Array.isArray(data) ? data : [];
  const values: number[] = safeData
    .map((d) => (typeof d === 'number' ? d : d?.value))
    .filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  const latestValue = values.length > 0 ? values[values.length - 1] : 0;

  // Determine dynamic color based on thresholds if provided
  let strokeColor = color;
  if (thresholdCritical !== undefined && latestValue >= thresholdCritical) {
    strokeColor = '#FF5368'; // Rose
  } else if (thresholdWarning !== undefined && latestValue >= thresholdWarning) {
    strokeColor = '#FFB547'; // Amber
  }

  const margin = { top: 6, right: 10, bottom: 6, left: 6 };
  const innerWidth = Math.max(width - margin.left - margin.right, 40);
  const innerHeight = Math.max(height - margin.top - margin.bottom, 20);

  const { linePath, areaPath, lastX, lastY } = useMemo(() => {
    if (values.length === 0) {
      return { linePath: '', areaPath: '', lastX: margin.left, lastY: margin.top + innerHeight / 2 };
    }

    const plotValues = values.length === 1 ? [values[0], values[0]] : values;
    const extent = d3.extent(plotValues) as [number, number];
    const dataMin = minDomain !== undefined ? minDomain : (extent[0] ?? 0);
    const dataMax = maxDomain !== undefined ? maxDomain : (extent[1] ?? 100);
    const domainPadding = (dataMax - dataMin) * 0.1 || 1;

    const xScale = d3
      .scaleLinear()
      .domain([0, Math.max(plotValues.length - 1, 1)])
      .range([margin.left, margin.left + innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([dataMin - domainPadding, dataMax + domainPadding])
      .range([margin.top + innerHeight, margin.top]);

    const lineGenerator = d3
      .line<number>()
      .x((_, i) => xScale(i))
      .y((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    const areaGenerator = d3
      .area<number>()
      .x((_, i) => xScale(i))
      .y0(margin.top + innerHeight)
      .y1((d) => yScale(d))
      .curve(d3.curveMonotoneX);

    const lastIdx = plotValues.length - 1;
    return {
      linePath: lineGenerator(plotValues) || '',
      areaPath: areaGenerator(plotValues) || '',
      lastX: xScale(lastIdx),
      lastY: yScale(plotValues[lastIdx]),
    };
  }, [values, innerWidth, innerHeight, margin.left, margin.top, minDomain, maxDomain]);

  return (
    <div className={`relative flex flex-col select-none overflow-hidden w-full min-w-0 ${className}`}>
      {label && (
        <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-mono mb-1">
          <span className="text-slate-400 font-bold uppercase tracking-wider">{label}</span>
          <span className="font-extrabold tabular-nums" style={{ color: strokeColor }}>
            {typeof latestValue === 'number' && Number.isInteger(latestValue)
              ? latestValue
              : latestValue.toFixed(1)}{' '}
            <span className="text-[9px] text-slate-500 font-normal">{unit}</span>
          </span>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full max-w-full h-auto overflow-hidden block"
        style={{ maxHeight: height }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
            <stop offset="70%" stopColor={strokeColor} stopOpacity={0.85} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={1} />
          </linearGradient>

          <linearGradient id={areaGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="85%" stopColor={strokeColor} stopOpacity={0.03} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {showGrid && (
          <g className="opacity-20 stroke-slate-700" strokeDasharray="2,3">
            <line
              x1={margin.left}
              y1={margin.top + innerHeight * 0.25}
              x2={margin.left + innerWidth}
              y2={margin.top + innerHeight * 0.25}
              strokeWidth="0.75"
            />
            <line
              x1={margin.left}
              y1={margin.top + innerHeight * 0.75}
              x2={margin.left + innerWidth}
              y2={margin.top + innerHeight * 0.75}
              strokeWidth="0.75"
            />
          </g>
        )}

        {showArea && areaPath && (
          <path
            d={areaPath}
            fill={`url(#${areaGradId})`}
            className="pointer-events-none transition-all duration-300"
          />
        )}

        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(0,229,255,0.4)] transition-all duration-300"
          />
        )}

        {showLatestPoint && values.length > 0 && (
          <g>
            <circle
              cx={lastX}
              cy={lastY}
              r="6.5"
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.5"
              className="animate-ping opacity-75"
            />
            <circle
              cx={lastX}
              cy={lastY}
              r="3.5"
              fill={strokeColor}
              className="drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
