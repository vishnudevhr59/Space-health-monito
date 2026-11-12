import React, { useState, useEffect, useRef, useId, useMemo } from 'react';
import * as d3 from 'd3';
import { telemetryStreamEngine, TelemetryFrame } from '../services/telemetryStreamEngine';
import { AstronautProfile, HealthMeasurement, SleepRecord, ActivityRecord, RadiationRecord } from '../types';
import {
  Activity,
  Heart,
  Droplets,
  Moon,
  Radio,
  Compass,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Info,
  Maximize2,
  RefreshCw,
} from 'lucide-react';

export interface RadarDimension {
  id: string;
  label: string;
  shortLabel: string;
  category: 'Cardiovascular' | 'Neurological' | 'Environmental' | 'Countermeasure';
  nominalScore: number; // 0-100
  liveScore: number;    // 0-100
  currentRawValue: string;
  nominalTarget: string;
  unit: string;
  status: 'NOMINAL' | 'WARNING' | 'CRITICAL';
  clinicalInterpretation: string;
  iconName: string;
}

interface D3PolarRadarChartProps {
  astronaut: AstronautProfile;
  telemetryHistory?: HealthMeasurement[];
  sleepRecords?: SleepRecord[];
  activityRecords?: ActivityRecord[];
  radiationRecords?: RadiationRecord[];
  className?: string;
}

