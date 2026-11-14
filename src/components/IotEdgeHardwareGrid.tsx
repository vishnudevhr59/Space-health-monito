import React, { useState, useEffect, useMemo } from 'react';
import {
  Bluetooth,
  Cpu,
  Radio,
  Wifi,
  WifiOff,
  BatteryCharging,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Shield,
  Activity,
  Droplets,
  Wind,
  Zap,
  Database,
  Send,
} from 'lucide-react';
import { TelemetryFrame, TelemetryTransportMode } from '../services/telemetryStreamEngine';
import { IssOrbitalSnapshot } from '../services/orbitalTelemetryService';
import { offlineSyncService, OfflineSyncState } from '../services/offlineSyncService';

interface IotEdgeHardwareGridProps {
  astronautId: string;
  latestFrame: TelemetryFrame;
  transportMode: TelemetryTransportMode;
  orbitalSnapshot: IssOrbitalSnapshot | null;
}

type ProtocolMode = 'MQTT_WS' | 'DTN_BUFFER';

interface HardwareNodeSpec {
  id: string;
  name: string;
  vendorModel: string;
  category: 'Wearable Garment' | 'Ring Sensor' | 'Metabolic CGM' | 'Radiation Dosimetry' | 'Habitat Air Node';
  transport: 'BLE 5.3 GATT' | 'BLE 5.0 Mesh' | 'CoAP / UDP' | 'Zigbee / MQTT';
  topic: string;
  rssiDbm: number;
  batteryPct: number;
  estimatedHoursLeft: number;
  sampleRateHz: string;
  liveMetricLabel: string;
  liveMetricValue: string;
  liveMetricUnit: string;
  secondaryReading: string;
  nominal: boolean;
}

interface DtnBufferedBundle {
  bundleId: string;
  timestamp: string;
  topic: string;
  bytes: number;
  summary: string;
}

