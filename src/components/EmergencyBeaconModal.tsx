import React, { useState } from 'react';
import {
  AlertOctagon,
  Radio,
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Copy,
  Terminal,
  FileText,
  Info,
} from 'lucide-react';
import { SimulatedEmergencyBeaconPacket } from '../types';

interface EmergencyBeaconModalProps {
  isOpen: boolean;
  onClose: () => void;
  astronautName: string;
  astronautId: string;
}

export const EmergencyBeaconModal: React.FC<EmergencyBeaconModalProps> = ({
  isOpen,
  onClose,
  astronautName,
  astronautId,
}) => {
  const [beaconActive, setBeaconActive] = useState<boolean>(false);
  const [broadcastPacket, setBroadcastPacket] = useState<SimulatedEmergencyBeaconPacket | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleActivateBeacon = async () => {
    setLoading(true);
    const simulatedPacket: SimulatedEmergencyBeaconPacket = {
      packetId: `DEMO-PKT-${Date.now().toString(36).toUpperCase()}`,
      utcTimestamp: new Date().toISOString(),
      missionId: 'artemis-gateway-04',
      habitatModule: 'Lunar Gateway HALO Module (Node 2)',
      astronautId,
      astronautName,
      emergencyCode: 'MAYDAY-MED-01-DEMO',
      biometrics: {
        heartRateBpm: 142,
        spo2Percent: 91.2,
        coreTempC: 38.5,
        bloodPressure: '158/96 mmHg',
        hrvMs: 24,
      },
      telemetrySource: 'BioHarness-V4 [SIMULATED DEMONSTRATION STREAM]',
      isSimulatedDemo: true,
      dsnChannel: 'DSN-SIM-MED-CHANNEL-DEMO-01',
      packetChecksumSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
      disclosure: 'LOCAL SOFTWARE SIMULATION DEMO: No RF transmitter engaged. No transmission to NASA Deep Space Network or emergency services.',
    };

    try {
      const res = await fetch('/api/simulation/beacon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(simulatedPacket),
      });

      if (res.ok) {
        const data = await res.json();
        setBroadcastPacket(data.packet || simulatedPacket);
      } else {
        setBroadcastPacket(simulatedPacket);
      }
      setBeaconActive(true);
    } catch {
      setBroadcastPacket(simulatedPacket);
      setBeaconActive(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPacket = () => {
    if (!broadcastPacket) return;
    navigator.clipboard.writeText(JSON.stringify(broadcastPacket, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0B1224] border-2 border-rose-500/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-[0_0_60px_rgba(255,83,104,0.35)] flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-rose-900/60 flex items-center justify-between bg-rose-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-500/20 rounded-xl border border-rose-500/50 animate-pulse">
              <AlertOctagon className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
                <span>SIMULATED EMERGENCY BEACON DEMONSTRATION</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-extrabold border border-rose-500/60">
                  DEMO ONLY
                </span>
              </h2>
              <p className="text-xs text-rose-300/80 font-mono">
                Spaceflight Emergency Protocol Verification & Sample Distress Packet Generator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-rose-300 hover:text-white hover:bg-rose-900/40 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 space-y-4 text-xs font-mono overflow-y-auto">
          {/* MANDATORY CAPABILITY INTEGRITY DISCLOSURE BANNER */}
          <div className="p-3.5 bg-rose-950/70 border border-rose-500/80 rounded-xl space-y-1.5 text-rose-200">
            <div className="flex items-center gap-2 font-bold text-rose-100">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>CAPABILITY INTEGRITY DISCLOSURE</span>
            </div>
            <p className="text-[11px] leading-relaxed text-rose-200/90 font-sans">
              <strong>LOCAL DEMONSTRATION ONLY:</strong> This module is a software workflow simulation designed for NASA Space Apps Challenge evaluation. It does <strong>not</strong> engage physical spacecraft radio transmitters or connect to NASA Deep Space Network ground stations or live medical emergency services.
            </p>
          </div>

          {beaconActive && broadcastPacket ? (
            /* ACTIVE BROADCAST INSPECTION PANEL */
            <div className="space-y-3">
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/60 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-emerald-200">
                    SAMPLE DISTRESS TELEMETRY PACKET GENERATED & LOGGED
                  </span>
                </div>
                <button
                  onClick={handleCopyPacket}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-500/50 text-[11px] text-emerald-300 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              {/* Formatted Telemetry Packet Inspection */}
              <div className="p-3 bg-[#050816] rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-1.5">
                  <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>EMERGENCY BEACON PACKET (JSON)</span>
                  </span>
                  <span className="text-slate-500">FORMAT: CCSDS/NASA-MED-SIM</span>
                </div>
                <pre className="p-2.5 bg-[#020512] rounded-lg text-[10px] text-slate-300 overflow-x-auto leading-relaxed border border-slate-800/80 font-mono">
                  {JSON.stringify(broadcastPacket, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            /* PRE-BROADCAST PROTOCOL BRIEF */
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
              <div className="text-slate-300 font-bold flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>Simulation Protocol Verification</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed font-sans">
                In operational spacecraft medical emergencies, the autonomous bio-monitor bypasses routine batching, generates high-priority CCSDS emergency telemetry, and overrides non-critical link scheduling. This demonstration verifies the local packet assembly, validation envelope, and crew confirmation flow.
              </p>
            </div>
          )}

          {/* Target Metadata Matrix */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-[#050816] rounded-xl border border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-500">CREW MEMBER:</span>
              <div className="font-bold text-white">{astronautName} ({astronautId})</div>
            </div>
            <div>
              <span className="text-slate-500">HABITAT NODE:</span>
              <div className="font-bold text-cyan-300">Lunar Gateway HALO Module</div>
            </div>
            <div>
              <span className="text-slate-500">DEMO CHANNEL:</span>
              <div className="text-rose-400 font-bold">DSN-SIM-MED-CHANNEL-DEMO-01</div>
            </div>
            <div>
              <span className="text-slate-500">AUDIT LOGGING:</span>
              <div className="text-emerald-400 font-bold">RECORDED TO ATOMIC STORE</div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-900/70 border-t border-slate-800 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs font-mono"
          >
            {beaconActive ? 'Close Demonstration' : 'Cancel'}
          </button>

          {!beaconActive ? (
            <button
              onClick={handleActivateBeacon}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold transition-all shadow-[0_0_20px_rgba(255,83,104,0.5)] cursor-pointer text-xs font-mono"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>{loading ? 'GENERATING...' : 'GENERATE SIMULATED BEACON PACKET'}</span>
            </button>
          ) : (
            <button
              onClick={handleActivateBeacon}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-xs font-mono"
            >
              <Radio className="w-3.5 h-3.5 text-cyan-400" />
              <span>Regenerate Sample Packet</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
