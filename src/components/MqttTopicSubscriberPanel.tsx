import React, { useState, useEffect } from 'react';
import { Radio, Wifi, CheckCircle2, Layers, Pause, Play } from 'lucide-react';
import { telemetryStreamEngine } from '../services/telemetryStreamEngine';
import { MqttBrokerStats, MqttMessage } from '../services/mqttClientService';

interface MqttTopicSubscriberPanelProps {
  astronautId: string;
}

interface TopicPreset {
  filter: string;
  label: string;
  category: 'Biometric' | 'Metabolic' | 'Environmental' | 'All Mesh';
  sensorSource: string;
}

const TOPIC_PRESETS: TopicPreset[] = [
  {
    filter: 'space/crew/+/vitals',
    label: 'Biometric Vitals',
    category: 'Biometric',
    sensorSource: 'CSA Bio-Monitor & Oura Ring',
  },
  {
    filter: 'space/crew/+/metabolic',
    label: 'Metabolic CGM',
    category: 'Metabolic',
    sensorSource: 'Suite Ride Glucose Filament',
  },
  {
    filter: 'space/habitat/eclss/air',
    label: 'Habitat Air Quality',
    category: 'Environmental',
    sensorSource: 'ESP32-S3 ECLSS Air Mesh',
  },
  {
    filter: 'space/habitat/cpds/radiation',
    label: 'Radiation & Dosimetry',
    category: 'Environmental',
    sensorSource: 'CPDS Micro-Dosimeter',
  },
  {
    filter: 'space/#',
    label: 'All Habitat Topics (#)',
    category: 'All Mesh',
    sensorSource: 'Full Gateway MQTT Broker',
  },
];

export const MqttTopicSubscriberPanel: React.FC<MqttTopicSubscriberPanelProps> = ({ astronautId }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('space/#');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true);
  const [messages, setMessages] = useState<MqttMessage<any>[]>([]);
  const [brokerStats, setBrokerStats] = useState<MqttBrokerStats>(() =>
    telemetryStreamEngine.getMqttBrokerStats()
  );

  useEffect(() => {
    return telemetryStreamEngine.subscribeMqttStats((stats) => {
      setBrokerStats(stats);
    });
  }, []);

  useEffect(() => {
    if (!isSubscribed) return;

    setMessages(telemetryStreamEngine.getRecentMqttMessages(selectedFilter, 6));
    const unsubscribe = telemetryStreamEngine.subscribeTopic(selectedFilter, (msg) => {
      setMessages((prev) => [msg, ...prev.filter((p) => p.packetId !== msg.packetId)].slice(0, 6));
    });
    return unsubscribe;
  }, [selectedFilter, isSubscribed, astronautId]);

  const activePreset = TOPIC_PRESETS.find((p) => p.filter === selectedFilter) || TOPIC_PRESETS[0];

  return (
    <section
      className="bg-[#101B30]/85 border border-[#00E5FF]/20 rounded-2xl p-4 sm:p-6 space-y-4 overflow-hidden min-w-0"
      aria-label="MQTT Habitat Sensor Topic Subscriptions"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3.5 min-w-0">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-cyan-400">
            <Radio className="w-4 h-4 shrink-0" />
            <span>MQTT v5 Telemetry Pub/Sub Broker</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-bold">
              {isSubscribed ? '● Subscribed' : 'Paused'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Habitat &amp; Biometric MQTT Topic Stream
          </h3>
          <p className="text-xs text-slate-400">
            Subscribe to live biometric and environmental IoT sensor topics on{' '}
            <span className="font-mono text-slate-300 break-all">{brokerStats.brokerUrl}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsSubscribed((s) => !s)}
            className={`px-3 py-2 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer min-h-[38px] ${
              isSubscribed
                ? 'bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/70'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isSubscribed ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isSubscribed ? 'Pause Stream' : 'Resume Stream'}</span>
          </button>
        </div>
      </div>

      {/* Topic Selector Buttons */}
      <div className="flex flex-wrap items-center gap-1.5 min-w-0">
        {TOPIC_PRESETS.map((preset) => {
          const active = selectedFilter === preset.filter;
          return (
            <button
              key={preset.filter}
              type="button"
              onClick={() => setSelectedFilter(preset.filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer max-w-full truncate ${
                active
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-[#0B1224] text-slate-300 border border-slate-800 hover:border-cyan-500/40 hover:text-white'
              }`}
              title={`${preset.filter} (${preset.sensorSource})`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Active Topic & Broker Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono min-w-0">
        <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-3 min-w-0">
          <div className="text-[10px] text-slate-400">Active Filter</div>
          <div className="text-cyan-300 font-bold mt-0.5 truncate" title={selectedFilter}>
            {selectedFilter}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">{activePreset.sensorSource}</div>
        </div>

        <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-3 min-w-0">
          <div className="text-[10px] text-slate-400">Published Packets</div>
          <div className="text-lg font-bold text-white tabular-nums mt-0.5">
            {brokerStats.messagesPublished.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 tabular-nums">
            {brokerStats.messagesDelivered.toLocaleString()} delivered
          </div>
        </div>

        <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-3 min-w-0">
          <div className="text-[10px] text-slate-400">Active Subscriptions</div>
          <div className="text-lg font-bold text-cyan-300 tabular-nums mt-0.5">
            {brokerStats.activeSubscriptions}
          </div>
          <div className="text-[10px] text-slate-500 tabular-nums">
            {brokerStats.retainedTopicsCount} retained topics
          </div>
        </div>

        <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-3 min-w-0">
          <div className="text-[10px] text-slate-400">Payload Volume</div>
          <div className="text-lg font-bold text-emerald-300 tabular-nums mt-0.5">
            {(brokerStats.bytesTransferred / 1024).toFixed(1)} KB
          </div>
          <div className="text-[10px] text-slate-500">QoS 1 · Low Overhead</div>
        </div>
      </div>

      {/* Live Incoming MQTT Topic Frames */}
      <div className="space-y-2 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Recent Topic Payloads ({messages.length})</span>
          </span>
          <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
            <Wifi className="w-3 h-3" />
            <span>QoS 1 · Retained Sync</span>
          </span>
        </div>

        {messages.length === 0 ? (
          <div className="bg-[#0B1224] border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-400">
            Waiting for next 1Hz MQTT sensor publish on {selectedFilter}...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 min-w-0">
            {messages.map((m) => (
              <div
                key={m.packetId}
                className="bg-[#0B1224] border border-slate-800 rounded-xl p-3 space-y-1.5 text-[11px] font-mono min-w-0 overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-1.5">
                  <span className="text-cyan-300 font-bold truncate max-w-full">{m.topic}</span>
                  <span className="text-slate-400 text-[10px] tabular-nums shrink-0">
                    QoS {m.qos} · {m.bytes}B · {new Date(m.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-slate-300 break-words leading-relaxed">
                  {Object.entries(m.payload)
                    .slice(0, 5)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(' · ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
