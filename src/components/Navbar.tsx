import React, { useState } from 'react';
import { Logo } from './Logo';
import { User } from '../types';
import {
  UserCheck,
  ShieldCheck,
  Zap,
  ChevronDown,
  Activity,
  AlertOctagon,
  RefreshCw,
  FileText,
  Volume2,
  VolumeX,
  Lock,
  Radio,
  ChevronUp,
  MapPin,
  Sparkles,
  LayoutDashboard,
  Dumbbell,
  ShieldAlert,
  Moon,
  Settings,
  Send,
  Eye,
  EyeOff,
} from 'lucide-react';
import { NetworkStatusIndicator } from './NetworkStatusIndicator';
import { voiceAlertService } from '../services/voiceAlertService';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  onOpenAuthModal: () => void;
  onOpenProvenanceModal: () => void;
  onOpenLogVitals: () => void;
  onOpenEmergencyBeacon: () => void;
  onOpenShiftHandover?: () => void;
  onOpenAuditModal?: () => void;
  onOpenVault?: () => void;
  onSyncOffline: () => void;
  activeAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAuthModal,
  onOpenProvenanceModal,
  onOpenLogVitals,
  onOpenEmergencyBeacon,
  onOpenShiftHandover,
  onOpenAuditModal,
  onOpenVault,
  onSyncOffline,
  activeAlertCount,
}) => {
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(voiceAlertService.isVoiceEnabled());
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [selectedStation, setSelectedStation] = useState('NASA Gateway (NRHO)');
  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);

  React.useEffect(() => {
    return voiceAlertService.subscribe((enabled) => setVoiceEnabled(enabled));
  }, []);

  const STATIONS = [
    { id: 'gateway', name: 'NASA Gateway (NRHO)', orbit: 'Near-Rectilinear Halo Orbit · 384,400 km', status: 'Optimal' },
    { id: 'artemis3', name: 'Artemis III Basecamp', orbit: 'Lunar South Pole · Shackleton Crater', status: 'Nominal' },
    { id: 'orion', name: 'Orion MPCV Capsule', orbit: 'Trans-Lunar Injection Trajectory', status: 'Nominal' },
    { id: 'mars-transit', name: 'Mars Deep Space Transport', orbit: 'Heliocentric Transfer Stage', status: 'Standby' },
  ];

  // Flipkart-style Category Quick Links
  const CATEGORIES = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-cyan-400' },
    { id: 'monitoring', label: 'Live Vitals', icon: Activity, color: 'text-emerald-400' },
    { id: 'monito-ai', label: 'MONITO AI', icon: Sparkles, color: 'text-purple-400', badge: 'Gemini' },
    { id: 'ground-uplink', label: 'NASA Uplink', icon: Send, color: 'text-teal-400', badge: 'Houston' },
    { id: 'ai-analysis', label: 'AI Analysis', icon: Activity, color: 'text-amber-400' },
    { id: 'bone-muscle', label: 'ARED Fitness', icon: Dumbbell, color: 'text-sky-400' },
    { id: 'environment', label: 'Radiation SPE', icon: ShieldAlert, color: 'text-rose-400' },
    { id: 'sleep-wellness', label: 'Sleep & Rhythm', icon: Moon, color: 'text-indigo-400' },
    { id: 'reports', label: 'Clinical Reports', icon: FileText, color: 'text-emerald-400' },
    { id: 'settings', label: 'Settings & FAQs', icon: Settings, color: 'text-slate-400' },
  ];

  // When collapsed, render ultra-sleek immersive micro-bar
  if (isHeaderCollapsed) {
    return (
      <header className="sticky top-0 z-40 w-full bg-[#050816]/95 backdrop-blur-xl border-b border-[#00E5FF]/20 shadow-[0_2px_15px_rgba(0,0,0,0.6)] select-none">
        <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-6 h-11 flex items-center justify-between gap-2 text-xs">
          {/* Left mini brand + tap to reveal */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setIsHeaderCollapsed(false)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-bold transition-all cursor-pointer shadow-sm active:scale-95"
              title="Tap to reveal full navigation header"
            >
              <ChevronDown className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
              <span className="hidden sm:inline">TAP TO REVEAL HEADER</span>
              <span className="sm:hidden">NAV</span>
            </button>
            <div className="flex items-center gap-1.5 text-slate-300 font-mono text-[11px] truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span className="text-white font-bold truncate">{selectedStation.split(' ')[0]}</span>
              <span className="text-slate-500 hidden sm:inline">· 1Hz DSN LOCK</span>
            </div>
          </div>

          {/* Right: Unclipped Astronaut Profile Badge + Expand Button */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[#00E5FF]/50 bg-[#0c182c] hover:bg-[#142646] text-xs font-mono text-cyan-200 shadow-sm transition-all cursor-pointer"
              title="Astronaut Profile & Role"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />
              <span className="font-bold text-white text-[11px]">CDR</span>
              <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-1 py-0.5 rounded border border-cyan-500/40">
                {currentUser.role === 'Mission Health Specialist' ? 'Surgeon' : currentUser.role.split(' ')[0]}
              </span>
            </button>

            <button
              onClick={() => setIsHeaderCollapsed(false)}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              title="Expand top portion"
              aria-label="Expand top portion"
            >
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050816]/98 backdrop-blur-2xl border-b border-[#00E5FF]/20 shadow-[0_4px_30px_rgba(0,0,0,0.7)] select-none transition-all duration-300">
      
      {/* 1. TOP FLIPKART-STYLE MISSION LOCATION & HABITAT SELECTOR BAR */}
      <div className="w-full bg-[#030612] border-b border-slate-800/80 px-3 sm:px-6 py-1 flex items-center justify-between text-[11px] font-mono">
        <div className="relative flex items-center gap-1.5 text-slate-300 min-w-0">
          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="text-slate-400 hidden sm:inline">Station:</span>
          <button
            onClick={() => setIsStationMenuOpen(!isStationMenuOpen)}
            className="flex items-center gap-1 text-cyan-300 hover:text-cyan-100 font-bold truncate max-w-[180px] sm:max-w-none cursor-pointer"
            title="Change active mission station"
          >
            <span className="truncate">{selectedStation}</span>
            <ChevronDown className="w-3 h-3 text-cyan-400 shrink-0" />
          </button>

          {/* Station dropdown */}
          {isStationMenuOpen && (
            <div className="absolute top-6 left-0 w-72 rounded-xl bg-[#091122] border border-cyan-500/40 shadow-2xl p-2 z-50 text-xs font-mono space-y-1">
              <div className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 border-b border-slate-800">
                Select Telemetry Station
              </div>
              {STATIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStation(s.name);
                    setIsStationMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                    selectedStation === s.name ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/40' : 'hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div>
                    <div className="font-bold">{s.name}</div>
                    <div className="text-[9px] text-slate-400 font-sans">{s.orbit}</div>
                  </div>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30">
                    {s.status}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right side: Hide top portion button (Flipkart tap-to-hide feature) */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-emerald-400 text-[10px] font-bold hidden sm:inline">DSN: 1Hz REAL-TIME</span>
          <button
            onClick={() => setIsHeaderCollapsed(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-[10px] font-mono border border-slate-700/60 transition-colors cursor-pointer"
            title="Tap to hide top portion for full-screen view"
          >
            <EyeOff className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Tap to Hide</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN HEADER BAR */}
      <div className="w-full max-w-screen-2xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Brand Wordmark (Single Line) */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center text-left transition-opacity hover:opacity-95 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] rounded-xl min-w-0"
          title="Return to Mission Dashboard"
        >
          <Logo size="sm" />
        </button>

        {/* Center: Mission Control Telemetry Lock Readout (Desktop & Large Tablet) */}
        <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-300 bg-[#0B1224]/80 px-4 py-1.5 rounded-full border border-slate-800 shrink-0">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
          <span className="text-[#00E5FF] font-bold">NASA MCC-H ACTIVE</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">EXP-72</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-bold">1Hz TELEMETRY LOCK</span>
        </div>

        {/* Right: Controls + NASA Uplink + Astronaut Profile (100% visible on all devices) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          
          {/* DSN Connection Status Badge */}
          <div className="hidden sm:block">
            <NetworkStatusIndicator onOpenVault={onOpenVault} />
          </div>

          {/* NASA Ground Uplink Button */}
          <button
            onClick={() => onSelectTab('ground-uplink')}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-950 to-teal-950 hover:bg-emerald-900 border border-emerald-500/50 text-[10px] sm:text-xs font-mono text-emerald-300 transition-all cursor-pointer shadow-sm hover:border-emerald-400 active:scale-95 min-h-[34px] sm:min-h-[38px] shrink-0"
            title="Send Real-Time Health Reports to NASA Flight Surgeon Team (Houston, USA)"
          >
            <Radio className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400 animate-pulse shrink-0" />
            <span className="font-bold whitespace-nowrap">UPLINK</span>
          </button>

          {/* NASA Provenance Button (Hidden on Mobile) */}
          <button
            onClick={onOpenProvenanceModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#051326] hover:bg-[#0c2242] border border-[#00E5FF]/40 text-[10px] font-mono text-[#00E5FF] transition-all cursor-pointer shadow-sm hover:border-[#00E5FF] active:scale-95 min-h-[38px] shrink-0"
            title="Inspect Official NASA Research Data Provenance"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#21D4A5]" />
            <span className="font-bold">PROVENANCE</span>
          </button>

          {/* User Profile and Astronaut Role Pill (Guaranteed 100% visible on all devices) */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-[#00E5FF]/40 bg-[#0F1B30] hover:bg-[#152542] text-xs font-medium text-slate-200 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm hover:border-[#00E5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] min-h-[34px] sm:min-h-[38px]"
            title="Inspect Astronaut Profile & Role-Based Access"
            aria-label="Astronaut Profile"
          >
            <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center shrink-0">
              <UserCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="font-bold font-mono text-[11px] sm:text-xs text-white">CDR</span>
              <span className="text-[9px] font-mono text-cyan-300">
                {currentUser.role === 'Mission Health Specialist' ? 'Surgeon' : currentUser.role.split(' ')[0]}
              </span>
            </div>
          </button>

          {/* QUICK ACTION DROPDOWN MENU */}
          <div className="relative">
            <button
              onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/30 text-xs font-medium text-amber-300 transition-all cursor-pointer shadow-sm hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 min-h-[34px] sm:min-h-[38px] active:scale-95 shrink-0"
              title="Quick Mission Actions"
              aria-label="Quick Mission Actions"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform ${isQuickActionOpen ? 'rotate-180' : ''}`} />
            </button>

            {isQuickActionOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0B1224] border border-amber-500/40 shadow-2xl p-2 z-50 text-xs font-mono space-y-1.5 animate-fadeIn">
                <button
                  onClick={() => {
                    onSelectTab('ground-uplink');
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-950/60 transition-colors text-left cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <div>
                    <div className="font-bold text-emerald-300">NASA Ground Uplink</div>
                    <div className="text-[10px] text-slate-400 font-sans">Send reports to Houston Flight Surgeons</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenLogVitals();
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                >
                  <Activity className="w-4 h-4 text-[#00E5FF]" />
                  <div>
                    <div className="font-bold text-white">Log Vitals</div>
                    <div className="text-[10px] text-slate-400 font-sans">Direct biometric manual entry</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onOpenEmergencyBeacon();
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-300 hover:text-white hover:bg-rose-950/60 transition-colors text-left cursor-pointer"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <div>
                    <div className="font-bold text-rose-300">Simulated Emergency Beacon</div>
                    <div className="text-[10px] text-rose-400/80 font-sans">Generate demo distress packet</div>
                  </div>
                </button>

                {onOpenShiftHandover && (
                  <button
                    onClick={() => {
                      onOpenShiftHandover();
                      setIsQuickActionOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-cyan-300 hover:text-white hover:bg-cyan-950/60 transition-colors text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-bold text-cyan-300">Shift Handover Briefing</div>
                      <div className="text-[10px] text-cyan-400/80 font-sans">Flight surgeon clinical sign-off</div>
                    </div>
                  </button>
                )}

                {onOpenAuditModal && (
                  <button
                    onClick={() => {
                      onOpenAuditModal();
                      setIsQuickActionOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-blue-300 hover:text-white hover:bg-blue-950/60 transition-colors text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-bold text-cyan-300">Mission Audit Ledger</div>
                      <div className="text-[10px] text-slate-400 font-sans">Full telemetry export (CSV/JSON)</div>
                    </div>
                  </button>
                )}

                {onOpenVault && (
                  <button
                    onClick={() => {
                      onOpenVault();
                      setIsQuickActionOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-950/60 transition-colors text-left cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-emerald-300">Disaster Recovery Vault</div>
                      <div className="text-[10px] text-slate-400 font-sans">SHA-256 cryptographic ledger & occultation</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    const next = voiceAlertService.toggleVoiceAlerts();
                    if (next) voiceAlertService.testVoiceAnnouncement();
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                >
                  {voiceEnabled ? (
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                  <div>
                    <div className="font-bold text-white">
                      Voice Callouts: {voiceEnabled ? 'ACTIVE' : 'MUTED'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">
                      SpeechSynthesis tactical announcements
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onSyncOffline();
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-emerald-300 hover:text-white hover:bg-emerald-950/50 transition-colors text-left cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="font-bold text-emerald-300">Sync Offline Data</div>
                    <div className="text-[10px] text-slate-400 font-sans">Flush local queue to DSN</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 3. FLIPKART-STYLE HORIZONTAL CATEGORY QUICK-SCROLL STRIP */}
      <div className="w-full border-t border-slate-800/80 bg-[#060b18]/90 overflow-x-auto no-scrollbar py-1.5 px-2.5 sm:px-6">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = currentTab === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectTab(cat.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono transition-all cursor-pointer whitespace-nowrap active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-400 shadow-[0_0_10px_rgba(0,229,255,0.2)] font-bold'
                    : 'bg-[#0B1426] text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                <span>{cat.label}</span>
                {cat.badge && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. TAP TO HIDE / REVEAL PULL BAR (FLIPKART FULL-SCREEN TOGGLE) */}
      <button
        onClick={() => setIsHeaderCollapsed(true)}
        className="w-full py-0.5 bg-gradient-to-r from-[#030712] via-[#0B1528] to-[#030712] hover:bg-[#101F3B] border-t border-slate-800/50 flex items-center justify-center gap-1.5 text-[9px] font-mono text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer group"
        title="Tap to hide top navigation bar for full-screen view"
      >
        <ChevronUp className="w-3 h-3 text-cyan-400 group-hover:-translate-y-0.5 transition-transform" />
        <span>TAP TO HIDE TOP NAVIGATION BAR (FULL SCREEN)</span>
      </button>

    </header>
  );
};
