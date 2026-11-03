import React from 'react';
import { AstronautProfile, ActivityRecord } from '../types';
import { MetricCard } from '../components/MetricCard';
import {
  Dna,
  Zap,
  Activity,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  FileText,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface BoneMusclePageProps {
  astronaut: AstronautProfile;
  activityRecords: ActivityRecord[];
}

export const BoneMusclePage: React.FC<BoneMusclePageProps> = ({
  astronaut,
  activityRecords,
}) => {
  // Historical DEXA trajectory: Unmitigated microgravity loss (-1.2%/mo) vs With ARED Countermeasure (-0.85%/mo)
  const bmdProjectionData = [
    { month: 'Pre-Flight', unmitigated: 100.0, withAred: 100.0, currentAstro: 100.0 },
    { month: 'Month 1', unmitigated: 98.6, withAred: 99.2, currentAstro: 99.2 },
    { month: 'Month 2', unmitigated: 97.3, withAred: 98.4, currentAstro: 98.3 },
    { month: 'Month 3', unmitigated: 96.0, withAred: 97.6, currentAstro: 97.4 },
    { month: 'Month 4', unmitigated: 94.7, withAred: 96.8, currentAstro: 96.6 },
    { month: 'Month 5 (Now)', unmitigated: 93.4, withAred: 96.0, currentAstro: 95.8 },
    { month: 'Month 6', unmitigated: 92.1, withAred: 95.2 },
    { month: 'Month 12', unmitigated: 84.5, withAred: 91.0 },
  ];

  const exerciseWeekData = activityRecords.slice(-7).map((act) => ({
    date: act.date.slice(5),
    type: act.exerciseType.split(' ')[0],
    duration: act.durationMinutes,
    calories: act.caloriesBurned,
    peakHr: act.peakHeartRate,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Dna className="w-4 h-4" />
            <span>Musculoskeletal Integrity & Biomechanics</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Bone and Muscle Health Tracking
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            ARED resistive exercise performance, bone resorption biochemical markers, and muscle volume retention models.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>ARED COMPLIANCE: 96%</span>
        </div>
      </div>

      {/* METRIC STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        
        <MetricCard
          label="Bone Density Loss Rate"
          value={astronaut.boneDensityLossRatePercentPerMonth}
          unit="% / mo"
          statusText="Mitigated"
          status="nominal"
          trend="down"
          trendLabel="Target < 1.0%/mo"
          secondaryInfo="Lumbar / Femur"
        />

        <MetricCard
          label="Muscle Volume Retention"
          value="96.2"
          unit="%"
          statusText="Preserved"
          status="nominal"
          trend="stable"
          trendLabel="Baseline: Pre-flight"
          secondaryInfo="Treadmill + Cycle"
        />

        <MetricCard
          label="Daily Resistive Session"
          value="65"
          unit="Mins"
          statusText="ARED Active"
          status="nominal"
          trend="up"
          trendLabel="600 lbs simulated load"
          secondaryInfo="Deadlift / Squats"
        />

        <MetricCard
          label="Resorption Marker (NTx)"
          value="48.2"
          unit="nM BCE"
          statusText="Stable"
          status="nominal"
          trend="stable"
          trendLabel="Target < 60 nM"
          secondaryInfo="Urine Cross-link assay"
        />

      </div>

      {/* CHARTS: BONE DENSITY LOSS PROJECTION & EXERCISE LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: DEXA Bone Mineral Density Trajectory */}
        <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,229,255,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Dna className="w-4 h-4 text-[#00E5FF]" />
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Bone Mineral Density (BMD) Retention Curve
                </h4>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Unmitigated Spaceflight vs High-Load ARED Protocol
              </p>
            </div>
            <span className="text-xs font-mono text-[#21D4A5] bg-[#21D4A5]/10 px-2.5 py-1 rounded-full border border-[#21D4A5]/30">
              ARED Attenuation Active
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bmdProjectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" domain={[80, 102]} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1224', borderColor: 'rgba(0,229,255,0.3)', borderRadius: '12px', fontSize: '12px', color: '#FFFFFF' }}
                  labelStyle={{ color: '#00E5FF', fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="withAred"
                  name="With ARED Protocol (%)"
                  stroke="#21D4A5"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="unmitigated"
                  name="Unmitigated Microgravity (%)"
                  stroke="#FF5368"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="currentAstro"
                  name="CDR Chen Telemetry (%)"
                  stroke="#00E5FF"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#00E5FF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800/80">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#00E5FF] rounded-sm inline-block" /> CDR Chen Observation</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#21D4A5] rounded-sm inline-block" /> Expected with ARED</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-1 bg-[#FF5368] rounded-sm inline-block border-b border-dashed" /> Zero Countermeasure</span>
          </div>
        </div>

        {/* Chart 2: Recent Exercise Workloads */}
        <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 shadow-[0_4px_24px_rgba(0,229,255,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#438BFF]" />
                <h4 className="text-sm font-bold text-white tracking-wide">
                  Physical Countermeasure Workload (Past 7 Days)
                </h4>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Duration (Mins) & Peak Cardiovascular Response
              </p>
            </div>
            <span className="text-xs font-mono text-[#00E5FF] bg-[#00E5FF]/10 px-2.5 py-1 rounded-full border border-[#00E5FF]/30">
              Protocol: 2.5 hrs/day
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={exerciseWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" domain={[0, 90]} fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0B1224', borderColor: 'rgba(0,229,255,0.3)', borderRadius: '12px', fontSize: '12px', color: '#FFFFFF' }}
                  labelStyle={{ color: '#00E5FF', fontWeight: 'bold' }}
                />
                <Bar dataKey="duration" name="Duration (Mins)" fill="#00E5FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-3 border-t border-slate-800/80">
            <span>Countermeasures: ARED + T2 Treadmill + CEVIS</span>
            <span className="text-[#00E5FF] font-semibold">Target Met: 7 / 7 Sessions</span>
          </div>
        </div>

      </div>

      {/* BIOMECHANICAL SKELETAL STRAIN HUD & SCIENTIFIC PRINCIPLES */}
      <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_4px_24px_rgba(0,229,255,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00E5FF]" />
              <span>Biomechanical Countermeasures & Skeletal Microgravity Dynamics</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Mechanotransduction pathways, osteoclast suppression, and vacuum cylinder resistance principles.
            </p>
          </div>
          <span className="text-xs font-mono text-[#8B5CF6] bg-[#8B5CF6]/10 px-3 py-1 rounded-full border border-[#8B5CF6]/30 self-start sm:self-auto">
            NASA HRP Discipline: Bone & Muscle
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          <div className="p-5 rounded-xl bg-[#0B1224]/80 border border-slate-800/80 hover:border-[#00E5FF]/40 transition-colors">
            <div className="flex items-center gap-2 text-[#00E5FF] font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
              <h5>Mechanotransduction Loss</h5>
            </div>
            <p className="text-slate-300 leading-relaxed text-[12px]">
              Without constant 1-G axial strain, osteocyte fluid-flow shear stress ceases, halting the signals that prompt osteoblasts to synthesize bone matrix while osteoclasts accelerate resorption. Over an unmitigated 3-year Mars mission, up to 50% of trabecular calcaneus volume can be sacrificed.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0B1224]/80 border border-slate-800/80 hover:border-[#438BFF]/40 transition-colors">
            <div className="flex items-center gap-2 text-[#438BFF] font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#438BFF]" />
              <h5>ARED Vacuum Resistance</h5>
            </div>
            <p className="text-slate-300 leading-relaxed text-[12px]">
              Weights fail in zero-g because mass has no gravitational pull. The Advanced Resistive Exercise Device (ARED) employs evacuated dual vacuum cylinders paired with inertia-flywheels to apply up to 600 lbs of linear biomechanical resistance during squats, deadlifts, and heel raises.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-[#0B1224]/80 border border-slate-800/80 hover:border-[#21D4A5]/40 transition-colors">
            <div className="flex items-center gap-2 text-[#21D4A5] font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-[#21D4A5]" />
              <h5>Bisphosphonate Synergy</h5>
            </div>
            <p className="text-slate-300 leading-relaxed text-[12px]">
              NASA Human Research Program (HRP) clinical trials demonstrated that combining high-load ARED training with once-weekly oral bisphosphonates (antiresorptive agent) and 800 IU daily Vitamin D almost completely preserves bone density in long-duration ISS crewmembers.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
