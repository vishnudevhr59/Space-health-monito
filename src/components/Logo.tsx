import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 'md', showText = true }) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`relative flex items-center justify-center ${iconDimensions} shrink-0`}>
        {/* Background glow & subtle disc */}
        <div className="absolute inset-0 rounded-full bg-cyan-500/10 border border-cyan-500/30" />
        
        {/* Vector SVG Emblem: Space Helmet + ECG Heartbeat + Orbital Ring */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Orbital Ring tilted 25 degrees */}
          <ellipse
            cx="32"
            cy="32"
            rx="28"
            ry="11"
            transform="rotate(-28 32 32)"
            stroke="url(#orbitGradient)"
            strokeWidth="1.8"
            strokeDasharray="3 2"
            opacity="0.85"
          />

          {/* Small orbital satellite node */}
          <circle cx="53" cy="20" r="2.2" fill="#38bdf8" />

          {/* Astronaut Helmet Outer Shell */}
          <path
            d="M 20 34 C 18 24, 24 16, 32 16 C 40 16, 46 24, 44 34 C 44 41, 39 45, 32 45 C 25 45, 20 41, 20 34 Z"
            stroke="#94a3b8"
            strokeWidth="2"
            strokeLinecap="round"
            fill="#090d1a"
          />

          {/* Helmet Visor */}
          <path
            d="M 23 31 C 23 25, 27 21, 32 21 C 37 21, 41 25, 41 31 C 41 36, 37 39, 32 39 C 27 39, 23 36, 23 31 Z"
            fill="url(#visorGradient)"
            stroke="#0ea5e9"
            strokeWidth="1.2"
          />

          {/* Visor Glare Accent */}
          <path
            d="M 26 25 C 28 23, 31 22, 34 23"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.2"
            strokeLinecap="round"
          />

          {/* Medical Heartbeat ECG Pulse Wave intersecting horizontally */}
          <path
            d="M 8 32 L 20 32 L 24 32 L 27 25 L 30 38 L 34 21 L 37 36 L 40 32 L 44 32 L 56 32"
            stroke="#22d3ee"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="orbitGradient" x1="4" y1="32" x2="60" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" />
              <stop offset="0.5" stopColor="#818cf8" />
              <stop offset="1" stopColor="#0ea5e9" />
            </linearGradient>
            <linearGradient id="visorGradient" x1="23" y1="21" x2="41" y2="39" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0c4a6e" />
              <stop offset="1" stopColor="#031b2e" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col select-none min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
            <span className="font-extrabold tracking-wider text-white text-xs sm:text-base md:text-lg whitespace-nowrap">
              SPACE HEALTH
            </span>
            <span className="font-bold tracking-wider text-cyan-400 text-xs sm:text-base md:text-lg">
              MONITOR
            </span>
          </div>
          <span className="text-[8px] sm:text-[10px] tracking-widest uppercase text-slate-400 font-mono mt-0.5 hidden sm:block whitespace-nowrap">
            Mission Decision Support · 2026
          </span>
        </div>
      )}
    </div>
  );
};
