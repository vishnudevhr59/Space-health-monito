import React from 'react';
import { RadiationRecord } from '../types';
import { MetricCard } from '../components/MetricCard';
import {
  Radio,
  Wind,
  Gauge,
  Thermometer,
  Shield,
  Activity,
  AlertOctagon,
  ExternalLink,
  Volume2,
  Globe,
  Sun,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface EnvironmentPageProps {
  radiation: RadiationRecord[];
}

export const EnvironmentPage: React.FC<EnvironmentPageProps> = ({ radiation }) => {
  const cabinAtmosphere = {
    totalPressureKPa: 101.3,
    o2PartialPressureKPa: 21.3,
    co2PartialPressureMmHg: 2.8,
    cabinTemperatureC: 22.4,
    relativeHumidityPercent: 44.5,
    acousticNoiseLevelDBA: 54.2,
    habLocation: 'Artemis Gateway Habitat Core Module',
  };

  const gcrVsSpeData = [
    { source: 'Galactic Cosmic Rays (GCR)', backgroundRate: 18.5, peakFlux: 24.2, penetration: 'High', particles: 'HZE Heavy Nuclei + Protons' },
    { source: 'Solar Particle Events (SPE)', backgroundRate: 2.1, peakFlux: 48.6, penetration: 'Medium', particles: 'Energetic Protons (10-100 MeV)' },
    { source: 'Van Allen Trapped Protons', backgroundRate: 4.8, peakFlux: 32.0, penetration: 'High', particles: 'Geomagnetically Trapped Particles' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#00E5FF] font-mono text-xs uppercase tracking-wider mb-1 font-bold">
            <Radio className="w-4 h-4" />
            <span>Aerospace Biophysics & Telemetry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Space Environment & Radiation Monitoring
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Dosimetry monitoring outside Earth&apos;s magnetosphere, solar particle flare alerts, and habitat life support telemetry (ECLSS).
          </p>
        </div>

        {/* Storm Shelter Status Badge */}
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 bg-[#101B30] border border-[#00E5FF]/30 p-3 rounded-2xl shadow-sm">
          <Shield className="w-4 h-4 text-[#21D4A5] shrink-0" />
          <span>STORM SHELTER STATUS: <strong className="text-white">STANDBY // NOMINAL</strong></span>
        </div>
      </div>

      {/* EARTH-ORBIT & DEEP SPACE RADIATION REGION VISUALIZATION */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#101B30] via-[#0B1224] to-[#101B30] border border-[#00E5FF]/25 p-6 sm:p-8 shadow-xl overflow-hidden">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-mono uppercase text-[#00E5FF] tracking-wider font-bold">
              Orbital Trajectory & Planetary Shielding Zone
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Lunar Orbital Gateway: Trans-Magnetospheric Telemetry
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              At the Lunar Orbital Gateway, spacecraft operate outside the protective geomagnetic magnetosphere of Earth, where astronauts receive continuous cosmic ray bombardment (~1.5 to 2.0 mSv/day) with zero atmospheric filtration.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs pt-2">
              <div className="p-3 rounded-xl bg-[#050816] border border-slate-800">
                <span className="text-slate-500 text-[10px] block">SOLAR ACTIVITY</span>
                <span className="text-[#21D4A5] font-bold">QUIET (CLASS A)</span>
              </div>
              <div className="p-3 rounded-xl bg-[#050816] border border-slate-800">
                <span className="text-slate-500 text-[10px] block">GCR ION FLUX</span>
                <span className="text-[#00E5FF] font-bold">22.4 μSv / hr</span>
              </div>
              <div className="p-3 rounded-xl bg-[#050816] border border-slate-800">
                <span className="text-slate-500 text-[10px] block">HAB SHIELDING</span>
                <span className="text-white font-bold">78% Attenuation</span>
              </div>
            </div>
          </div>

          {/* SVG Earth-Orbit & Moon Orbital Vector */}
          <div className="lg:col-span-5 relative flex items-center justify-center p-4 bg-[#050816] rounded-2xl border border-slate-800">
            <svg viewBox="0 0 280 200" fill="none" className="w-full h-48">
              {/* Earth representation */}
              <circle cx="60" cy="100" r="32" fill="#0c4a6e" stroke="#00E5FF" strokeWidth="1.5" />
              <path d="M 45 92 Q 60 85, 75 96 Q 65 110, 48 105 Z" fill="#22d3ee" fillOpacity="0.4" />
              
              {/* Van Allen Belt Inner/Outer contours */}
              <ellipse cx="60" cy="100" rx="46" ry="60" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
              <ellipse cx="60" cy="100" rx="60" ry="78" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
              
              {/* Orbital Transfer Trajectory to Moon */}
              <path d="M 60 68 C 110 50, 190 70, 220 100" stroke="#00E5FF" strokeWidth="1.8" strokeDasharray="4 2" />

              {/* Moon Representation */}
              <circle cx="220" cy="100" r="16" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
              <circle cx="224" cy="96" r="3" fill="#334155" />
              <circle cx="216" cy="104" r="2" fill="#334155" />

              {/* Gateway Habitat Node */}
              <circle cx="210" cy="85" r="4" fill="#00E5FF" />
              <circle cx="210" cy="85" r="9" stroke="#00E5FF" strokeWidth="1" className="animate-ping" opacity="0.6" />

              {/* Labels */}
              <text x="45" y="148" fill="#7dd3fc" fontSize="9" fontFamily="monospace">EARTH</text>
              <text x="206" y="130" fill="#cbd5e1" fontSize="9" fontFamily="monospace">MOON</text>
              <text x="160" y="76" fill="#00E5FF" fontSize="9" fontFamily="monospace">GATEWAY</text>
            </svg>
          </div>

        </div>

      </div>

      {/* SPACECRAFT CABIN ATMOSPHERE METRICS */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 font-semibold">
          Environmental Control and Life Support System (ECLSS) Telemetry
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            label="Cabin Pressure"
            value={cabinAtmosphere.totalPressureKPa}
            unit="kPa"
            statusText="Nominal"
            status="nominal"
            trend="stable"
            trendLabel="Sea Level Equiv"
          />

          <MetricCard
            label="O2 Partial"
            value={cabinAtmosphere.o2PartialPressureKPa}
            unit="kPa"
            statusText="21.0%"
            status="nominal"
            trend="stable"
            trendLabel="Normoxic"
          />

          <MetricCard
            label="CO2 Partial"
            value={cabinAtmosphere.co2PartialPressureMmHg}
            unit="mmHg"
            statusText={cabinAtmosphere.co2PartialPressureMmHg > 3.0 ? 'Elevated' : 'Nominal'}
            status={cabinAtmosphere.co2PartialPressureMmHg > 3.0 ? 'warning' : 'nominal'}
            trend="stable"
            trendLabel="Target < 3.0 mmHg"
          />

          <MetricCard
            label="Cabin Temp"
            value={cabinAtmosphere.cabinTemperatureC}
            unit="°C"
            statusText="Optimal"
            status="nominal"
            trend="stable"
            trendLabel="Thermal Loop"
          />

          <MetricCard
            label="Rel Humidity"
            value={cabinAtmosphere.relativeHumidityPercent}
            unit="%"
            statusText="Nominal"
            status="nominal"
            trend="stable"
            trendLabel="Comfort 40-60%"
          />

          <MetricCard
            label="Acoustic Noise"
            value={cabinAtmosphere.acousticNoiseLevelDBA}
            unit="dBA"
            statusText="Within Spec"
            status="nominal"
            trend="stable"
            trendLabel="Ventilation Loop"
          />
        </div>
      </div>

      {/* HISTORICAL RADIATION DOSIMETRY & SOLAR PARTICLE FLUX */}
      <div className="rounded-3xl bg-[#101B30]/80 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white">
              Space Radiation Dosimetry Timeline (7 Days)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Personal Active Silicon Dosimeter + Central Habitat Ionization Chamber
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#FFB547] bg-[#FFB547]/10 border border-[#FFB547]/30 px-3 py-1 rounded-full">
              Current Dose Rate: 22.4 μSv/h
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={radiation.map((r, i) => ({
                time: `Day -${radiation.length - 1 - i}`,
                rate: r.doseRateMicroSvPerHour,
                location: r.sensorLocation,
              }))}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#FFB547" domain={[10, 45]} fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#050816', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', fontFamily: 'JetBrains Mono' }}
              />
              <Area
                type="monotone"
                dataKey="rate"
                name="Dosimeter Rate (μSv/h)"
                stroke="#FFB547"
                fill="#FFB54720"
                strokeWidth={2.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
          <div>
            Cumulative Artemis Mission Limit: <strong className="text-white">250.0 mSv</strong> · Current Level: <strong className="text-[#FFB547]">78.4 mSv (31.4%)</strong>
          </div>
          <div className="sm:text-right">
            Career Permissible Exposure Limit (NASA PEL): <strong className="text-[#00E5FF]">600 mSv</strong>
          </div>
        </div>
      </div>

      {/* GCR VS SPE COMPARISON CARDS */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">
          Space Radiation Biophysical Sources & Health Impacts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#101B30]/75 border border-slate-800 space-y-3">
            <div className="text-xs font-mono text-[#00E5FF] font-bold">OMNIPRESENT BACKGROUND</div>
            <h4 className="text-base font-bold text-white">Galactic Cosmic Rays (GCR)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Originate outside our solar system from supernova remnants. Consist of 85% protons, 14% alpha particles, and 1% high-Z and high-energy (HZE) ions (e.g., Fe-56). Traversing spacecraft hulls, they induce cluster DNA double-strand breaks.
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              Mitigation: Polyethylene and water wall storm shelters.
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#101B30]/75 border border-slate-800 space-y-3">
            <div className="text-xs font-mono text-[#FFB547] font-bold">SPORADIC SOLAR FLUX</div>
            <h4 className="text-base font-bold text-white">Solar Particle Events (SPE)</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Intense proton eruptions emitted during coronal mass ejections. While lower energy than GCR, acute fluxes can deliver lethal doses within hours if astronauts are caught during extravehicular activity (EVA) outside shelter.
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              Mitigation: Automated solar satellite alerts & crew core retreat.
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#101B30]/75 border border-slate-800 space-y-3">
            <div className="text-xs font-mono text-[#8B5CF6] font-bold">HYDROSTATIC ADAPTATION</div>
            <h4 className="text-base font-bold text-white">Microgravity Fluid Redistribution</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Absence of gravity causes ~2 liters of venous and interstitial fluid to shift cephalad toward head and chest. Causes facial edema, nasal congestion, and chronic elevated optic sheath pressure (SANS syndrome).
            </p>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              Mitigation: Lower Body Negative Pressure (LBNP) chasm suits.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
