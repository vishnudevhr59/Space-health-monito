import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ChevronRight,
  Shield,
  Activity,
  Heart,
  Radio,
  Zap,
} from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [animationStage, setAnimationStage] = useState<'initial' | 'burst' | 'settle' | 'exit'>('initial');
  const [interactivePings, setInteractivePings] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [activeMode, setActiveMode] = useState<'nominal' | 'aurora' | 'deepSpace'>('nominal');

  useEffect(() => {
    // 3-second JioHotstar-inspired cinematic curve:
    // 0ms: Initial glow expansion
    // 600ms: Dynamic energetic crest / burst
    // 2200ms: Settle into crisp brand resolution
    // 3000ms: Smooth seamless reveal of front page
    const t1 = setTimeout(() => setAnimationStage('burst'), 450);
    const t2 = setTimeout(() => setAnimationStage('settle'), 1800);
    const t3 = setTimeout(() => setAnimationStage('exit'), 2850);
    const t4 = setTimeout(() => onComplete(), 3200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  // Interactive user touch/click wave generation
  const handleInteractiveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setInteractivePings((prev) => [...prev.slice(-4), { id, x, y }]);
    // Cycle aesthetic theme on tap
    setActiveMode((m) => (m === 'nominal' ? 'aurora' : m === 'aurora' ? 'deepSpace' : 'nominal'));
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimationStage('exit');
    setTimeout(onComplete, 180);
  };

  return (
    <div
      onClick={handleInteractiveClick}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between p-4 sm:p-8 bg-[#020617] overflow-hidden select-none transition-all duration-500 ease-out h-[100dvh] w-full cursor-pointer ${
        animationStage === 'exit' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="Space Health Monito Launch Screen"
      role="banner"
    >
      {/* CINEMATIC HOTSTAR-STYLE AURORA STREAMS & ASTRONAUT MOONWALK BACKDROP */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* ASTRONAUT WALKING ON PLANETARY/LUNAR SURFACE HOISTING USA FLAG */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Desktop / Tablet Widescreen (16:9) */}
          <img
            src="/assets/images/astronaut_planet_flag_wide.jpg"
            alt="Astronaut walking on lunar surface hoisting American flag with Earth rising"
            className="hidden md:block w-full h-full object-cover object-center opacity-70 scale-105 filter brightness-105 contrast-110 transition-transform duration-1000"
          />
          {/* Mobile Portrait (9:16) */}
          <img
            src="/assets/images/astronaut_moon_flag.jpg"
            alt="Astronaut walking on moon surface with American flag"
            className="md:hidden w-full h-full object-cover object-center opacity-70 scale-105 filter brightness-105 contrast-110 transition-transform duration-1000"
          />
          {/* Balanced contrast scrim preserving astronaut & flag visibility while keeping central UI legible */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/85 via-[#020617]/30 to-[#020617]/75" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(2,6,23,0.45)_0%,rgba(2,6,23,0.18)_55%,rgba(2,6,23,0.72)_100%)]" />
        </div>

        {/* Animated Radial Energy Cones */}
        <div
          className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[110px] transition-all duration-1000 ${
            activeMode === 'aurora'
              ? 'bg-emerald-500/25'
              : activeMode === 'deepSpace'
              ? 'bg-purple-600/25'
              : 'bg-blue-600/25'
          }`}
        />
        <div
          className={`absolute -bottom-32 -right-32 w-[30rem] h-[30rem] rounded-full blur-[130px] transition-all duration-1000 ${
            activeMode === 'aurora'
              ? 'bg-teal-400/20'
              : activeMode === 'deepSpace'
              ? 'bg-rose-500/20'
              : 'bg-cyan-400/25'
          }`}
        />

        {/* Subtle Light Rays like JioHotstar Intro */}
        <div
          className={`absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.16)_0%,transparent_55%)] transition-opacity duration-700 ${
            animationStage === 'burst' ? 'opacity-100 scale-110' : 'opacity-60 scale-100'
          }`}
        />

        {/* Ambient Orbit Tracks */}
        <div className="absolute inset-0 flex items-center justify-center opacity-25">
          <div className="w-[340px] h-[340px] sm:w-[500px] sm:h-[500px] rounded-full border border-cyan-400/35 animate-[spin_24s_linear_infinite]" />
          <div className="absolute w-[240px] h-[240px] sm:w-[350px] sm:h-[350px] rounded-full border border-dashed border-blue-400/40 animate-[spin_16s_linear_infinite_reverse]" />
          <div className="absolute w-[150px] h-[150px] sm:w-[210px] sm:h-[210px] rounded-full border border-teal-300/35 animate-pulse" />
        </div>

        {/* Interactive Click Ripples */}
        {interactivePings.map((ping) => (
          <span
            key={ping.id}
            className="absolute rounded-full border-2 border-cyan-300 animate-ping pointer-events-none"
            style={{
              left: ping.x - 30,
              top: ping.y - 30,
              width: 60,
              height: 60,
            }}
          />
        ))}
      </div>

      {/* TOP TACTICAL FLIGHT STATUS (CLEAN, NO SECOND NUMBERS) */}
      <div className="w-full max-w-5xl flex items-center justify-between text-xs font-mono relative z-10 px-2 shrink-0">
        <div className="flex items-center gap-2 text-cyan-300">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-bold tracking-widest text-[11px] sm:text-xs">
            NASA ORBITAL GATEWAY FLIGHT TELEMETRY
          </span>
        </div>

        {/* 3-Second Fluid Progress Bar (Visual time representation, strictly zero numerical second text) */}
        <div className="flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] text-slate-300 font-semibold tracking-wider">SYSTEM SYNCHRONIZING</span>
          <div className="w-16 sm:w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 rounded-full animate-[progress_3s_ease-out_forwards]" />
          </div>
        </div>
      </div>

      {/* CENTERPIECE: HOTSTAR-INSPIRED LUMINESCENT ICON & WORDMARK */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-xl w-full px-4">
        {/* Hotstar-Style Fluid Luminescent Emblem */}
        <div
          className={`relative transition-all duration-700 ease-out transform ${
            animationStage === 'initial'
              ? 'scale-50 opacity-0'
              : animationStage === 'burst'
              ? 'scale-110 opacity-100 rotate-1'
              : 'scale-100 opacity-100'
          }`}
        >
          {/* Multi-layered Backing Flares */}
          <div className="absolute -inset-6 bg-gradient-to-tr from-cyan-500 via-blue-600 to-emerald-400 rounded-3xl blur-2xl opacity-60 animate-pulse" />
          <div className="absolute -inset-10 bg-blue-500/20 rounded-full blur-3xl animate-[spin_8s_linear_infinite]" />

          {/* Core Interactive Emblem Container */}
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-gradient-to-b from-slate-900/90 via-[#03091e] to-slate-950 p-1 border-2 border-cyan-400/70 shadow-[0_0_40px_rgba(0,229,255,0.45)] flex items-center justify-center group overflow-hidden">
            {/* Shimmer sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

            {/* Futuristic Vector Space Caduceus & Pulse Emblem */}
            <svg
              viewBox="0 0 100 100"
              className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-[0_0_15px_rgba(0,229,255,0.8)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer Energy Orbit */}
              <circle cx="50" cy="50" r="42" stroke="#00E5FF" strokeWidth="2.5" strokeDasharray="6 6" strokeOpacity="0.7" />
              {/* Elliptical Gateway Ribbon */}
              <ellipse cx="50" cy="50" rx="46" ry="18" transform="rotate(-28 50 50)" stroke="url(#hotstarGrad)" strokeWidth="3.5" strokeLinecap="round" />
              {/* Satellite Beacons */}
              <circle cx="86" cy="34" r="3" fill="#22D3EE" className="animate-ping" />
              <circle cx="86" cy="34" r="2.5" fill="#FFFFFF" />
              {/* Central Life Support Core */}
              <circle cx="50" cy="50" r="21" fill="#0A2540" stroke="#00E5FF" strokeWidth="2.5" />
              {/* High-Contrast Vital ECG Track */}
              <path
                d="M 33 50 L 41 50 L 45 42 L 49 59 L 53 38 L 57 56 L 61 50 L 67 50"
                stroke="#FFFFFF"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="hotstarGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#22D3EE" />
                  <stop offset="0.5" stopColor="#3B82F6" />
                  <stop offset="1" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Energetic Typography Wordmark - Guaranteed Single Line */}
        <div className="mt-6 space-y-2 w-full max-w-3xl px-2 text-center">
          <h1 className="inline-flex items-center justify-center whitespace-nowrap flex-nowrap text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-none select-none mx-auto">
            <span className="text-white drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)] whitespace-nowrap">
              SPACE HEALTH
            </span>
            <span className="ml-2 sm:ml-3 bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] whitespace-nowrap">
              MONITO
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-cyan-200/90 font-medium tracking-wide max-w-lg mx-auto">
            Deep-Space Medical Telemetry & Autonomous Clinical Intelligence
          </p>
        </div>

        {/* Interactive Feature Hints (Tap to interact) */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-[11px] font-mono text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/30 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-blue-400" />
            <span>Biosensor Mesh</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 shadow-sm">
            <Heart className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-Time Vitals</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Flight Surgeon</span>
          </span>
        </div>

        <div className="mt-4 text-[10px] text-cyan-400/80 font-mono animate-pulse">
          ⚡ Tap anywhere to cycle ambient aurora stream
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between text-xs font-mono px-2 shrink-0 pt-2 pb-1">
        <div className="text-[11px] text-slate-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400" />
          <span>Operational Ready · NASA Space Apps 2026</span>
        </div>

        <button
          onClick={handleSkip}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 hover:brightness-110 text-white font-extrabold transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] cursor-pointer text-xs active:scale-95 min-h-[44px]"
        >
          <span>Enter Mission Control</span>
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
};