export const IotEdgeHardwareGrid: React.FC<IotEdgeHardwareGridProps> = ({
  astronautId,
  latestFrame,
  transportMode,
  orbitalSnapshot,
}) => {
  const [syncState, setSyncState] = useState<OfflineSyncState>(() => offlineSyncService.getState());
  const [protocolMode, setProtocolMode] = useState<ProtocolMode>(() =>
    offlineSyncService.isOccultationActive() ? 'DTN_BUFFER' : 'MQTT_WS'
  );
  const [dtnBundles, setDtnBundles] = useState<DtnBufferedBundle[]>([]);
  const [flushedCount, setFlushedCount] = useState<number>(0);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('csa-biomonitor');
  const [calibrationTimes, setCalibrationTimes] = useState<Record<string, string>>({
    'csa-biomonitor': 'Today · 06:15 UTC',
    'oura-ring': 'Today · 05:40 UTC',
    'cgm-suiteride': 'Day 6 Filament · Auto',
    'cpds-dosimeter': 'Today · 04:00 UTC',
    'esp32-cabin-air': 'Today · 07:30 UTC',
  });
  const [calibratingNodeId, setCalibratingNodeId] = useState<string | null>(null);
  const [packetSeq, setPacketSeq] = useState<number>(1042);

  useEffect(() => {
    return offlineSyncService.subscribe((state) => {
      setSyncState(state);
      setProtocolMode(state.isOccultationSimulated ? 'DTN_BUFFER' : 'MQTT_WS');
    });
  }, []);

  // Track packet sequence and buffer DTN bundles when simulated blackout is active
  useEffect(() => {
    setPacketSeq((prev) => prev + 1);
    if (protocolMode === 'DTN_BUFFER') {
      const bundle: DtnBufferedBundle = {
        bundleId: `bpv7-${Date.now().toString(36).slice(-5)}`,
        timestamp: latestFrame.timestamp,
        topic: `dtn://gateway/${astronautId}/vitals`,
        bytes: 148,
        summary: `HR ${latestFrame.heartRate} bpm · SpO2 ${latestFrame.spo2}% · CO2 ${latestFrame.cabinCo2MmHg} mmHg`,
      };
      setDtnBundles((prev) => [bundle, ...prev].slice(0, 12));
    }
  }, [
    latestFrame.timestamp,
    latestFrame.heartRate,
    latestFrame.spo2,
    latestFrame.cabinCo2MmHg,
    protocolMode,
    astronautId,
  ]);

  const handleToggleProtocol = (targetMode: ProtocolMode) => {
    if (targetMode === protocolMode) return;
    if (targetMode === 'DTN_BUFFER') {
      offlineSyncService.toggleOccultation(true);
      setProtocolMode('DTN_BUFFER');
    } else {
      const buffered = dtnBundles.length;
      offlineSyncService.toggleOccultation(false);
      setProtocolMode('MQTT_WS');
      if (buffered > 0) {
        setFlushedCount((prev) => prev + buffered);
        setDtnBundles([]);
      }
    }
  };

  const handleRunCalibration = (nodeId: string) => {
    setCalibratingNodeId(nodeId);
    setTimeout(() => {
      const nowUtc = new Date().toISOString().slice(11, 16) + ' UTC';
      setCalibrationTimes((prev) => ({
        ...prev,
        [nodeId]: `Verified · ${nowUtc}`,
      }));
      setCalibratingNodeId(null);
    }, 550);
  };

  // Derived realistic telemetry for Suite Ride CGM & CPDS micro-dosimeter
  const cgmGlucoseMgDl = useMemo(() => {
    const wave = Math.sin(packetSeq * 0.15) * 3.5;
    return Math.round(96 + wave + (latestFrame.heartRate > 95 ? 8 : 0));
  }, [packetSeq, latestFrame.heartRate]);

  const doseRateMicroSvHr = useMemo(() => {
    const kp = orbitalSnapshot?.kpIndex ?? 2.3;
    return +(0.34 + kp * 0.04).toFixed(2);
  }, [orbitalSnapshot?.kpIndex]);

  const co2PpmEquiv = useMemo(() => {
    return Math.round((latestFrame.cabinCo2MmHg / 760) * 1_000_000);
  }, [latestFrame.cabinCo2MmHg]);

  const hardwareNodes: HardwareNodeSpec[] = useMemo(
    () => [
      {
        id: 'csa-biomonitor',
        name: 'CSA Bio-Monitor Vest',
        vendorModel: 'Hexoskin Textile 3-Lead ECG',
        category: 'Wearable Garment',
        transport: 'BLE 5.3 GATT',
        topic: `space/crew/${astronautId}/ecg_resp`,
        rssiDbm: -53,
        batteryPct: 88,
        estimatedHoursLeft: 38,
        sampleRateHz: '256 Hz ECG / 1 Hz Bus',
        liveMetricLabel: '3-Lead ECG & Resp',
        liveMetricValue: `${latestFrame.heartRate}`,
        liveMetricUnit: 'BPM',
        secondaryReading: `Resp ${latestFrame.respiratoryRate} br/min · Skin ${latestFrame.bodyTemperature}°C`,
        nominal: latestFrame.heartRate <= 105 && latestFrame.spo2 >= 93,
      },
      {
        id: 'oura-ring',
        name: 'Oura Ring Gen 4 Edge',
        vendorModel: 'Photoplethysmography & NTC',
        category: 'Ring Sensor',
        transport: 'BLE 5.3 GATT',
        topic: `space/crew/${astronautId}/hrv_ring`,
        rssiDbm: -61,
        batteryPct: 82,
        estimatedHoursLeft: 112,
        sampleRateHz: '50 Hz PPG',
        liveMetricLabel: 'Autonomic HRV',
        liveMetricValue: `${latestFrame.hrv}`,
        liveMetricUnit: 'ms RMSSD',
        secondaryReading: `SpO2 ${latestFrame.spo2}% · Readiness ${latestFrame.trishRecoveryScore}/100`,
        nominal: latestFrame.hrv >= 35,
      },
      {
        id: 'cgm-suiteride',
        name: 'Suite Ride Metabolic CGM',
        vendorModel: 'Subcutaneous Interstitial Sensor',
        category: 'Metabolic CGM',
        transport: 'BLE 5.0 Mesh',
        topic: `space/crew/${astronautId}/glucose`,
        rssiDbm: -66,
        batteryPct: 91,
        estimatedHoursLeft: 192,
        sampleRateHz: '0.003 Hz (5-min cadence)',
        liveMetricLabel: 'Interstitial Glucose',
        liveMetricValue: `${cgmGlucoseMgDl}`,
        liveMetricUnit: 'mg/dL',
        secondaryReading: 'Trend: Steady · Filament Day 6/14',
        nominal: cgmGlucoseMgDl >= 70 && cgmGlucoseMgDl <= 145,
      },
      {
        id: 'cpds-dosimeter',
        name: 'CPDS Micro-Dosimeter',
        vendorModel: 'Charged Particle Spectrometer',
        category: 'Radiation Dosimetry',
        transport: 'CoAP / UDP',
        topic: `coap://node-dos-02/rad`,
        rssiDbm: -49,
        batteryPct: 95,
        estimatedHoursLeft: 420,
        sampleRateHz: '0.2 Hz Flux Bin',
        liveMetricLabel: 'Absorbed Dose Rate',
        liveMetricValue: `${doseRateMicroSvHr}`,
        liveMetricUnit: 'µSv/hr',
        secondaryReading: `Kp ${orbitalSnapshot?.kpIndex ?? 2.3} · SPE Storm Shield: Clear`,
        nominal: doseRateMicroSvHr < 1.5,
      },
      {
        id: 'esp32-cabin-air',
        name: 'Cabin Air Quality Node',
        vendorModel: 'ESP32-S3 Sensirion Habitat Mesh',
        category: 'Habitat Air Node',
        transport: 'Zigbee / MQTT',
        topic: `space/habitat/node04/eclss`,
        rssiDbm: -47,
        batteryPct: 99,
        estimatedHoursLeft: 720,
        sampleRateHz: '1 Hz Environmental',
        liveMetricLabel: 'Cabin pCO2',
        liveMetricValue: `${co2PpmEquiv.toLocaleString()}`,
        liveMetricUnit: 'ppm',
        secondaryReading: `${latestFrame.cabinPressurePsi} PSI · O2 ${latestFrame.eclssOgaPercent}% · VOC 68 ppb`,
        nominal: latestFrame.cabinCo2MmHg <= 3.5 && latestFrame.cabinPressurePsi >= 13.5,
      },
    ],
    [astronautId, latestFrame, cgmGlucoseMgDl, doseRateMicroSvHr, orbitalSnapshot?.kpIndex, co2PpmEquiv]
  );

  const selectedNode = hardwareNodes.find((n) => n.id === selectedNodeId) || hardwareNodes[0];

  // Local onboard edge inference assessment (no cloud round-trip required)
  const edgeInference = useMemo(() => {
    const flags: string[] = [];
    if (latestFrame.heartRate > 105) flags.push('Tachycardia drift');
    if (latestFrame.spo2 < 93) flags.push('Hypoxemia threshold');
    if (latestFrame.cabinCo2MmHg > 3.5) flags.push('Hypercapnic cabin CO2');
    if (latestFrame.cabinPressurePsi < 13.5) flags.push('Pressure drop');

    return {
      status: flags.length === 0 ? 'NOMINAL' : latestFrame.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
      summary:
        flags.length === 0
          ? '30s rolling window clear: zero arrhythmia, SpO2 desaturation, or CO2 excursions detected.'
          : `Onboard anomaly flagged locally: ${flags.join(' · ')}.`,
      latencyMs: 3.4,
    };
  }, [latestFrame]);

  const activeJsonPayload = useMemo(() => {
    if (protocolMode === 'DTN_BUFFER') {
      return JSON.stringify(
        {
          protocol: 'BPv7-DTN',
          custody: 'ONBOARD_NVM_BUFFER',
          bundleSeq: packetSeq,
          destination: 'dtn://mcc-houston/flight-surgeon',
          bufferedBundles: dtnBundles.length,
          payload: {
            hr: latestFrame.heartRate,
            spo2: latestFrame.spo2,
            co2_mmHg: latestFrame.cabinCo2MmHg,
            glucose_mgdL: cgmGlucoseMgDl,
          },
        },
        null,
        2
      );
    }

    return JSON.stringify(
      {
        protocol: transportMode === 'WEBSOCKET_LIVE' ? 'MQTTv5->WSS' : 'MQTTv5->EDGE',
        topic: selectedNode.topic,
        qos: 1,
        seq: packetSeq,
        ts: latestFrame.timestamp,
        metrics: {
          hr_bpm: latestFrame.heartRate,
          spo2_pct: latestFrame.spo2,
          hrv_ms: latestFrame.hrv,
          dose_uSv_hr: doseRateMicroSvHr,
          co2_ppm: co2PpmEquiv,
        },
      },
      null,
      2
    );
  }, [
    protocolMode,
    packetSeq,
    dtnBundles.length,
    latestFrame,
    cgmGlucoseMgDl,
    transportMode,
    selectedNode.topic,
    doseRateMicroSvHr,
    co2PpmEquiv,
  ]);

  const signalBars = (rssi: number) => {
    if (rssi >= -55) return 4;
    if (rssi >= -63) return 3;
    if (rssi >= -72) return 2;
    return 1;
  };

  return (
    <section
      className="bg-[#101B30]/90 border border-[#00E5FF]/20 rounded-2xl p-3.5 sm:p-6 space-y-5 overflow-hidden min-w-0"
      aria-label="IoT and Edge Hardware Grid"
    >
      {/* SECTION HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 border-b border-slate-800/80 pb-4 min-w-0">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
            <Bluetooth className="w-4 h-4 shrink-0" />
            <span>Space IoT Mesh &amp; Edge Hardware Telemetry</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            IoT &amp; Edge Hardware Grid
          </h3>
          <p className="text-xs text-slate-400 max-w-2xl">
            Live BLE wearables, Suite Ride CGM, CPDS radiation dosimetry, ESP32 air-quality nodes, and switchable MQTT / DTN telemetry transport.
          </p>
        </div>

        {/* PROTOCOL TRANSPORT TOGGLE (MQTT/WS vs DTN BUFFER) */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0B1224] p-1.5 rounded-xl border border-slate-800 w-full lg:w-auto min-w-0">
          <button
            type="button"
            onClick={() => handleToggleProtocol('MQTT_WS')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer min-h-[40px] ${
              protocolMode === 'MQTT_WS'
                ? 'bg-cyan-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wifi className="w-3.5 h-3.5 shrink-0" />
            <span>MQTT / WebSocket</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleProtocol('DTN_BUFFER')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono transition-colors cursor-pointer min-h-[40px] ${
              protocolMode === 'DTN_BUFFER'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5 shrink-0" />
            <span>DTN Buffer (Blackout)</span>
          </button>
        </div>
      </div>

      {/* ONBOARD EDGE INFERENCE STATUS BAR */}
      <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 min-w-0 overflow-hidden">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <Cpu
            className={`w-5 h-5 shrink-0 mt-0.5 sm:mt-0 ${
              edgeInference.status === 'NOMINAL'
                ? 'text-emerald-400'
                : edgeInference.status === 'WARNING'
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-mono">
              <span className="text-white font-bold">Onboard Edge Inference Engine</span>
              <span className="text-slate-600">·</span>
              <span
                className={`font-bold ${
                  edgeInference.status === 'NOMINAL'
                    ? 'text-emerald-400'
                    : edgeInference.status === 'WARNING'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {edgeInference.status === 'NOMINAL' ? '● Nominal' : edgeInference.status === 'WARNING' ? '▲ Drifting' : '✖ Alert'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{edgeInference.summary}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] font-mono text-slate-400 shrink-0">
          <span className="tabular-nums">Latency: <strong className="text-cyan-300">{edgeInference.latencyMs} ms</strong></span>
          <span className="text-slate-700">·</span>
          <span className="tabular-nums">Bundles Flushed: <strong className="text-emerald-300">{flushedCount}</strong></span>
        </div>
      </div>

      {/* 1. ACTIVE IOT MESH STATUS CARDS (RESPONSIVE GRID, STACKS ON MOBILE) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 min-w-0">
        {hardwareNodes.map((node) => {
          const isSelected = node.id === selectedNode.id;
          const bars = signalBars(node.rssiDbm);

          return (
            <button
              key={node.id}
              type="button"
              onClick={() => setSelectedNodeId(node.id)}
              className={`text-left rounded-xl p-4 border transition-colors cursor-pointer min-w-0 overflow-hidden flex flex-col justify-between gap-3 ${
                isSelected
                  ? 'bg-[#091325] border-cyan-400/70'
                  : 'bg-[#0B1224] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {node.category} · {node.transport}
                  </div>
                  <div className="text-sm font-bold text-white mt-0.5 truncate">{node.name}</div>
                </div>

                {/* Signal Strength & Semantic State */}
                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px]">
                  <span className="flex items-end gap-0.5 h-3.5" aria-label={`Signal ${node.rssiDbm} dBm`}>
                    {[1, 2, 3, 4].map((lvl) => (
                      <span
                        key={lvl}
                        className={`w-1 rounded-xs ${
                          lvl <= bars ? 'bg-cyan-400' : 'bg-slate-700'
                        }`}
                        style={{ height: `${lvl * 3 + 2}px` }}
                      />
                    ))}
                  </span>
                  <span className="text-slate-300 tabular-nums">{node.rssiDbm} dBm</span>
                </div>
              </div>

              {/* Primary Live Telemetry Readout */}
              <div className="flex flex-wrap items-baseline justify-between gap-2 min-w-0">
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-400">{node.liveMetricLabel}</div>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="text-2xl font-bold text-white font-mono tabular-nums">
                      {node.liveMetricValue}
                    </span>
                    <span className="text-xs font-mono text-cyan-400">{node.liveMetricUnit}</span>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-mono font-bold shrink-0 ${
                    node.nominal ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {node.nominal ? '● Nominal' : '▲ Check'}
                </span>
              </div>

              {/* Footer Metadata (Clean Unboxed Text) */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 min-w-0">
                <span className="truncate">{node.secondaryReading}</span>
                <span className="text-slate-300 tabular-nums shrink-0">Bat {node.batteryPct}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. PROTOCOL PACKET INSPECTOR + HARDWARE DIAGNOSTIC SUITE (RESPONSIVE SPLIT) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 min-w-0">
        {/* PROTOCOL PACKET INSPECTOR */}
        <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-4 space-y-3 min-w-0 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <Radio className={`w-4 h-4 shrink-0 ${protocolMode === 'DTN_BUFFER' ? 'text-amber-400' : 'text-cyan-400'}`} />
              <h4 className="text-sm font-bold text-white truncate">Protocol Packet Inspector</h4>
            </div>
            <span
              className={`text-[11px] font-mono font-bold ${
                protocolMode === 'DTN_BUFFER' ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {protocolMode === 'DTN_BUFFER' ? '▲ DTN Store-and-Forward Active' : '● MQTT / WS Streaming'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-300">
            <span>
              Mode:{' '}
              <strong className="text-white">
                {protocolMode === 'DTN_BUFFER' ? 'BPv7 DTN Bundle Buffer' : 'MQTT v5 Pub/Sub -> WebSocket'}
              </strong>
            </span>
            <span className="tabular-nums">
              Seq: <strong className="text-cyan-300">#{packetSeq}</strong>
            </span>
            <span className="tabular-nums">
              Queued: <strong className={dtnBundles.length > 0 ? 'text-amber-300' : 'text-emerald-300'}>{dtnBundles.length + syncState.pendingCount}</strong>
            </span>
          </div>

          <pre className="w-full max-w-full overflow-x-auto bg-[#050816] border border-slate-800 rounded-lg p-3 text-[11px] font-mono text-cyan-200 leading-relaxed whitespace-pre-wrap break-words">
            {activeJsonPayload}
          </pre>

          {protocolMode === 'DTN_BUFFER' ? (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <span className="text-amber-300 font-semibold flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 shrink-0" />
                  <span>Local DTN Custody Buffer ({dtnBundles.length} frames)</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleToggleProtocol('MQTT_WS')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>Restore Link &amp; Flush</span>
                </button>
              </div>
              <div className="max-h-28 overflow-y-auto space-y-1 text-[11px] font-mono">
                {dtnBundles.slice(0, 4).map((b) => (
                  <div
                    key={b.bundleId}
                    className="flex flex-wrap items-center justify-between gap-2 bg-[#050816] px-2.5 py-1.5 rounded border border-slate-800/80 text-slate-300"
                  >
                    <span className="text-amber-300 font-bold">{b.bundleId}</span>
                    <span className="truncate max-w-full">{b.summary}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Simulate lunar far-side / Mars blackout to test DTN bundle buffering.</span>
              <button
                type="button"
                onClick={() => handleToggleProtocol('DTN_BUFFER')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-[11px] cursor-pointer shrink-0"
              >
                Simulate Blackout
              </button>
            </div>
          )}
        </div>

        {/* HARDWARE DIAGNOSTIC SUITE (SELECTED SENSOR NODE) */}
        <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-4 space-y-3.5 min-w-0 overflow-hidden flex flex-col justify-between">
          <div className="space-y-3 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <BatteryCharging className="w-4 h-4 text-emerald-400 shrink-0" />
                <h4 className="text-sm font-bold text-white truncate">Hardware Diagnostic Suite</h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400 truncate">{selectedNode.vendorModel}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="bg-[#050816] border border-slate-800 rounded-lg p-2.5 min-w-0">
                <div className="text-[10px] text-slate-400">Battery</div>
                <div className="text-base font-bold text-emerald-400 tabular-nums mt-0.5">{selectedNode.batteryPct}%</div>
                <div className="text-[10px] text-slate-500 tabular-nums">~{selectedNode.estimatedHoursLeft}h left</div>
              </div>

              <div className="bg-[#050816] border border-slate-800 rounded-lg p-2.5 min-w-0">
                <div className="text-[10px] text-slate-400">Link RSSI</div>
                <div className="text-base font-bold text-cyan-300 tabular-nums mt-0.5">{selectedNode.rssiDbm} dBm</div>
                <div className="text-[10px] text-slate-500 truncate">{selectedNode.transport}</div>
              </div>

              <div className="bg-[#050816] border border-slate-800 rounded-lg p-2.5 min-w-0">
                <div className="text-[10px] text-slate-400">Dosimeter</div>
                <div className="text-base font-bold text-amber-300 tabular-nums mt-0.5">{doseRateMicroSvHr}</div>
                <div className="text-[10px] text-slate-500">µSv/hr local</div>
              </div>

              <div className="bg-[#050816] border border-slate-800 rounded-lg p-2.5 min-w-0">
                <div className="text-[10px] text-slate-400">Cadence</div>
                <div className="text-xs font-bold text-white mt-1 truncate">{selectedNode.sampleRateHz}</div>
                <div className="text-[10px] text-slate-500">Zero-G Calibrated</div>
              </div>
            </div>

            <div className="bg-[#050816] border border-slate-800 rounded-lg p-3 space-y-1.5 text-xs font-mono">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-400">Node Endpoint Topic</span>
                <span className="text-cyan-300 break-all">{selectedNode.topic}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-400">Last Calibration Timestamp</span>
                <span className="text-emerald-300">{calibrationTimes[selectedNode.id]}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              {selectedNode.nominal ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <span>Self-test &amp; impedance verification ready</span>
            </div>

            <button
              type="button"
              onClick={() => handleRunCalibration(selectedNode.id)}
              disabled={calibratingNodeId === selectedNode.id}
              className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer min-h-[38px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${calibratingNodeId === selectedNode.id ? 'animate-spin' : ''}`} />
              <span>{calibratingNodeId === selectedNode.id ? 'Calibrating...' : 'Run Calibration Check'}</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
