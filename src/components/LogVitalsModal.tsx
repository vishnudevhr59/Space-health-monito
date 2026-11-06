import React, { useState } from 'react';
import {
  Heart,
  Droplets,
  Thermometer,
  Activity,
  X,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { HealthMeasurement } from '../types';

interface LogVitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogMeasurement: (meas: Partial<HealthMeasurement>) => Promise<void>;
  astronautId: string;
}

export const LogVitalsModal: React.FC<LogVitalsModalProps> = ({
  isOpen,
  onClose,
  onLogMeasurement,
  astronautId,
}) => {
  const [heartRate, setHeartRate] = useState<number>(68);
  const [spo2, setSpo2] = useState<number>(98.4);
  const [bodyTemp, setBodyTemp] = useState<number>(36.6);
  const [systolic, setSystolic] = useState<number>(116);
  const [diastolic, setDiastolic] = useState<number>(74);
  const [hrv, setHrv] = useState<number>(62);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    // Physiological standard checks
    if (heartRate < 30 || heartRate > 220) {
      setStatusMessage('Heart Rate out of biological limits (30-220 BPM).');
      setIsSubmitting(false);
      return;
    }
    if (spo2 < 70 || spo2 > 100) {
      setStatusMessage('SpO2 saturation must be between 70% and 100%.');
      setIsSubmitting(false);
      return;
    }
    if (bodyTemp < 32 || bodyTemp > 43) {
      setStatusMessage('Core Body Temperature must be between 32°C and 43°C.');
      setIsSubmitting(false);
      return;
    }

    try {
      await onLogMeasurement({
        astronautId,
        heartRate,
        spo2,
        bodyTemperature: bodyTemp,
        bloodPressure: { systolic, diastolic },
        hrv,
        respiratoryRate: 14,
        dataQuality: 'High',
        isSimulated: false,
      });

      setStatusMessage('✓ Telemetry packet recorded and queued for station synchronization!');
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 900);
    } catch (err: any) {
      setStatusMessage(`Submission error: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0B1224] border border-[#00E5FF]/40 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,229,255,0.15)]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#050816]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#00E5FF]/10 rounded-lg border border-[#00E5FF]/30">
              <Activity className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-1.5">
                <span>Direct Telemetry Ingestion</span>
                <span className="text-[10px] font-mono font-normal text-[#00E5FF] px-1.5 py-0.5 rounded bg-[#00E5FF]/10">
                  ASTRONAUT LOG
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Manual physiological data entry with NASA standard range validation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:outline-none"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono">
          {statusMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
                statusMessage.startsWith('✓')
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-700/60'
                  : 'bg-rose-950/50 text-rose-300 border border-rose-700/60'
              }`}
            >
              {statusMessage.startsWith('✓') ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {/* Heart Rate */}
            <div className="space-y-1">
              <label className="text-slate-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                <span>Heart Rate (BPM)</span>
              </label>
              <input
                type="number"
                min="35"
                max="210"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                required
                className="w-full bg-[#101B30] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            {/* SpO2 */}
            <div className="space-y-1">
              <label className="text-slate-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>SpO2 Saturation (%)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="75"
                max="100"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                required
                className="w-full bg-[#101B30] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            {/* Core Temp */}
            <div className="space-y-1">
              <label className="text-slate-400 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                <span>Core Temp (°C)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="34"
                max="41"
                value={bodyTemp}
                onChange={(e) => setBodyTemp(Number(e.target.value))}
                required
                className="w-full bg-[#101B30] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            {/* HRV */}
            <div className="space-y-1">
              <label className="text-slate-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                <span>HRV (RMSSD ms)</span>
              </label>
              <input
                type="number"
                min="10"
                max="150"
                value={hrv}
                onChange={(e) => setHrv(Number(e.target.value))}
                required
                className="w-full bg-[#101B30] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            {/* Blood Pressure Systolic */}
            <div className="space-y-1">
              <label className="text-slate-400">BP Systolic (mmHg)</label>
              <input
                type="number"
                min="80"
                max="200"
                value={systolic}
                onChange={(e) => setSystolic(Number(e.target.value))}
                required
                className="w-full bg-[#101B30] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            {/* Blood Pressure Diastolic */}
            <div className="space-y-1">
              <label className="text-slate-400">BP Diastolic (mmHg)</label>
              <input
                type="number"
                min="50"
                max="120"
                value={diastolic}
                onChange={(e) => setDiastolic(Number(e.target.value))}
                required
                className="w-full bg-[#101B30] border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Offline queue & DSN sync active</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#00E5FF]/90 text-slate-950 font-bold transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] disabled:opacity-50"
              >
                {isSubmitting ? 'Recording...' : 'Record Vitals'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
