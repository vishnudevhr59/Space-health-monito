import React, { useState } from 'react';
import { AstronautProfile, SleepRecord, WellnessAssessment } from '../types';
import { MetricCard } from '../components/MetricCard';
import {
  Moon,
  Smile,
  ShieldCheck,
  Brain,
  Clock,
  Sparkles,
  Send,
  HeartPulse,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface SleepWellnessPageProps {
  astronaut: AstronautProfile;
  sleepRecords: SleepRecord[];
  onLogWellness: (w: Partial<WellnessAssessment>) => void;
}

export const SleepWellnessPage: React.FC<SleepWellnessPageProps> = ({
  astronaut,
  sleepRecords,
  onLogWellness,
}) => {
  const [moodScore, setMoodScore] = useState<number>(8);
  const [stressScore, setStressScore] = useState<number>(3);
  const [fatigueScore, setFatigueScore] = useState<number>(4);
  const [notes, setNotes] = useState<string>('');
  const [showSubmittedBanner, setShowSubmittedBanner] = useState(false);

  // Sleep breakdown chart data
  const sleepChartData = sleepRecords.slice(-7).map((s) => ({
    date: s.date.slice(5),
    totalHours: s.totalDurationHours,
    deep: +((s.deepSleepPercent * s.totalDurationHours) / 100).toFixed(1),
    rem: +((s.remSleepPercent * s.totalDurationHours) / 100).toFixed(1),
    light: +((s.lightSleepPercent * s.totalDurationHours) / 100).toFixed(1),
    efficiency: s.efficiencyPercent,
  }));

  const handleSubmitAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    onLogWellness({
      moodScore: Number(moodScore),
      stressLevel: Number(stressScore),
      cognitiveFatigue: Number(fatigueScore),
      confinementPerception: 3,
      socialCohesionScore: 9,
      notes: notes || 'Standard daily flight wellness self-assessment.',
    });
    setShowSubmittedBanner(true);
    setTimeout(() => setShowSubmittedBanner(false), 4000);
    setNotes('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Moon className="w-4 h-4" />
            <span>Circadian Neurobiology & Crew Well-being</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Sleep and Mental Wellness Tracking
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Polysomnography stage breakdown, Pittsburgh Sleep Quality Index (PSQI) metrics, and subjective behavioral resilience logs.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>NON-DIAGNOSTIC WELLNESS SYSTEM</span>
        </div>
      </div>

      {showSubmittedBanner && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span>Daily Wellness Assessment logged successfully in encrypted mission record.</span>
        </div>
      )}

      {/* METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <MetricCard
          label="Average Sleep"
          value="6.8"
          unit="Hours"
          statusText="Nominal"
          status="nominal"
          trend="stable"
          trendLabel="Target > 7.0h"
          secondaryInfo="Sleep Pod Quarters"
        />

        <MetricCard
          label="Sleep Efficiency"
          value="86"
          unit="%"
          statusText="Good"
          status="nominal"
          trend="up"
          trendLabel="Awakenings: 1.2 / night"
          secondaryInfo="PSQI Score: 4 (Low Risk)"
        />

        <MetricCard
          label="Deep & REM Stage"
          value="44"
          unit="%"
          statusText="Restorative"
          status="nominal"
          trend="stable"
          trendLabel="Deep: 22% · REM: 22%"
          secondaryInfo="Normal Earth Range"
        />

        <MetricCard
          label="Circadian Phase Shift"
          value="+0.4"
          unit="Hours"
          statusText="Controlled"
          status="nominal"
          trend="stable"
          trendLabel="Solid-State Light Cues"
          secondaryInfo="460nm Blue Enriched"
        />

      </div>

      {/* SLEEP STAGES RECHARTS (STACKED BAR CHART) */}
      <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,229,255,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-[#00E5FF]" />
              <h3 className="text-base font-bold text-white tracking-wide">
                Sleep Architecture (Past 7 Days - Hours per Stage)
              </h3>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Deep Sleep (Slow Wave) + REM + Light Sleep via actigraphy and EEG headband
            </p>
          </div>
          <span className="text-xs font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-3 py-1 rounded-full border border-[#00E5FF]/30">
            Sleep Efficiency Target: &ge; 85%
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sleepChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
              <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" domain={[0, 9]} fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B1224', borderColor: 'rgba(0,229,255,0.3)', borderRadius: '12px', fontSize: '12px', color: '#FFFFFF' }}
                labelStyle={{ color: '#00E5FF', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="deep" name="Deep Sleep (Slow Wave)" stackId="a" fill="#00E5FF" />
              <Bar dataKey="rem" name="REM (Dreaming)" stackId="a" fill="#8B5CF6" />
              <Bar dataKey="light" name="Light Sleep" stackId="a" fill="#334155" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Habitat Acoustic Level during Sleep: 54.2 dBA</span>
          <span className="text-[#21D4A5] font-semibold">Subjective Restfulness: Restorative</span>
        </div>
      </div>

      {/* DAILY WELLNESS SELF-ASSESSMENT FORM (MODULE H) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,229,255,0.03)]">
          <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <Smile className="w-5 h-5 text-[#00E5FF]" />
            <span>Daily Behavioral Health Self-Assessment</span>
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Astronaut self-reporting for mood, operational stress, and cognitive fatigue. Converted to non-diagnostic trend trajectories.
          </p>

          <form onSubmit={handleSubmitAssessment} className="space-y-5 text-xs">
            <div className="bg-[#0B1224]/80 border border-slate-800/80 p-3.5 rounded-xl">
              <div className="flex justify-between font-mono mb-2">
                <span className="text-slate-300 font-medium">Mood & Optimism Index</span>
                <span className="text-[#00E5FF] font-bold text-sm tabular-nums">{moodScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={moodScore}
                onChange={(e) => setMoodScore(Number(e.target.value))}
                className="w-full accent-[#00E5FF] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
                <span>1 - Challenging</span>
                <span>10 - Peak Morale</span>
              </div>
            </div>

            <div className="bg-[#0B1224]/80 border border-slate-800/80 p-3.5 rounded-xl">
              <div className="flex justify-between font-mono mb-2">
                <span className="text-slate-300 font-medium">Operational Stress Level</span>
                <span className="text-[#FFB547] font-bold text-sm tabular-nums">{stressScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={stressScore}
                onChange={(e) => setStressScore(Number(e.target.value))}
                className="w-full accent-[#FFB547] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
                <span>1 - Relaxed / Baseline</span>
                <span>10 - High Stress</span>
              </div>
            </div>

            <div className="bg-[#0B1224]/80 border border-slate-800/80 p-3.5 rounded-xl">
              <div className="flex justify-between font-mono mb-2">
                <span className="text-slate-300 font-medium">Cognitive Fatigue / Workload</span>
                <span className="text-[#8B5CF6] font-bold text-sm tabular-nums">{fatigueScore} / 10</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={fatigueScore}
                onChange={(e) => setFatigueScore(Number(e.target.value))}
                className="w-full accent-[#8B5CF6] cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1.5">
                <span>1 - Fresh / Alert</span>
                <span>10 - Exhausted</span>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-mono mb-1.5">
                Mission Operational Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Completed airlock maintenance without issue; rested well in sleep pod..."
                rows={3}
                className="w-full px-3.5 py-2.5 bg-[#0B1224] border border-slate-700/80 rounded-xl text-white font-sans placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#00E5FF] to-[#438BFF] hover:brightness-110 text-[#050816] font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] cursor-pointer flex items-center justify-center gap-2 text-sm tracking-wide"
            >
              <Send className="w-4 h-4" />
              <span>Submit Daily Wellness Log</span>
            </button>
          </form>
        </div>

        {/* GENERAL WELLNESS & CONFINEMENT MITIGATION RECOMMENDATIONS */}
        <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-[0_4px_24px_rgba(0,229,255,0.03)]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-5 h-5 text-[#8B5CF6]" />
              <h3 className="text-base font-bold text-white">
                NASA Evidence-Based Space Wellness Protocols
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Derived from NASA Behavioral Health and Performance (BHP) analog studies (HERA, NEK, Antarctica Concordia):
            </p>

            <div className="space-y-3.5 text-xs">
              <div className="p-4 rounded-xl bg-[#0B1224]/80 border border-slate-800/80 hover:border-[#00E5FF]/30 transition-colors">
                <h5 className="font-semibold text-[#00E5FF] mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                  Cupola & Earth Observation Time
                </h5>
                <p className="text-slate-300 leading-relaxed text-[12px]">
                  Astronauts consistently report the "Overview Effect" and visual connection to planetary vistas as the single most powerful psychological decompression countermeasure.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B1224]/80 border border-slate-800/80 hover:border-[#438BFF]/30 transition-colors">
                <h5 className="font-semibold text-[#438BFF] mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#438BFF]" />
                  Dynamic Solid-State Lighting
                </h5>
                <p className="text-slate-300 leading-relaxed text-[12px]">
                  Blue-enriched (460 nm) illumination upon waking suppresses melatonin, accelerating cognitive alertness; blue-depleted amber light during dinner stimulates natural somnolence.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0B1224]/80 border border-slate-800/80 hover:border-[#21D4A5]/30 transition-colors">
                <h5 className="font-semibold text-[#21D4A5] mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#21D4A5]" />
                  Autonomous Social Cohesion
                </h5>
                <p className="text-slate-300 leading-relaxed text-[12px]">
                  Communal meal gatherings, family audio/video downlinks, and structured crew debriefs maintain mutual trust and prevent group polarization in extreme confinement.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span>NASA Human Research Roadmap (BHP)</span>
            <span className="text-[#00E5FF]">Protocol: Active</span>
          </div>
        </div>

      </div>

    </div>
  );
};
