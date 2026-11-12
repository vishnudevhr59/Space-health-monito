import React, { useState, useEffect, useRef, useId, useMemo } from 'react';
import * as d3 from 'd3';
import { telemetryStreamEngine, TelemetryFrame } from '../services/telemetryStreamEngine';
import { HealthMeasurement } from '../types';
import {
  Activity,
  Droplets,
  Gauge,
  Info,
  Clock,
  Layers,
  Sparkles,
  Zap,
  TrendingDown,
  TrendingUp,
  Maximize2,
  AlertTriangle,
} from 'lucide-react';

export interface MultiLineChartPoint {
  timestamp: Date;
  heartRate: number;
  spo2: number;
  cabinPressurePsi: number;
  severity: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  anomalyName?: string;
}

interface D3MultiLineCorrelationChartProps {
  telemetryHistory?: HealthMeasurement[];
  height?: number;
  className?: string;
}

export const D3MultiLineCorrelationChart: React.FC<D3MultiLineCorrelationChartProps> = ({
  telemetryHistory,
  height = 360,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(800);

  // Time window: 15m, 30m, 60m
  const [timeWindowMinutes, setTimeWindowMinutes] = useState<15 | 30 | 60>(60);

  // Channel visibility toggles
  const [showHeartRate, setShowHeartRate] = useState<boolean>(true);
  const [showSpo2, setShowSpo2] = useState<boolean>(true);
  const [showPressure, setShowPressure] = useState<boolean>(true);

  // Crosshair scrubber state
  const [hoveredPoint, setHoveredPoint] = useState<MultiLineChartPoint | null>(null);
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  // Unique IDs for SVG gradients
  const uniqueId = useId().replace(/:/g, '');
  const hrGradId = `hr-grad-${uniqueId}`;
  const spo2GradId = `spo2-grad-${uniqueId}`;
  const pressGradId = `press-grad-${uniqueId}`;

  // Rolling dataset state
  const [dataPoints, setDataPoints] = useState<MultiLineChartPoint[]>(() => {
    const points: MultiLineChartPoint[] = [];
    const now = Date.now();
    const currentEngine = telemetryStreamEngine.getCurrentFrame();

    // Generate 60 historical data points spaced 1 minute apart
    for (let i = 59; i >= 0; i--) {
      const t = new Date(now - i * 60 * 1000);
      // Historical variation: subtle circadian drift towards the current frame
      const progress = (60 - i) / 60;
      const baseHr = 58 + (currentEngine.heartRate - 58) * progress;
      const baseSpo2 = 98.4 + (currentEngine.spo2 - 98.4) * progress;
      const basePress = 14.7 + (currentEngine.cabinPressurePsi - 14.7) * progress;

      const jitterHr = Math.sin(i * 0.3) * 1.2;
      const jitterSpo2 = Math.cos(i * 0.4) * 0.15;
      const jitterPress = Math.sin(i * 0.2) * 0.05;

      points.push({
        timestamp: t,
        heartRate: Math.round(baseHr + jitterHr),
        spo2: +(baseSpo2 + jitterSpo2).toFixed(1),
        cabinPressurePsi: +(basePress + jitterPress).toFixed(2),
        severity: i === 0 ? currentEngine.severity : 'NOMINAL',
        anomalyName: i === 0 ? currentEngine.anomalyName : 'Nominal Operations',
      });
    }
    return points;
  });

  // Track responsive container width with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Subscribe to real-time 1Hz telemetry stream
  useEffect(() => {
    const unsubscribe = telemetryStreamEngine.subscribe((frame: TelemetryFrame) => {
      setDataPoints((prev) => {
        const now = new Date();
        const updated = [...prev];
        const last = updated[updated.length - 1];

        // If the last point is less than 5 seconds old, update it in-place for zero DOM thrash
        if (last && now.getTime() - last.timestamp.getTime() < 5000) {
          updated[updated.length - 1] = {
            timestamp: now,
            heartRate: frame.heartRate,
            spo2: frame.spo2,
            cabinPressurePsi: frame.cabinPressurePsi,
            severity: frame.severity,
            anomalyName: frame.anomalyName,
          };
          return updated;
        }

        // Otherwise push new time point and maintain max 120 points buffer
        updated.push({
          timestamp: now,
          heartRate: frame.heartRate,
          spo2: frame.spo2,
          cabinPressurePsi: frame.cabinPressurePsi,
          severity: frame.severity,
          anomalyName: frame.anomalyName,
        });

        if (updated.length > 120) {
          updated.shift();
        }
        return updated;
      });
    });

    return unsubscribe;
  }, []);

  // Filter data by selected time horizon
  const visiblePoints = useMemo(() => {
    const cutoff = Date.now() - timeWindowMinutes * 60 * 1000;
    const filtered = dataPoints.filter((p) => p.timestamp.getTime() >= cutoff);
    return filtered.length > 1 ? filtered : dataPoints.slice(-15);
  }, [dataPoints, timeWindowMinutes]);

  // Compute live multi-variate Pearson correlation coefficients
  const correlations = useMemo(() => {
    if (visiblePoints.length < 5) return { hrSpo2: 0, pressSpo2: 0, pressHr: 0 };

    const calcR = (x: number[], y: number[]) => {
      const n = x.length;
      const sumX = d3.sum(x);
      const sumY = d3.sum(y);
      const sumX2 = d3.sum(x.map((v) => v * v));
      const sumY2 = d3.sum(y.map((v) => v * v));
      const sumXY = d3.sum(x.map((v, i) => v * y[i]));

      const numerator = n * sumXY - sumX * sumY;
      const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
      if (!denominator) return 0;
      return +(numerator / denominator).toFixed(2);
    };

    const hrs = visiblePoints.map((p) => p.heartRate);
    const spo2s = visiblePoints.map((p) => p.spo2);
    const presses = visiblePoints.map((p) => p.cabinPressurePsi);

    return {
      hrSpo2: calcR(hrs, spo2s),
      pressSpo2: calcR(presses, spo2s),
      pressHr: calcR(presses, hrs),
    };
  }, [visiblePoints]);

  // Dimensions & Margins (Dual-axis layout: Left Axis for HR & SpO2, Right Axis for Cabin Pressure)
  const margin = { top: 28, right: 62, bottom: 42, left: 62 };
  const innerWidth = Math.max(containerWidth - margin.left - margin.right, 100);
  const innerHeight = Math.max(height - margin.top - margin.bottom, 120);

  // Scales
  const { xScale, yHeartRate, ySpo2, yPressure } = useMemo(() => {
    const xExt = d3.extent(visiblePoints, (d) => d.timestamp) as [Date, Date];
    const x = d3
      .scaleTime()
      .domain([xExt[0] || new Date(Date.now() - 3600000), xExt[1] || new Date()])
      .range([margin.left, margin.left + innerWidth]);

    // Heart Rate Scale: 45 to 145 BPM
    const yHr = d3
      .scaleLinear()
      .domain([45, 145])
      .range([margin.top + innerHeight, margin.top]);

    // SpO2 Scale: 84% to 101%
    const ySp = d3
      .scaleLinear()
      .domain([84, 101])
      .range([margin.top + innerHeight, margin.top]);

    // Cabin Pressure: 9.5 to 15.5 psi
    const yPress = d3
      .scaleLinear()
      .domain([9.5, 15.5])
      .range([margin.top + innerHeight, margin.top]);

    return { xScale: x, yHeartRate: yHr, ySpo2: ySp, yPressure: yPress };
  }, [visiblePoints, innerWidth, innerHeight, margin.left, margin.top]);

  // D3 Path Generators
  const hrLinePath = useMemo(() => {
    const gen = d3
      .line<MultiLineChartPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yHeartRate(d.heartRate))
      .curve(d3.curveMonotoneX);
    return gen(visiblePoints) || '';
  }, [visiblePoints, xScale, yHeartRate]);

  const spo2LinePath = useMemo(() => {
    const gen = d3
      .line<MultiLineChartPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => ySpo2(d.spo2))
      .curve(d3.curveMonotoneX);
    return gen(visiblePoints) || '';
  }, [visiblePoints, xScale, ySpo2]);

  const pressLinePath = useMemo(() => {
    const gen = d3
      .line<MultiLineChartPoint>()
      .x((d) => xScale(d.timestamp))
      .y((d) => yPressure(d.cabinPressurePsi))
      .curve(d3.curveMonotoneX);
    return gen(visiblePoints) || '';
  }, [visiblePoints, xScale, yPressure]);

  // Handle pointer hover across the interactive overlay rect
  const handlePointerMove = (e: React.PointerEvent<SVGRectElement>) => {
    const svgRect = svgRef.current?.getBoundingClientRect();
    if (!svgRect) return;

    const mouseX = e.clientX - svgRect.left;
    const mouseY = e.clientY - svgRect.top;

    if (mouseX < margin.left || mouseX > margin.left + innerWidth) {
      setHoveredPoint(null);
      setHoverCoords(null);
      return;
    }

    const hoveredDate = xScale.invert(mouseX);
    const bisect = d3.bisector<MultiLineChartPoint, Date>((d) => d.timestamp).left;
    const idx = bisect(visiblePoints, hoveredDate);

    const p0 = visiblePoints[idx - 1];
    const p1 = visiblePoints[idx];
    let closest = p0;

    if (p0 && p1) {
      closest =
        hoveredDate.getTime() - p0.timestamp.getTime() > p1.timestamp.getTime() - hoveredDate.getTime()
          ? p1
          : p0;
    } else if (p1) {
      closest = p1;
    }

    if (closest) {
      setHoveredPoint(closest);
      setHoverCoords({ x: xScale(closest.timestamp), y: mouseY });
    }
  };

  const handlePointerLeave = () => {
    setHoveredPoint(null);
    setHoverCoords(null);
  };

  const latestPoint = visiblePoints[visiblePoints.length - 1] || {
    timestamp: new Date(),
    heartRate: 64,
    spo2: 98.4,
    cabinPressurePsi: 14.7,
    severity: 'NOMINAL' as const,
  };

  // Generate tick arrays for clean axes
  const xTicks = useMemo(() => {
    return xScale.ticks(Math.max(Math.floor(innerWidth / 110), 4));
  }, [xScale, innerWidth]);

  const hrTicks = [60, 80, 100, 120, 140];
  const pressTicks = [10.0, 11.5, 13.0, 14.7];

  return (
    <div
      ref={containerRef}
      className={`rounded-3xl bg-[#0B1224]/95 border border-[#00E5FF]/25 p-5 sm:p-6 shadow-[0_0_35px_-5px_rgba(0,229,255,0.12)] space-y-4 backdrop-blur-xl relative select-none ${className}`}
    >
      {/* HEADER: TITLE + CORRELATIONS + CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#00E5FF] font-mono text-xs uppercase tracking-wider font-bold mb-1">
            <Layers className="w-4 h-4 animate-pulse text-[#00E5FF]" />
            <span>Multi-Variate Real-Time Physiological & ECLSS Synchronizer</span>
          </div>
          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>D3 Biotelemetry Correlation Trendline</span>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
              Rolling {timeWindowMinutes}m
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized triple-vector telemetry: Heart Rate (BPM), Arterial SpO2 (%), and Habitat Cabin Pressure (psi).
          </p>
        </div>

        {/* CONTROLS: TIME HORIZON & CHANNEL TOGGLES */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Time Horizon selector */}
          <div className="flex items-center bg-[#050816] p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {([15, 30, 60] as const).map((mins) => (
              <button
                key={mins}
                onClick={() => setTimeWindowMinutes(mins)}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer font-bold ${
                  timeWindowMinutes === mins
                    ? 'bg-[#00E5FF] text-[#050816]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>

          {/* Interactive Channel Toggles */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setShowHeartRate(!showHeartRate)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                showHeartRate
                  ? 'bg-[#00E5FF]/15 text-[#00E5FF] border-[#00E5FF]/50 shadow-sm'
                  : 'bg-[#050816] text-slate-500 border-slate-800 opacity-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
              <span>HR (BPM)</span>
            </button>

            <button
              onClick={() => setShowSpo2(!showSpo2)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                showSpo2
                  ? 'bg-[#21D4A5]/15 text-[#21D4A5] border-[#21D4A5]/50 shadow-sm'
                  : 'bg-[#050816] text-slate-500 border-slate-800 opacity-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#21D4A5]" />
              <span>SpO2 (%)</span>
            </button>

            <button
              onClick={() => setShowPressure(!showPressure)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-medium ${
                showPressure
                  ? 'bg-[#FFB547]/15 text-[#FFB547] border-[#FFB547]/50 shadow-sm'
                  : 'bg-[#050816] text-slate-500 border-slate-800 opacity-50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FFB547]" />
              <span>Pressure (psi)</span>
            </button>
          </div>
        </div>
      </div>

      {/* TACTICAL LIVE READOUT TICKER STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 rounded-2xl bg-[#070D1E] border border-[#00E5FF]/25 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-slate-400">HEART RATE</span>
          </div>
          <span className="font-extrabold text-[#00E5FF] text-base tabular-nums">
            {latestPoint.heartRate} <span className="text-[10px] text-slate-500 font-normal">BPM</span>
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#070D1E] border border-[#21D4A5]/25 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#21D4A5]" />
            <span className="text-slate-400">OXYGEN (SpO2)</span>
          </div>
          <span className="font-extrabold text-[#21D4A5] text-base tabular-nums">
            {latestPoint.spo2}%
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#070D1E] border border-[#FFB547]/25 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-[#FFB547]" />
            <span className="text-slate-400">CABIN PRESSURE</span>
          </div>
          <span className="font-extrabold text-[#FFB547] text-base tabular-nums">
            {latestPoint.cabinPressurePsi} <span className="text-[10px] text-slate-500 font-normal">psi</span>
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-[#070D1E] border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-300" />
            <span className="text-slate-400">PRESSURE ⇄ SpO2 COUPLING</span>
          </div>
          <span
            className={`font-bold tabular-nums text-sm ${
              Math.abs(correlations.pressSpo2) > 0.6 ? 'text-amber-400' : 'text-slate-300'
            }`}
          >
            r = {correlations.pressSpo2 > 0 ? `+${correlations.pressSpo2}` : correlations.pressSpo2}
          </span>
        </div>
      </div>

      {/* D3 SVG CHART CANVAS */}
      <div className="relative w-full overflow-hidden bg-[#050816]/90 rounded-2xl border border-slate-800/90 p-2">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${containerWidth} ${height}`}
          className="w-full h-auto overflow-visible"
          style={{ maxHeight: height }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id={hrGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id={spo2GradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#21D4A5" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#21D4A5" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id={pressGradId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFB547" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#FFB547" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          <g className="stroke-slate-800/70" strokeDasharray="3 3">
            {hrTicks.map((tick) => (
              <line
                key={`hr-grid-${tick}`}
                x1={margin.left}
                y1={yHeartRate(tick)}
                x2={margin.left + innerWidth}
                y2={yHeartRate(tick)}
              />
            ))}
          </g>

          {/* Critical Threshold Danger Bands */}
          {/* 1. Depressurization Warning Zone (Cabin Pressure < 12.0 psi) */}
          <rect
            x={margin.left}
            y={yPressure(12.0)}
            width={innerWidth}
            height={Math.max(yPressure(9.5) - yPressure(12.0), 0)}
            fill="#FF5368"
            fillOpacity="0.05"
            className="pointer-events-none"
          />

          {/* 2. Hypoxia Warning Zone (SpO2 < 90%) */}
          <rect
            x={margin.left}
            y={ySpo2(90.0)}
            width={innerWidth}
            height={Math.max(ySpo2(84.0) - ySpo2(90.0), 0)}
            fill="#FF5368"
            fillOpacity="0.05"
            className="pointer-events-none"
          />

          {/* X-Axis Ticks & Time Labels */}
          <g className="text-[10px] font-mono fill-slate-500">
            {xTicks.map((t, i) => (
              <text
                key={i}
                x={xScale(t)}
                y={margin.top + innerHeight + 18}
                textAnchor="middle"
              >
                {d3.timeFormat('%H:%M')(t)}
              </text>
            ))}
          </g>

          {/* Left Y-Axis: Heart Rate (Cyan) */}
          {showHeartRate && (
            <g className="text-[10px] font-mono fill-[#00E5FF]">
              {hrTicks.map((tick) => (
                <text
                  key={`hr-tick-${tick}`}
                  x={margin.left - 8}
                  y={yHeartRate(tick) + 3}
                  textAnchor="end"
                >
                  {tick}
                </text>
              ))}
              <text
                x={margin.left - 8}
                y={margin.top - 8}
                textAnchor="end"
                className="font-bold fill-[#00E5FF] text-[9px] uppercase"
              >
                HR (BPM)
              </text>
            </g>
          )}

          {/* Right Y-Axis: Cabin Pressure (Amber) */}
          {showPressure && (
            <g className="text-[10px] font-mono fill-[#FFB547]">
              {pressTicks.map((tick) => (
                <text
                  key={`press-tick-${tick}`}
                  x={margin.left + innerWidth + 8}
                  y={yPressure(tick) + 3}
                  textAnchor="start"
                >
                  {tick.toFixed(1)}
                </text>
              ))}
              <text
                x={margin.left + innerWidth + 8}
                y={margin.top - 8}
                textAnchor="start"
                className="font-bold fill-[#FFB547] text-[9px] uppercase"
              >
                CABIN (PSI)
              </text>
            </g>
          )}

          {/* D3 Path Lines */}
          {/* 1. Cabin Pressure Path */}
          {showPressure && (
            <path
              d={pressLinePath}
              fill="none"
              stroke="#FFB547"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(255,181,71,0.45)] transition-all duration-300"
            />
          )}

          {/* 2. SpO2 Path */}
          {showSpo2 && (
            <path
              d={spo2LinePath}
              fill="none"
              stroke="#21D4A5"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4 3"
              className="drop-shadow-[0_0_8px_rgba(33,212,165,0.45)] transition-all duration-300"
            />
          )}

          {/* 3. Heart Rate Path */}
          {showHeartRate && (
            <path
              d={hrLinePath}
              fill="none"
              stroke="#00E5FF"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_10px_rgba(0,229,255,0.55)] transition-all duration-300"
            />
          )}

          {/* Glowing Animated Head Dot for Latest Live Reading */}
          {visiblePoints.length > 0 && (
            <g>
              {showHeartRate && (
                <circle
                  cx={xScale(latestPoint.timestamp)}
                  cy={yHeartRate(latestPoint.heartRate)}
                  r="4"
                  fill="#00E5FF"
                  className="animate-pulse drop-shadow-[0_0_10px_#00E5FF]"
                />
              )}
              {showSpo2 && (
                <circle
                  cx={xScale(latestPoint.timestamp)}
                  cy={ySpo2(latestPoint.spo2)}
                  r="3.5"
                  fill="#21D4A5"
                  className="drop-shadow-[0_0_8px_#21D4A5]"
                />
              )}
              {showPressure && (
                <circle
                  cx={xScale(latestPoint.timestamp)}
                  cy={yPressure(latestPoint.cabinPressurePsi)}
                  r="4"
                  fill="#FFB547"
                  className="animate-ping opacity-60"
                />
              )}
            </g>
          )}

          {/* Vertical Crosshair Scrubber Line on Hover */}
          {hoverCoords && hoveredPoint && (
            <g className="pointer-events-none">
              <line
                x1={hoverCoords.x}
                y1={margin.top}
                x2={hoverCoords.x}
                y2={margin.top + innerHeight}
                stroke="#00E5FF"
                strokeWidth="1.2"
                strokeDasharray="3 3"
                className="opacity-80"
              />
              {/* Highlight dots on lines at hovered X */}
              {showHeartRate && (
                <circle
                  cx={hoverCoords.x}
                  cy={yHeartRate(hoveredPoint.heartRate)}
                  r="5"
                  fill="#00E5FF"
                  stroke="#050816"
                  strokeWidth="2"
                />
              )}
              {showSpo2 && (
                <circle
                  cx={hoverCoords.x}
                  cy={ySpo2(hoveredPoint.spo2)}
                  r="4.5"
                  fill="#21D4A5"
                  stroke="#050816"
                  strokeWidth="2"
                />
              )}
              {showPressure && (
                <circle
                  cx={hoverCoords.x}
                  cy={yPressure(hoveredPoint.cabinPressurePsi)}
                  r="5"
                  fill="#FFB547"
                  stroke="#050816"
                  strokeWidth="2"
                />
              )}
            </g>
          )}

          {/* Interactive Mouse Event Capture Rect */}
          <rect
            x={margin.left}
            y={margin.top}
            width={innerWidth}
            height={innerHeight}
            fill="transparent"
            className="cursor-crosshair"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
          />
        </svg>

        {/* FLOATING TACTICAL TOOLTIP SCRUBBER */}
        {hoverCoords && hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none p-3 rounded-2xl bg-[#050816]/95 border border-[#00E5FF]/60 shadow-[0_0_25px_rgba(0,229,255,0.25)] text-xs font-mono space-y-1.5 backdrop-blur-md"
            style={{
              left: Math.min(Math.max(hoverCoords.x - 100, 10), containerWidth - 220),
              top: Math.max(margin.top + 8, 12),
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 gap-4">
              <span className="text-[#00E5FF] font-bold">
                {d3.timeFormat('%H:%M:%S UTC')(hoveredPoint.timestamp)}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                  hoveredPoint.severity === 'CRITICAL'
                    ? 'bg-rose-950 text-rose-400 border-rose-800'
                    : hoveredPoint.severity === 'WARNING'
                    ? 'bg-amber-950 text-amber-400 border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                }`}
              >
                {hoveredPoint.severity}
              </span>
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                  <span>Heart Rate:</span>
                </span>
                <span className="font-bold text-[#00E5FF] tabular-nums">
                  {hoveredPoint.heartRate} BPM
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#21D4A5]" />
                  <span>Oxygen Saturation:</span>
                </span>
                <span className="font-bold text-[#21D4A5] tabular-nums">
                  {hoveredPoint.spo2}%
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#FFB547]" />
                  <span>Cabin Pressure:</span>
                </span>
                <span className="font-bold text-[#FFB547] tabular-nums">
                  {hoveredPoint.cabinPressurePsi} psi
                </span>
              </div>
            </div>

            {hoveredPoint.anomalyName && hoveredPoint.anomalyName !== 'Nominal Operations' && (
              <div className="text-[10px] text-rose-300 font-sans border-t border-slate-800 pt-1">
                Anomaly: {hoveredPoint.anomalyName}
              </div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER: MEDICAL PHYSIOLOGICAL CORRELATION EXPLAINER */}
      <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
          <span>
            <strong>Spaceflight Multi-Vector Coupling:</strong> Environmental hypobaria triggers hypoxic arterial drift with compensatory tachycardia.
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-slate-500">Normal Ranges:</span>
          <span className="text-[#00E5FF]">HR 50–100 BPM</span>
          <span className="text-[#21D4A5]">SpO2 &gt;95%</span>
          <span className="text-[#FFB547]">Cabin 14.2–14.7 psi</span>
        </div>
      </div>
    </div>
  );
};
