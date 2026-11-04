import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Activity,
  Moon,
  Zap,
  Radio,
  Dna,
  ShieldAlert,
  Brain,
  RefreshCw,
  Filter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import { AstronautProfile } from '../types';

interface MissionTimelineProps {
  astronaut: AstronautProfile;
}

export const MissionTimeline: React.FC<MissionTimelineProps> = ({ astronaut }) => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchTimeline = async () => {
    setIsLoading(true);
    try {
      const catQuery = selectedCategory !== 'ALL' ? `?categories=${selectedCategory}` : '';
      const res = await fetch(`/api/timeline/${astronaut.id}${catQuery}`);
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
      }
    } catch (err) {
      console.warn('Failed to load mission timeline:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [astronaut.id, selectedCategory]);

  const categories = [
    { id: 'ALL', label: 'All Streams' },
    { id: 'Telemetry', label: 'Biometrics' },
    { id: 'Sleep', label: 'Sleep Cycles' },
    { id: 'Exercise', label: 'ARED Loading' },
    { id: 'Environment', label: 'Habitat ECLSS' },
    { id: 'Radiation', label: 'Dosimetry' },
    { id: 'Alert', label: 'Alert Events' },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Telemetry':
        return <Activity className="w-3.5 h-3.5 text-[#00E5FF]" />;
      case 'Sleep':
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Exercise':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'Environment':
        return <Radio className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Radiation':
        return <Dna className="w-3.5 h-3.5 text-purple-400" />;
      case 'Alert':
        return <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#0B1224] border border-[#00E5FF]/20 space-y-6 shadow-xl">
      
      {/* Header and Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#00E5FF] font-semibold block">
            Longitudinal Mission Activity Log
          </span>
          <h3 className="text-lg font-bold font-mono text-white flex items-center gap-2 mt-0.5">
            <Calendar className="w-5 h-5 text-[#00E5FF]" />
            UNIFIED MISSION TIMELINE // SOL 1 TO {astronaut.missionDay}
          </h3>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-5 h-5 text-[#00E5FF] animate-spin" />
          <span className="text-xs font-mono text-slate-400">Filtering mission timeline streams...</span>
        </div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center text-slate-500 font-mono text-xs">
          No records found matching the selected filter criteria.
        </div>
      ) : (
        <div className="space-y-3 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-800">
          {events.map((ev: any) => {
            const dateObj = new Date(ev.timestamp);
            const isAlert = ev.category === 'Alert';
            return (
              <div key={ev.id} className="relative flex items-start gap-4 group">
                {/* Node icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border z-10 transition-transform group-hover:scale-105 ${
                    isAlert
                      ? 'bg-rose-950/40 border-rose-500/40'
                      : 'bg-[#101B30] border-slate-800 group-hover:border-[#00E5FF]/40'
                  }`}
                >
                  {getCategoryIcon(ev.category)}
                </div>

                {/* Event body */}
                <div
                  className={`flex-1 p-3.5 rounded-xl border transition-all ${
                    isAlert
                      ? 'bg-rose-950/15 border-rose-500/30'
                      : 'bg-[#050816] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{ev.title}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 uppercase">
                        {ev.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                      {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{ev.description}</p>

                  <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-1.5">
                    <span>Source: {ev.sourceId}</span>
                    <span className="text-slate-400 font-semibold">{ev.provenance}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Notice */}
      <div className="p-3 rounded-xl bg-[#050816]/70 border border-slate-800 text-[10px] text-slate-500 flex items-center gap-2">
        <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>
          Timeline events are assembled directly from timestamped records in `data/space_health_db.json`. No synthetic records are created to fill sensor gaps.
        </span>
      </div>

    </div>
  );
};