export const D3PolarRadarChart: React.FC<D3PolarRadarChartProps> = ({
  astronaut,
  telemetryHistory = [],
  sleepRecords = [],
  activityRecords = [],
  radiationRecords = [],
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(540);
  const [hoveredDimension, setHoveredDimension] = useState<RadarDimension | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CARDIO' | 'NEURO' | 'ENVIRONMENTAL'>('ALL');
  const [liveFrame, setLiveFrame] = useState<TelemetryFrame>(telemetryStreamEngine.getCurrentFrame());

  const uniqueId = useId().replace(/:/g, '');
  const polygonGradientId = `radar-grad-${uniqueId}`;
  const baselineGradientId = `radar-baseline-${uniqueId}`;

  // Continuous 1Hz telemetry subscription
  useEffect(() => {
    const unsub = telemetryStreamEngine.subscribe((frame) => {
      setLiveFrame(frame);
    });
    return unsub;
  }, []);

  // Responsive resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute live multi-dimensional scores (0 to 100)
  const dimensions: RadarDimension[] = useMemo(() => {
    const baseline = astronaut.baselineVitals;
    const hr = liveFrame.heartRate;
    const spo2 = liveFrame.spo2;
    const hrv = liveFrame.hrv;
    const temp = liveFrame.bodyTemperature;
    const vest = liveFrame.vestibularConflictScore;
    const press = liveFrame.cabinPressurePsi;
    const co2 = liveFrame.cabinCo2MmHg;

    // 1. HRV Autonomic Tone: baseline ~65ms => 90pts
    const hrvScore = Math.max(10, Math.min(100, Math.round((hrv / (baseline?.hrvMs || 65)) * 90)));

    // 2. Cardiovascular Stability: penalize deviation from baseline resting HR & MAP
    const hrDeviation = Math.abs(hr - (baseline?.restingHeartRate || 58));
    const cardioScore = Math.max(10, Math.min(100, Math.round(100 - hrDeviation * 1.5)));

    // 3. Arterial Oxygenation: 98.4% nominal => 98pts, <90% => critical
    const oxyScore = Math.max(5, Math.min(100, Math.round(((spo2 - 80) / 20) * 100)));

    // 4. ARED Resistive Conditioning: based on adherence
    const activityCount = activityRecords.length;
    const aredScore = activityCount > 0 ? 94 : 88;

    // 5. Sleep Architecture & Circadian Alignment
    const latestSleep = sleepRecords[sleepRecords.length - 1];
    const sleepEfficiency = latestSleep ? latestSleep.efficiencyPercent : 86;
    const sleepScore = Math.max(20, Math.min(100, Math.round(sleepEfficiency)));

    // 6. Radiation Exposure Margin
    const cumulativeMsv = astronaut.radiationCumulativeMSv || 78.4;
    const limitMsv = astronaut.radiationMissionLimitMSv || 250.0;
    const radSafetyMarginPercent = Math.max(0, Math.round(((limitMsv - cumulativeMsv) / limitMsv) * 100));
    const radScore = Math.max(15, Math.min(100, radSafetyMarginPercent));

    // 7. Vestibular Otolith Stability (lower conflict score is better)
    const vestScore = Math.max(10, Math.min(100, Math.round(100 - (vest * 10))));

    // 8. Core Thermal Homeostasis (Nominal 36.6C)
    const tempDiff = Math.abs(temp - (baseline?.bodyTempC || 36.6));
    const thermalScore = Math.max(15, Math.min(100, Math.round(100 - (tempDiff * 45))));

    const list: RadarDimension[] = [
      {
        id: 'hrv',
        label: 'HRV Autonomic Tone',
        shortLabel: 'HRV TONE',
        category: 'Cardiovascular',
        nominalScore: 90,
        liveScore: hrvScore,
        currentRawValue: `${hrv} ms`,
        nominalTarget: `${baseline?.hrvMs || 65} ms (±8)`,
        unit: 'ms',
        status: hrvScore < 50 ? 'CRITICAL' : hrvScore < 75 ? 'WARNING' : 'NOMINAL',
        clinicalInterpretation: 'Vagal nerve modulation and parasympathetic cardiovascular recovery capacity.',
        iconName: 'Heart',
      },
      {
        id: 'cardio',
        label: 'Cardiovascular Reserve',
        shortLabel: 'CARDIO',
        category: 'Cardiovascular',
        nominalScore: 92,
        liveScore: cardioScore,
        currentRawValue: `${hr} BPM · ${liveFrame.systolicBP}/${liveFrame.diastolicBP} mmHg`,
        nominalTarget: `${baseline?.restingHeartRate || 58} BPM · ${baseline?.systolicBP || 114}/${baseline?.diastolicBP || 72} mmHg`,
        unit: 'BPM',
        status: cardioScore < 50 ? 'CRITICAL' : cardioScore < 75 ? 'WARNING' : 'NOMINAL',
        clinicalInterpretation: 'Microgravity baroreflex sensitivity and mean arterial perfusion reserve.',
        iconName: 'Activity',
      },
      {
        id: 'oxygenation',
        label: 'Arterial Oxygenation',
        shortLabel: 'SpO2 OXY',
        category: 'Cardiovascular',
        nominalScore: 98,
        liveScore: oxyScore,
        currentRawValue: `${spo2}%`,
        nominalTarget: '≥ 97.0%',
        unit: '%',
        status: spo2 < 90 ? 'CRITICAL' : spo2 < 95 ? 'WARNING' : 'NOMINAL',
        clinicalInterpretation: 'Microgravity pulmonary ventilation-perfusion matching and alveolar exchange.',
        iconName: 'Droplets',
      },
      {
        id: 'ared',
        label: 'ARED Load Conditioning',
        shortLabel: 'ARED LOAD',
        category: 'Countermeasure',
        nominalScore: 95,
        liveScore: aredScore,
        currentRawValue: '420 N · 100% Adherence',
        nominalTarget: '≥ 400 N daily axial loading',
        unit: 'N',
        status: aredScore < 60 ? 'WARNING' : 'NOMINAL',
        clinicalInterpretation: 'Axial mechanical strain counteracting cortical and trabecular bone osteopenia.',
        iconName: 'Activity',
      },
      {
        id: 'sleep',
        label: 'Sleep & Circadian Alignment',
        shortLabel: 'CIRCADIAN',
        category: 'Neurological',
        nominalScore: 88,
        liveScore: sleepScore,
        currentRawValue: `${latestSleep?.totalDurationHours || 6.8}h (${sleepEfficiency}% eff)`,
        nominalTarget: '≥ 7.0h (≥85% eff)',
        unit: 'hrs',
        status: sleepScore < 60 ? 'WARNING' : 'NOMINAL',
        clinicalInterpretation: 'Melatonin circadian phase synchronization with Station Greenwich Mean Time.',
        iconName: 'Moon',
      },
      {
        id: 'radiation',
        label: 'Radiation Safety Buffer',
        shortLabel: 'RAD MARGIN',
        category: 'Environmental',
        nominalScore: 85,
        liveScore: radScore,
        currentRawValue: `${cumulativeMsv.toFixed(1)} / ${limitMsv.toFixed(0)} mSv`,
        nominalTarget: '< 250 mSv Career Margin',
        unit: 'mSv',
        status: radScore < 30 ? 'CRITICAL' : radScore < 50 ? 'WARNING' : 'NOMINAL',
        clinicalInterpretation: 'Residual ALARA exposure margin for long-duration deep-space transit.',
        iconName: 'Radio',
      },
      {
        id: 'vestibular',
        label: 'Vestibular Otolith Stability',
        shortLabel: 'VESTIBULAR',
        category: 'Neurological',
        nominalScore: 90,
        liveScore: vestScore,
        currentRawValue: `Score ${vest} / 10`,
        nominalTarget: '< 2.5 / 10 (Nominal)',
        unit: 'Index',
        status: vestScore < 40 ? 'CRITICAL' : vestScore < 65 ? 'WARNING' : 'NOMINAL',
        clinicalInterpretation: 'Cerebellar sensory reweighting in 0g; space motion sickness adaptation.',
        iconName: 'Compass',
      },
      {
        id: 'thermal',
        label: 'Metabolic Thermal Homeostasis',
        shortLabel: 'THERMAL',
        category: 'Environmental',
        nominalScore: 94,
        liveScore: thermalScore,
        currentRawValue: `${temp}°C`,
        nominalTarget: '36.5 – 37.0°C',
        unit: '°C',
        status: thermalScore < 60 ? 'WARNING' : 'NOMINAL',
        clinicalInterpretation: 'Core body temperature regulation under microgravity convective impairment.',
        iconName: 'Thermometer',
      },
    ];

    if (selectedFilter === 'CARDIO') {
      return list.filter(d => d.category === 'Cardiovascular');
    }
    if (selectedFilter === 'NEURO') {
      return list.filter(d => d.category === 'Neurological');
    }
    if (selectedFilter === 'ENVIRONMENTAL') {
      return list.filter(d => d.category === 'Environmental');
    }
    return list;
  }, [astronaut, liveFrame, activityRecords, sleepRecords, selectedFilter]);

  // Dimensions & geometry
  const size = Math.min(containerWidth, 540);
  const cx = size / 2;
  const cy = size / 2;
  const radius = Math.max(120, (size / 2) - 58);
  const totalAxes = dimensions.length;
  const angleSlice = (Math.PI * 2) / totalAxes;

  // Linear radius scale: 0 to 100 => 0 to radius
  const rScale = d3.scaleLinear().domain([0, 100]).range([0, radius]);

  // Concentric levels (rings)
  const levels = [20, 40, 60, 80, 100];

  // Helper polar to cartesian
  const polarToCartesian = (angle: number, r: number) => {
    return {
      x: cx + r * Math.cos(angle - Math.PI / 2),
      y: cy + r * Math.sin(angle - Math.PI / 2),
    };
  };

  // Polygon path string for a score set
  const getPolygonPath = (scores: number[]): string => {
    const coords = scores.map((score, i) => {
      const angle = i * angleSlice;
      const r = rScale(score);
      return polarToCartesian(angle, r);
    });
    return coords.map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ') + ' Z';
  };

  const nominalPolygon = useMemo(() => {
    return getPolygonPath(dimensions.map(d => d.nominalScore));
  }, [dimensions, radius, angleSlice]);

  const livePolygon = useMemo(() => {
    return getPolygonPath(dimensions.map(d => d.liveScore));
  }, [dimensions, radius, angleSlice]);

  // Overall index
  const avgLiveScore = useMemo(() => {
    if (dimensions.length === 0) return 90;
    const sum = dimensions.reduce((acc, d) => acc + d.liveScore, 0);
    return Math.round(sum / dimensions.length);
  }, [dimensions]);

  const overallStatus = liveFrame.severity;
  const statusColor =
    overallStatus === 'CRITICAL'
      ? '#FF3B30'
      : overallStatus === 'WARNING'
      ? '#FFB547'
      : '#21D4A5';

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl bg-[#0B1221]/95 border border-[#00E5FF]/25 p-4 sm:p-6 shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden ${className}`}
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#00E5FF] uppercase font-bold tracking-wider">
            <Compass className="w-4 h-4 text-[#00E5FF] animate-spin-slow" />
            <span>Multi-Vector Polar Telemetry Matrix</span>
          </div>
          <h3 className="text-base sm:text-lg font-extrabold text-white mt-0.5 tracking-tight flex items-center gap-2">
            Physiological Polar Radar
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded-full border"
              style={{
                color: statusColor,
                backgroundColor: `${statusColor}15`,
                borderColor: `${statusColor}40`,
              }}
            >
              INDEX {avgLiveScore}/100 · {overallStatus}
            </span>
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5 hidden sm:block">
            Continuous 8-dimensional spaceflight physiological assessment calibrated to NASA-STD-3001
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 bg-[#050816] p-1 rounded-xl border border-slate-800 text-[11px] font-mono shrink-0">
          {(['ALL', 'CARDIO', 'NEURO', 'ENVIRONMENTAL'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setSelectedFilter(mode)}
              className={`px-2.5 py-1 rounded-lg transition-all font-semibold cursor-pointer ${
                selectedFilter === mode
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* CHART SVG AREA */}
      <div className="relative flex items-center justify-center py-2 sm:py-4">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible select-none"
        >
          <defs>
            {/* Radial Gradient for live polygon fill */}
            <radialGradient id={polygonGradientId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={statusColor} stopOpacity={0.45} />
              <stop offset="70%" stopColor={statusColor} stopOpacity={0.18} />
              <stop offset="100%" stopColor={statusColor} stopOpacity={0.05} />
            </radialGradient>

            {/* Baseline Gradient */}
            <radialGradient id={baselineGradientId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00E5FF" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#00E5FF" stopOpacity={0.02} />
            </radialGradient>

            {/* Glowing filter */}
            <filter id={`glow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACKGROUND CONCENTRIC WEB RINGS */}
          {levels.map((lvl) => {
            const r = rScale(lvl);
            const ringPath = dimensions
              .map((_, i) => {
                const angle = i * angleSlice;
                const pt = polarToCartesian(angle, r);
                return `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)}`;
              })
              .join(' ') + ' Z';

            return (
              <g key={`level-${lvl}`}>
                <path
                  d={ringPath}
                  fill="none"
                  stroke={lvl === 100 ? '#00E5FF' : '#1e293b'}
                  strokeWidth={lvl === 100 ? 1.2 : 0.8}
                  strokeDasharray={lvl === 100 ? 'none' : '3 3'}
                  opacity={lvl === 100 ? 0.35 : 0.6}
                />
                {/* Level label */}
                <text
                  x={cx + 4}
                  y={cy - r + 3}
                  fontSize={8}
                  fontFamily="JetBrains Mono, monospace"
                  fill="#64748b"
                  opacity={0.8}
                >
                  {lvl}%
                </text>
              </g>
            );
          })}

          {/* AXIS SPOKES */}
          {dimensions.map((dim, i) => {
            const angle = i * angleSlice;
            const endPt = polarToCartesian(angle, radius);
            const labelPt = polarToCartesian(angle, radius + 22);

            // Determine text anchor based on angle
            const cos = Math.cos(angle - Math.PI / 2);
            let textAnchor: 'start' | 'middle' | 'end' = 'middle';
            if (cos > 0.25) textAnchor = 'start';
            else if (cos < -0.25) textAnchor = 'end';

            const isHovered = hoveredDimension?.id === dim.id;

            return (
              <g key={`axis-${dim.id}`}>
                {/* Spoke line */}
                <line
                  x1={cx}
                  y1={cy}
                  x2={endPt.x}
                  y2={endPt.y}
                  stroke={isHovered ? '#00E5FF' : '#1e293b'}
                  strokeWidth={isHovered ? 1.5 : 0.9}
                  opacity={isHovered ? 0.9 : 0.6}
                />

                {/* Tactical tick at perimeter */}
                <circle
                  cx={endPt.x}
                  cy={endPt.y}
                  r={1.5}
                  fill="#00E5FF"
                  opacity={0.5}
                />

                {/* Spoke label */}
                <text
                  x={labelPt.x}
                  y={labelPt.y + (labelPt.y > cy ? 4 : -2)}
                  textAnchor={textAnchor}
                  fontSize={9}
                  fontWeight={isHovered ? 'bold' : 'normal'}
                  fontFamily="JetBrains Mono, monospace"
                  fill={isHovered ? '#00E5FF' : '#94a3b8'}
                  className="cursor-pointer transition-colors"
                  onClick={() => setHoveredDimension(dim)}
                >
                  {dim.shortLabel}
                </text>
              </g>
            );
          })}

          {/* NOMINAL BENCHMARK POLYGON (CYAN DASHED) */}
          <path
            d={nominalPolygon}
            fill={`url(#${baselineGradientId})`}
            stroke="#00E5FF"
            strokeWidth={1.4}
            strokeDasharray="4 4"
            opacity={0.65}
          />

          {/* LIVE ASTRONAUT POLYGON (GLOWING COLORED) */}
          <path
            d={livePolygon}
            fill={`url(#${polygonGradientId})`}
            stroke={statusColor}
            strokeWidth={2.4}
            filter={`url(#glow-${uniqueId})`}
            className="transition-all duration-300"
          />

          {/* LIVE VERTICES & INTERACTIVE TARGETS */}
          {dimensions.map((dim, i) => {
            const angle = i * angleSlice;
            const livePt = polarToCartesian(angle, rScale(dim.liveScore));
            const nomPt = polarToCartesian(angle, rScale(dim.nominalScore));
            const isHovered = hoveredDimension?.id === dim.id;

            const vertColor =
              dim.status === 'CRITICAL'
                ? '#FF3B30'
                : dim.status === 'WARNING'
                ? '#FFB547'
                : '#21D4A5';

            return (
              <g key={`vert-${dim.id}`}>
                {/* Nominal anchor ring */}
                <circle
                  cx={nomPt.x}
                  cy={nomPt.y}
                  r={2.5}
                  fill="none"
                  stroke="#00E5FF"
                  strokeWidth={1}
                  opacity={0.5}
                />

                {/* Live vertex pulse outer ring */}
                <circle
                  cx={livePt.x}
                  cy={livePt.y}
                  r={isHovered ? 7 : 4.5}
                  fill={vertColor}
                  fillOpacity={0.25}
                  stroke={vertColor}
                  strokeWidth={isHovered ? 2 : 1.2}
                  className="cursor-pointer transition-all"
                />

                {/* Live vertex solid center */}
                <circle
                  cx={livePt.x}
                  cy={livePt.y}
                  r={isHovered ? 3.5 : 2}
                  fill="#ffffff"
                  className="cursor-pointer"
                />

                {/* Invisible large hit area for touch/mouse */}
                <circle
                  cx={livePt.x}
                  cy={livePt.y}
                  r={18}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={(e) => {
                    const rect = containerRef.current?.getBoundingClientRect();
                    if (rect) {
                      setTooltipPos({
                        x: livePt.x,
                        y: livePt.y,
                      });
                    }
                    setHoveredDimension(dim);
                  }}
                  onMouseLeave={() => setHoveredDimension(null)}
                  onClick={() => setHoveredDimension(dim)}
                />
              </g>
            );
          })}

          {/* CENTER TACTICAL RETICLE */}
          <circle cx={cx} cy={cy} r={3} fill="#00E5FF" opacity={0.7} />
          <line x1={cx - 8} y1={cy} x2={cx + 8} y2={cy} stroke="#00E5FF" strokeWidth={0.8} opacity={0.4} />
          <line x1={cx} y1={cy - 8} x2={cx} y2={cy + 8} stroke="#00E5FF" strokeWidth={0.8} opacity={0.4} />
        </svg>

        {/* FLOATING HOVER TOOLTIP */}
        {hoveredDimension && (
          <div
            className="absolute z-30 pointer-events-none p-3 rounded-2xl bg-[#050816]/95 border border-[#00E5FF]/40 text-xs font-mono shadow-[0_8px_30px_rgba(0,0,0,0.8)] backdrop-blur-md max-w-xs transition-all"
            style={{
              left: tooltipPos ? Math.min(Math.max(tooltipPos.x - 120, 10), size - 240) : cx - 100,
              top: tooltipPos ? Math.max(tooltipPos.y - 110, 10) : cy - 80,
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
              <span className="font-extrabold text-white text-[13px]">{hoveredDimension.label}</span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase"
                style={{
                  backgroundColor:
                    hoveredDimension.status === 'CRITICAL'
                      ? 'rgba(255, 59, 48, 0.2)'
                      : hoveredDimension.status === 'WARNING'
                      ? 'rgba(255, 181, 71, 0.2)'
                      : 'rgba(33, 212, 165, 0.2)',
                  color:
                    hoveredDimension.status === 'CRITICAL'
                      ? '#FF3B30'
                      : hoveredDimension.status === 'WARNING'
                      ? '#FFB547'
                      : '#21D4A5',
                }}
              >
                {hoveredDimension.status}
              </span>
            </div>

            <div className="space-y-1 text-[11px] leading-tight">
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Current Reading:</span>
                <span className="font-bold text-white tabular-nums">{hoveredDimension.currentRawValue}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Nominal Benchmark:</span>
                <span className="font-bold text-[#00E5FF] tabular-nums">{hoveredDimension.nominalTarget}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="text-slate-400">Normalized Index:</span>
                <span className="font-bold text-emerald-400 tabular-nums">
                  {hoveredDimension.liveScore} / 100 (Nominal: {hoveredDimension.nominalScore})
                </span>
              </div>
              <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/80 leading-normal font-sans">
                {hoveredDimension.clinicalInterpretation}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER LEGEND & SUMMARY STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 bg-[#00E5FF] inline-block border-b border-dashed" />
            <span className="text-slate-300 text-[11px]">NASA Benchmark</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-1.5 rounded-sm inline-block"
              style={{ backgroundColor: statusColor }}
            />
            <span className="text-white font-bold text-[11px]">Astronaut Live Vector</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#21D4A5] animate-pulse inline-block" />
          <span>Synchronized 1Hz Loop · Sol 142</span>
        </div>
      </div>
    </div>
  );
};
