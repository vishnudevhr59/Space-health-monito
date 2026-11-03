import React, { useState } from 'react';
import { AstronautProfile, User } from '../types';
import {
  Sliders,
  User as UserIcon,
  ShieldCheck,
  Bell,
  Gauge,
  Save,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface SettingsPageProps {
  astronaut: AstronautProfile;
  currentUser: User;
  onUpdateAstronaut: (updated: Partial<AstronautProfile>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  astronaut,
  currentUser,
  onUpdateAstronaut,
}) => {
  const [restingHrBaseline, setRestingHrBaseline] = useState(astronaut.baselineVitals?.restingHeartRate || 58);
  const [spo2Threshold, setSpo2Threshold] = useState(astronaut.baselineVitals?.spo2 || 98.4);
  const [radiationLimit, setRadiationLimit] = useState(astronaut.radiationMissionLimitMSv || 250);
  const [tempUnit, setTempUnit] = useState<'Celsius' | 'Fahrenheit'>('Celsius');
  const [pressureUnit, setPressureUnit] = useState<'kPa' | 'mmHg'>('kPa');
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [autoAcknowledgeAdvisory, setAutoAcknowledgeAdvisory] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAstronaut({
      radiationMissionLimitMSv: Number(radiationLimit),
      baselineVitals: {
        ...astronaut.baselineVitals,
        restingHeartRate: Number(restingHrBaseline),
        spo2: Number(spo2Threshold),
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Mission Hardware & Calibration Profile</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            System & Mission Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure astronaut baseline thresholds, environmental units, and notification preferences.
          </p>
        </div>

        {isSaved && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved & Synchronized</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ASTRONAUT PROFILE CALIBRATION */}
        <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-5">
          <div className="flex items-center gap-2 text-base font-bold text-white tracking-wide">
            <UserIcon className="w-5 h-5 text-[#00E5FF]" />
            <span>Assigned Astronaut Pre-Flight Baseline</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Astronaut Name</label>
              <input
                type="text"
                disabled
                value={astronaut.name}
                className="w-full px-3.5 py-2.5 bg-[#0B1224] border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Mission Callsign</label>
              <input
                type="text"
                disabled
                value={astronaut.callsign}
                className="w-full px-3.5 py-2.5 bg-[#0B1224] border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Resting Heart Rate Baseline (BPM)</label>
              <input
                type="number"
                value={restingHrBaseline}
                onChange={(e) => setRestingHrBaseline(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#0B1224] border border-slate-700/80 rounded-xl text-[#00E5FF] font-bold text-base tabular-nums focus:outline-none focus:border-[#00E5FF]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Used for dashed chart reference lines in Mission Control</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">SpO2 Nominal Baseline (%)</label>
              <input
                type="number"
                step="0.1"
                value={spo2Threshold}
                onChange={(e) => setSpo2Threshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#0B1224] border border-slate-700/80 rounded-xl text-sky-400 font-bold text-base tabular-nums focus:outline-none focus:border-[#00E5FF]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Used for dashed chart reference lines in Mission Control</span>
            </div>
          </div>
        </div>

        {/* MEDICAL SAFETY THRESHOLDS */}
        <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-5">
          <div className="flex items-center gap-2 text-base font-bold text-white tracking-wide">
            <ShieldCheck className="w-5 h-5 text-[#FFB547]" />
            <span>Mission Permissible Exposure Limits (PEL)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Cumulative Radiation Mission Limit (mSv)</label>
              <input
                type="number"
                value={radiationLimit}
                onChange={(e) => setRadiationLimit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#0B1224] border border-slate-700/80 rounded-xl text-[#FFB547] font-bold text-base tabular-nums focus:outline-none focus:border-[#00E5FF]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Artemis Gateway Standard: 250 mSv</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Temperature Unit</label>
              <div className="flex gap-2">
                {(['Celsius', 'Fahrenheit'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setTempUnit(u)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs transition-all cursor-pointer font-medium ${
                      tempUnit === u ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/60 font-bold shadow-[0_0_12px_rgba(0,229,255,0.2)]' : 'bg-[#0B1224] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {u} ({u === 'Celsius' ? '°C' : '°F'})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ALERTS & NOTIFICATIONS PREFERENCES */}
        <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-5">
          <div className="flex items-center gap-2 text-base font-bold text-white tracking-wide">
            <Bell className="w-5 h-5 text-[#00E5FF]" />
            <span>Audio & Visual Alert Protocols</span>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-4 rounded-xl bg-[#0B1224]/80 border border-slate-800/80 cursor-pointer hover:border-[#00E5FF]/30 transition-colors">
              <div>
                <div className="font-semibold text-white">Audible Habitat Triage Chime</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Emit sound tones when Critical severity alerts are generated</div>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={(e) => setAudioAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#00E5FF] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-[#0B1224]/80 border border-slate-800/80 cursor-pointer hover:border-[#00E5FF]/30 transition-colors">
              <div>
                <div className="font-semibold text-white">Auto-Acknowledge Low-Severity Advisories</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Automatically clear ground station telemetry packet gaps after 15 minutes</div>
              </div>
              <input
                type="checkbox"
                checked={autoAcknowledgeAdvisory}
                onChange={(e) => setAutoAcknowledgeAdvisory(e.target.checked)}
                className="w-4 h-4 accent-[#00E5FF] cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-7 py-3 bg-gradient-to-r from-[#00E5FF] to-[#438BFF] hover:brightness-110 text-[#050816] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
};
