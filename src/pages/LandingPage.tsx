import React from 'react';
import { Logo } from '../components/Logo';
import {
  Activity,
  Shield,
  Brain,
  Zap,
  Radio,
  Dna,
  Heart,
  Moon,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  BookOpen,
  Sparkles,
  Globe,
  Gauge,
  Compass,
} from 'lucide-react';

interface LandingPageProps {
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate, onOpenAuth }) => {
  const healthChallenges = [
    {
      title: 'Deep Space Radiation Hazards',
      description: 'Galactic Cosmic Rays (GCR) and Solar Particle Events (SPE) penetrate spacecraft hulls, demanding continuous active dosimeter monitoring.',
      icon: Radio,
      citation: 'NASA Space Radiation Laboratory (NSRL)',
      tag: 'Ionizing Biophysics',
    },
    {
      title: 'Microgravity Bone Demineralization',
      description: 'Loss of mechanical axial loading causes osteoclast up-regulation, leading to 1.0% to 1.5% bone mineral density reduction per month.',
      icon: Dna,
      citation: 'NASA Human Research Roadmap (Bone Discipline)',
      tag: 'Mechanotransduction',
    },
    {
      title: 'Muscular Sarcopenia & Atrophy',
      description: 'Antigravity postural muscles rapidly lose cross-sectional volume without daily high-load ARED resistive countermeasure regimes.',
      icon: Zap,
      citation: 'ISS ARED Countermeasure Verification',
      tag: 'Countermeasures',
    },
    {
      title: 'Cephalad Fluid Redistribution',
      description: 'Over 2 liters of fluid shifts toward head and thorax, triggering central baroreceptor resets and ocular hypertension (SANS risk).',
      icon: Heart,
      citation: 'NASA Twins Study (Cardiovascular Biology)',
      tag: 'Fluid Dynamics',
    },
    {
      title: 'Circadian Desynchronization',
      description: '16 orbital sunrises every 24 hours disrupt suprachiasmatic biological pacemakers, requiring 460nm dynamic solid-state lighting protocols.',
      icon: Moon,
      citation: 'NASA Behavioral Health & Performance',
      tag: 'Chronobiology',
    },
    {
      title: 'Autonomous Psychological Resilience',
      description: 'Months of extreme confinement and communication latency necessitate objective daily self-assessment and AI-guided mental wellness.',
      icon: Brain,
      citation: 'NASA Confinement Analogs (HERA/NEK)',
      tag: 'Behavioral Health',
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-x-hidden text-slate-100 space-stars-bg">
      
      {/* FULL-SCREEN CINEMATIC HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-36 border-b border-[#00E5FF]/20 bg-gradient-to-b from-[#050816] via-[#0B1224] to-[#050816]">
        
        {/* Atmospheric Blue & Cyan Lighting Glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00E5FF]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-[#438BFF]/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#8B5CF6]/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column (7 cols): Hero Title, Description, CTAs */}
            <div className="lg:col-span-7 text-left space-y-6">
              
              {/* Mission Status Badge */}
              <div className="inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-full bg-[#101B30]/90 border border-[#00E5FF]/40 text-[#00E5FF] text-[10px] sm:text-xs font-mono shadow-[0_0_15px_-3px_rgba(0,229,255,0.3)] max-w-full">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse shrink-0" />
                <span className="tracking-wider uppercase font-semibold">MISSION STATUS: ORBITAL LINK SYNCHRONIZED</span>
                <span className="text-slate-500 hidden xs:inline">|</span>
                <span className="text-slate-300 hidden xs:inline">NASA Space Apps 2026</span>
              </div>

              {/* Exact Requested Hero Heading */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] break-words">
                THE FUTURE OF <br />
                <span className="bg-gradient-to-r from-[#00E5FF] via-[#438BFF] to-[#8B5CF6] bg-clip-text text-transparent">
                  HUMAN HEALTH
                </span> <br />
                IS BEYOND EARTH.
              </h1>

              {/* Exact Requested Supporting Text */}
              <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
                Intelligent health monitoring, scientific insights, and AI-powered decision support for the next generation of human space exploration.
              </p>

              {/* Exact Requested CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('overview')}
                  className="px-7 py-4 bg-gradient-to-r from-[#00E5FF] to-[#438BFF] hover:from-[#00E5FF] hover:to-[#3b82f6] text-[#050816] font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 shadow-[0_0_30px_-5px_rgba(0,229,255,0.5)] hover:shadow-[0_0_40px_-3px_rgba(0,229,255,0.7)] flex items-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5"
                >
                  <span>Explore Mission Control</span>
                  <ArrowRight className="w-4 h-4 text-[#050816]" />
                </button>

                <button
                  onClick={() => onNavigate('research')}
                  className="px-6 py-4 bg-[#101B30]/90 hover:bg-[#101B30] border border-[#00E5FF]/30 hover:border-[#00E5FF]/60 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <BookOpen className="w-4 h-4 text-[#00E5FF]" />
                  <span>Discover Technology</span>
                </button>
              </div>

              {/* Quick Telemetry Footprint */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg font-mono text-xs">
                <div>
                  <div className="text-2xl font-bold text-white tabular-nums">12+</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Biosensors Tracked</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#00E5FF] tabular-nums">98.4%</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">Normoxic SpO2 Target</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-[#21D4A5] tabular-nums">100%</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">NASA HRP Sourced</div>
                </div>
              </div>

            </div>

            {/* Right Column (5 cols): Futuristic Astronaut Hologram & Floating Health Telemetry Preview */}
            <div className="lg:col-span-5 relative">
              
              {/* Outer Glowing Orbital Rings */}
              <div className="relative rounded-3xl bg-[#101B30]/75 backdrop-blur-xl border border-[#00E5FF]/30 p-6 shadow-[0_0_50px_-10px_rgba(0,229,255,0.2)] overflow-hidden">
                
                {/* Tech HUD Corner Brackets */}
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#00E5FF]" />
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#00E5FF]" />
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#00E5FF]" />
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#00E5FF]" />

                {/* Astronaut Vector Silhouette with Holographic Scanner Effect */}
                <div className="relative h-60 w-full rounded-2xl bg-gradient-to-b from-[#0B1224] to-[#050816] border border-slate-800 flex items-center justify-center overflow-hidden mb-6">
                  
                  {/* Subtle Earth/Lunar Horizon Glow */}
                  <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-48 rounded-t-full bg-gradient-to-t from-[#00E5FF]/30 to-transparent blur-md pointer-events-none" />
                  
                  {/* Radar sweep layer */}
                  <div className="absolute inset-0 radar-sweep opacity-30 animate-[spin_8s_linear_infinite]" />

                  {/* SVG Astronaut Silhouette with Telemetry Nodes */}
                  <svg viewBox="0 0 160 160" fill="none" className="w-44 h-44 z-10 opacity-90 drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                    {/* Helmet outline */}
                    <circle cx="80" cy="55" r="28" stroke="#00E5FF" strokeWidth="2" strokeDasharray="3 1.5" />
                    <ellipse cx="80" cy="56" rx="20" ry="14" fill="#00E5FF" fillOpacity="0.15" stroke="#00E5FF" strokeWidth="1.5" />
                    
                    {/* Visor Glare */}
                    <path d="M 68 50 C 72 47, 86 47, 92 50" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />

                    {/* Torso & Suit */}
                    <path d="M 50 95 C 50 80, 60 76, 80 76 C 100 76, 110 80, 110 95 L 115 145 L 45 145 Z" stroke="#438BFF" strokeWidth="1.8" />
                    <rect x="66" y="88" width="28" height="22" rx="4" stroke="#00E5FF" strokeWidth="1.2" fill="#050816" />
                    
                    {/* Heartbeat Waveform inside Chest Unit */}
                    <path d="M 70 99 L 75 99 L 77 94 L 80 104 L 83 92 L 86 102 L 88 99 L 91 99" stroke="#00E5FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Sensor Nodes Pulsing */}
                    <circle cx="70" cy="52" r="3" fill="#00E5FF" className="animate-ping" opacity="0.8" />
                    <circle cx="90" cy="98" r="2.5" fill="#21D4A5" />
                    <circle cx="58" cy="120" r="2" fill="#8B5CF6" />
                  </svg>

                  {/* HUD Overlay Labels */}
                  <div className="absolute top-3 left-3 text-[10px] font-mono text-[#00E5FF]">
                    HUD: BIOMEDICAL SCANNER ACTIVE
                  </div>
                  <div className="absolute bottom-3 right-3 text-[10px] font-mono text-emerald-400">
                    VITALS: NOMINAL
                  </div>
                </div>

                {/* FLOATING HEALTH TELEMETRY PREVIEW (4 REQUIRED READOUTS) */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  
                  {/* 1. Heart Rate */}
                  <div className="p-3 rounded-xl bg-[#0B1224] border border-[#00E5FF]/20 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block">HEART RATE</span>
                      <span className="text-lg font-bold text-white tabular-nums">64 <span className="text-[10px] text-slate-400 font-normal">BPM</span></span>
                    </div>
                    <Heart className="w-4 h-4 text-[#00E5FF]" />
                  </div>

                  {/* 2. Oxygen Saturation */}
                  <div className="p-3 rounded-xl bg-[#0B1224] border border-[#00E5FF]/20 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block">O2 SATURATION</span>
                      <span className="text-lg font-bold text-[#00E5FF] tabular-nums">98.4 <span className="text-[10px] text-slate-400 font-normal">%</span></span>
                    </div>
                    <Activity className="w-4 h-4 text-[#00E5FF]" />
                  </div>

                  {/* 3. Sleep */}
                  <div className="p-3 rounded-xl bg-[#0B1224] border border-[#00E5FF]/20 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block">SLEEP EFFICIENCY</span>
                      <span className="text-lg font-bold text-[#8B5CF6] tabular-nums">7.4 <span className="text-[10px] text-slate-400 font-normal">HRS</span></span>
                    </div>
                    <Moon className="w-4 h-4 text-[#8B5CF6]" />
                  </div>

                  {/* 4. Mission Duration */}
                  <div className="p-3 rounded-xl bg-[#0B1224] border border-[#00E5FF]/20 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 text-[10px] block">MISSION DURATION</span>
                      <span className="text-lg font-bold text-[#21D4A5] tabular-nums">DAY 142</span>
                    </div>
                    <Compass className="w-4 h-4 text-[#21D4A5]" />
                  </div>

                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>SUBJECT: CDR SARAH CHEN</span>
                  <span className="text-[#00E5FF]">SIMULATED NASA DEMO</span>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SPACE HEALTH CHALLENGES SECTION */}
      <section className="py-20 w-full max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="text-xs uppercase font-mono tracking-widest text-[#00E5FF] mb-2 font-semibold">
            Operational Aerospace Physiology
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Hostile Biophysical Hazards of Long-Duration Spaceflight
          </h2>
          <p className="text-slate-400 text-sm sm:text-base mt-4 leading-relaxed">
            Beyond Earth&apos;s protective magnetosphere and atmosphere, human physiology undergoes rapid, compounding recalibrations that require real-time algorithmic decision support.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {healthChallenges.map((challenge, idx) => {
            const Icon = challenge.icon;
            return (
              <div
                key={idx}
                className="group p-6 rounded-2xl bg-[#101B30]/70 backdrop-blur-md border border-[#00E5FF]/15 hover:border-[#00E5FF]/50 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_-5px_rgba(0,229,255,0.15)] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#0B1224] border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {challenge.tag}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-[#00E5FF] transition-colors">
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] font-mono text-cyan-400/80 truncate">
                  Source: {challenge.citation}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* NASA OPEN SCIENCE DATA & RESEARCH INTEGRATION */}
      <section className="py-20 border-t border-slate-800/80 bg-[#070B16]">
        <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-[#101B30]/80 border border-[#00E5FF]/25 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest text-[#00E5FF] mb-2 font-bold">
                  NASA Space Apps Challenge 2026 Submission
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                  Grounded in Verified NASA Human Research Program Data
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  SPACE HEALTH MONITO does not invent findings. Every threshold, risk assessment, and decision-support recommendation is anchored in peer-reviewed aerospace evidence from NASA HRP, OSDR, and the NASA Twins Study.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#00E5FF] shrink-0" />
                    <span>NASA OSDR Studies (OSD-137)</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#00E5FF] shrink-0" />
                    <span>HRP Human Research Roadmap</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#00E5FF] shrink-0" />
                    <span>GeneLab Multi-Omics Engine</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-[#00E5FF] shrink-0" />
                    <span>Gemini 3.8 Flash AI RAG</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-4">
                  <button
                    onClick={() => onNavigate('overview')}
                    className="px-5 py-3 bg-[#00E5FF] hover:bg-cyan-400 text-[#050816] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-950 cursor-pointer"
                  >
                    Open Astronaut Dashboard
                  </button>
                  <button
                    onClick={() => onNavigate('research')}
                    className="px-5 py-3 bg-[#0B1224] hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Explore Research Library
                  </button>
                </div>
              </div>

              {/* Research Matrix Card */}
              <div className="p-6 rounded-2xl bg-[#050816] border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-slate-400">
                  <span>SCIENTIFIC EVIDENCE ENGINE</span>
                  <span className="text-[#00E5FF]">HRP-V2026</span>
                </div>
                <div className="space-y-2 text-slate-300">
                  <div className="p-2.5 rounded-lg bg-[#101B30]/50 border border-slate-800 flex justify-between items-center">
                    <span>Bone Density Target:</span>
                    <span className="text-[#21D4A5]">&lt; 1.0% loss/mo with ARED</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#101B30]/50 border border-slate-800 flex justify-between items-center">
                    <span>Artemis Permissible Radiation:</span>
                    <span className="text-[#FFB547]">250 mSv Mission Limit</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#101B30]/50 border border-slate-800 flex justify-between items-center">
                    <span>Circadian Lighting Protocol:</span>
                    <span className="text-[#00E5FF]">460nm Blue Enriched Light</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#101B30]/50 border border-slate-800 flex justify-between items-center">
                    <span>Sleep Quality Target (PSQI):</span>
                    <span className="text-white">&ge; 85% Efficiency</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
