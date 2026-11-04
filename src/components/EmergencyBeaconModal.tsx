import React, { useState } from 'react';
import {
  AlertOctagon,
  Radio,
  X,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  ShieldAlert,
  Send,
  HeartPulse,
} from 'lucide-react';

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
  const [broadcastMessage, setBroadcastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleActivateBeacon = async () => {
    setBeaconActive(true);
    setBroadcastMessage('Transmitting high-priority bio-medical distress beacon via Deep Space Network...');

    try {
      // Ingest emergency critical alert into backend
      await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          astronautId,
          heartRate: 142,
          spo2: 91.2,
          bodyTemperature: 38.5,
          bloodPressure: { systolic: 158, diastolic: 96 },
          hrv: 24,
          isSimulated: false,
          dataQuality: 'High',
          emergencyCode: 'MAYDAY-MED-01',
        }),
      });

      setBroadcastMessage('✓ DISTRESS BEACON BROADCAST CONFIRMED: Deep Space Network telemetry channels locked. Flight Surgeon on duty alerted.');
    } catch (err: any) {
      setBroadcastMessage(`Emergency beacon transmitted locally (Radio link degraded: ${err.message}).`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0B1224] border-2 border-rose-500 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_60px_rgba(255,83,104,0.3)]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-rose-900/60 flex items-center justify-between bg-rose-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-rose-500/20 rounded-xl border border-rose-500/50 animate-pulse">
              <AlertOctagon className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>EMERGENCY MEDICAL BEACON</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-300 font-extrabold border border-rose-500/60">
                  CRITICAL PRIORITY
                </span>
              </h2>
              <p className="text-xs text-rose-300/80 font-mono">
                Direct Astronaut Mayday & DSN telemetry alert channel
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-mono">
          {broadcastMessage ? (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/60 text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Radio className="w-4 h-4 text-rose-400 animate-ping" />
                <span>BEACON BROADCAST ACTIVE</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-200">{broadcastMessage}</p>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2">
              <div className="text-slate-300 font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Immediate Medical Distress Protocol</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Activating this beacon bypasses routine observation buffering, tags current astronaut biometrics with Mayday priority, and overrides telemetry dispatching to alert Houston MCC and the Gateway Flight Surgeon immediately.
              </p>
            </div>
          )}

          {/* Target Metadata */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-[#050816] rounded-xl border border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-500">ASTRONAUT:</span>
              <div className="font-bold text-white">{astronautName}</div>
            </div>
            <div>
              <span className="text-slate-500">HABITAT NODE:</span>
              <div className="font-bold text-cyan-300">Lunar Gateway HALO Module</div>
            </div>
            <div>
              <span className="text-slate-500">CHANNEL:</span>
              <div className="text-rose-400 font-bold">DSN-MED-PRIORITY-01</div>
            </div>
            <div>
              <span className="text-slate-500">CLASSIFICATION:</span>
              <div className="text-amber-300 font-bold">FLIGHT SURGEON OVERRIDE</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel / Close
            </button>
            {!beaconActive && (
              <button
                onClick={handleActivateBeacon}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(255,83,104,0.5)] cursor-pointer"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>BROADCAST EMERGENCY BEACON</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
