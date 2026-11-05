import React, { useRef, useEffect, useId } from 'react';
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
  const svgRef = useRef<SVGSVGElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const areaRef = useRef<SVGPathElement | null>(null);
  const dotRef = useRef<SVGCircleElement | null>(null);
  const pulseRef = useRef<SVGCircleElement | null>(null);

  const uniqueId = useId().replace(/:/g, '');
  const gradientId = `spark-grad-${uniqueId}`;
  const areaGradId = `spark-area-${uniqueId}`;

  // Extract raw numerical values
  const values: number[] = data.map((d) => (typeof d === 'number' ? d : d.value));
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

  useEffect(() => {
    if (!svgRef.current || values.length === 0) return;

    // Compute scales
    const extent = d3.extent(values) as [number, number];
    const dataMin = minDomain !== undefined ? minDomain : (extent[0] ?? 0);
    const dataMax = maxDomain !== undefined ? maxDomain : (extent[1] ?? 100);
    const domainPadding = (dataMax - dataMin) * 0.1 || 1;

    const xScale = d3
      .scaleLinear()
      .domain([0, Math.max(values.length - 1, 1)])
      .range([margin.left, margin.left + innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain([dataMin - domainPadding, dataMax + domainPadding])
      .range([margin.top + innerHeight, margin.top]);

    // Generator for curve
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

    const linePath = lineGenerator(values) || '';
    const areaPath = areaGenerator(values) || '';

    // Update path attributes smoothly
    if (pathRef.current) {
      d3.select(pathRef.current)
        .transition()
        .duration(350)
        .ease(d3.easeCubicOut)
        .attr('d', linePath)
        .attr('stroke', strokeColor);
    }

    if (areaRef.current && showArea) {
      d3.select(areaRef.current)
        .transition()
        .duration(350)
        .ease(d3.easeCubicOut)
        .attr('d', areaPath);
    }

    // Position latest glowing point
    const lastIdx = values.length - 1;
    const lastX = xScale(lastIdx);
    const lastY = yScale(values[lastIdx]);

    if (dotRef.current && showLatestPoint) {
      d3.select(dotRef.current)
        .transition()
        .duration(350)
        .ease(d3.easeCubicOut)
        .attr('cx', lastX)
        .attr('cy', lastY)
        .attr('fill', strokeColor);
    }

    if (pulseRef.current && showLatestPoint) {
      d3.select(pulseRef.current)
        .transition()
        .duration(350)
        .ease(d3.easeCubicOut)
        .attr('cx', lastX)
        .attr('cy', lastY)
        .attr('stroke', strokeColor);
    }
  }, [values, width, height, strokeColor, minDomain, maxDomain, showArea, showLatestPoint]);

  return (
    <div className={`relative flex flex-col select-none overflow-hidden ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-[11px] font-mono mb-1">
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
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto overflow-visible transform-gpu will-change-transform"
        style={{ maxHeight: height }}
      >
        <defs>
          {/* Linear gradient along line stroke */}
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
            <stop offset="70%" stopColor={strokeColor} stopOpacity={0.85} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={1} />
          </linearGradient>

          {/* Area gradient fill below curve */}
          <linearGradient id={areaGradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.25} />
            <stop offset="85%" stopColor={strokeColor} stopOpacity={0.03} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
          </linearGradient>
        </defs>

        {/* Tactical subtle grid lines */}
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

        {/* Gradient Area Fill */}
        {showArea && (
          <path
            ref={areaRef}
            fill={`url(#${areaGradId})`}
            className="pointer-events-none transition-all duration-300"
          />
        )}

        {/* Sparkline Curve */}
        <path
          ref={pathRef}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="drop-shadow-[0_0_8px_rgba(0,229,255,0.4)] transition-all duration-300"
        />

        {/* Animated Pulsing Dot for Latest Point */}
        {showLatestPoint && values.length > 0 && (
          <g>
            <circle
              ref={pulseRef}
              r="6.5"
              fill="none"
              strokeWidth="1.5"
              className="animate-ping opacity-75"
            />
            <circle
              ref={dotRef}
              r="3.5"
              className="drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
