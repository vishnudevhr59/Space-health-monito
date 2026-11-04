import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [animationStage, setAnimationStage] = useState<'initial' | 'animate' | 'exit'>('initial');

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Shortened transition for accessibility
      const timer = setTimeout(() => {
        setAnimationStage('exit');
        setTimeout(onComplete, 400);
      }, 800);
      return () => clearTimeout(timer);
    }

    // STAGE 1 -> STAGE 2: Start scale and glow animation
    const animTimer = setTimeout(() => {
      setAnimationStage('animate');
    }, 150);

    // STAGE 2 -> STAGE 3: Begin smooth fade out
    const exitTimer = setTimeout(() => {
      setAnimationStage('exit');
    }, 2800);

    // Final removal after fade out finishes
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3400);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setAnimationStage('exit');
    setTimeout(onComplete, 300);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#020515] overflow-hidden select-none cursor-pointer transition-opacity duration-700 ease-in-out ${
        animationStage === 'exit' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-label="SPACE HEALTH MONITO Startup Intro"
      role="banner"
    >
      {/* BACKGROUND COSMIC DEEP SPACE RADIAL GLOW & NEBULA */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,180,255,0.12)_0%,rgba(5,13,38,0.7)_50%,#020515_100%)] pointer-events-none" />

      {/* SUBTLE CELESTIAL BACKGROUND STARS & CROSS-FLARES */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Flare 1 - Top Left */}
        <div className="absolute top-[22%] left-[18%] opacity-80 animate-pulse">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="#38bdf8" fillOpacity="0.8" />
          </svg>
        </div>

        {/* Flare 2 - Mid Left */}
        <div className="absolute top-[48%] left-[12%] opacity-60">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="#ffffff" fillOpacity="0.9" />
          </svg>
        </div>

        {/* Flare 3 - Bottom Left */}
        <div className="absolute top-[68%] left-[24%] opacity-70 animate-pulse" style={{ animationDelay: '1s' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="#00E5FF" fillOpacity="0.75" />
          </svg>
        </div>

        {/* Flare 4 - Top Right */}
        <div className="absolute top-[28%] right-[16%] opacity-75 animate-pulse" style={{ animationDelay: '0.5s' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="#38bdf8" fillOpacity="0.85" />
          </svg>
        </div>

        {/* Flare 5 - Mid Right */}
        <div className="absolute top-[52%] right-[10%] opacity-60">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="#ffffff" fillOpacity="0.9" />
          </svg>
        </div>

        {/* Flare 6 - Far Right */}
        <div className="absolute top-[38%] right-[22%] opacity-70 animate-pulse" style={{ animationDelay: '1.2s' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z" fill="#00E5FF" fillOpacity="0.7" />
          </svg>
        </div>

        {/* Tiny ambient background star dots */}
        <div className="absolute top-[15%] left-[32%] w-1.5 h-1.5 rounded-full bg-cyan-300/60" />
        <div className="absolute top-[35%] left-[28%] w-1 h-1 rounded-full bg-white/70" />
        <div className="absolute top-[75%] left-[38%] w-1 h-1 rounded-full bg-cyan-200/50" />
        <div className="absolute top-[18%] right-[30%] w-1.5 h-1.5 rounded-full bg-cyan-400/50" />
        <div className="absolute top-[65%] right-[25%] w-1 h-1 rounded-full bg-white/60" />
        <div className="absolute top-[82%] right-[35%] w-1.5 h-1.5 rounded-full bg-cyan-300/40" />
      </div>

      {/* CENTERPIECE: COSMIC ORBITAL EMBLEM & LOGO */}
      <div
        className={`relative z-10 flex flex-col items-center text-center transition-all duration-1000 ease-out transform ${
          animationStage === 'initial'
            ? 'scale-85 opacity-0'
            : 'scale-100 opacity-100'
        }`}
      >
        {/* GLOWING AMBIENT PULSE DISC */}
        <div className="absolute -inset-10 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

        {/* CELESTIAL VECTOR EMBLEM WITH ORBITS AND NODES */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center">
          <svg
            viewBox="0 0 260 260"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full drop-shadow-[0_0_25px_rgba(0,229,255,0.6)]"
          >
            {/* Outer Circular Dotted Orbital Constellation */}
            <circle
              cx="130"
              cy="130"
              r="104"
              stroke="#00E5FF"
              strokeWidth="2"
              strokeDasharray="4 10"
              strokeOpacity="0.5"
            />

            {/* Major Tilted Orbital Ring 1 */}
            <ellipse
              cx="130"
              cy="130"
              rx="118"
              ry="42"
              transform="rotate(-24 130 130)"
              stroke="#00E5FF"
              strokeWidth="3.2"
              strokeLinecap="round"
              className="opacity-95"
            />

            {/* Minor Tilted Orbital Ring 2 */}
            <ellipse
              cx="130"
              cy="130"
              rx="96"
              ry="32"
              transform="rotate(-24 130 130)"
              stroke="#38bdf8"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="opacity-80"
            />

            {/* Orbiting Satellite Node 1 (Top Right) */}
            <circle cx="218" cy="94" r="5" fill="#00E5FF" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="218" cy="94" r="4.5" fill="#00E5FF" stroke="#050d26" strokeWidth="1.5" />

            {/* Orbiting Satellite Node 2 (Left Lower) */}
            <circle cx="48" cy="158" r="4" fill="#38bdf8" stroke="#050d26" strokeWidth="1.5" />

            {/* Orbiting Satellite Node 3 (Bottom Right Track) */}
            <circle cx="166" cy="204" r="4.5" fill="#00E5FF" stroke="#050d26" strokeWidth="1.5" />

            {/* Central Celestial Body / Spacecraft Core Outer Shell */}
            <circle
              cx="130"
              cy="130"
              r="48"
              fill="url(#coreGradient)"
              stroke="#00E5FF"
              strokeWidth="3.5"
            />

            {/* Inner Concentric Glow Ring */}
            <circle
              cx="130"
              cy="130"
              r="38"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeOpacity="0.7"
            />

            {/* Latitude Horizon Arc Inside Planet */}
            <path
              d="M 86 126 C 100 142, 160 142, 174 126"
              stroke="#00E5FF"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeOpacity="0.85"
            />

            {/* Physiological ECG Heartbeat Pulse intersecting central core */}
            <path
              d="M 94 130 L 112 130 L 118 116 L 124 146 L 132 108 L 138 140 L 144 130 L 166 130"
              stroke="#ffffff"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            />

            {/* Radial Core Gradients */}
            <defs>
              <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0a3568" />
                <stop offset="65%" stopColor="#05193d" />
                <stop offset="100%" stopColor="#02091f" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* BRAND WORDMARK & TITLE */}
        <div
          className={`mt-6 sm:mt-8 space-y-2 transition-all duration-1000 delay-300 ${
            animationStage === 'initial'
              ? 'translate-y-4 opacity-0'
              : 'translate-y-0 opacity-100'
          }`}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wider">
            <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
              SPACE HEALTH
            </span>
            <span className="text-[#00E5FF] drop-shadow-[0_0_15px_rgba(0,229,255,0.6)]">
              MONITO
            </span>
          </div>

          {/* SUBTITLE */}
          <div className="text-[10px] sm:text-xs md:text-sm font-mono tracking-[0.25em] sm:tracking-[0.3em] uppercase text-slate-400">
            MONITORING HUMAN HEALTH BEYOND EARTH
          </div>
        </div>

        {/* SUBTLE STATUS INDICATOR PILL AT BOTTOM */}
        <div
          className={`mt-8 sm:mt-10 flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/40 text-[10px] sm:text-xs font-mono text-cyan-300 transition-opacity duration-1000 delay-700 ${
            animationStage === 'initial' ? 'opacity-0' : 'opacity-85'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
          <span>INITIALIZING MISSION DECISION SUPPORT</span>
        </div>
      </div>

      {/* QUICK SKIP HINT IN CORNER */}
      <div className="absolute bottom-6 right-6 text-[10px] font-mono text-slate-500 hover:text-slate-300 transition-colors hidden sm:block">
        Press anywhere to skip intro →
      </div>
    </div>
  );
};
