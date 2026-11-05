import React, { useState } from 'react';
import { Logo } from './Logo';
import { User } from '../types';
import {
  UserCheck,
  Bell,
  ShieldCheck,
  Menu,
  X,
  Zap,
  ChevronDown,
  Activity,
  AlertOctagon,
  RefreshCw,
  FileText,
  Volume2,
  VolumeX,
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
  onSyncOffline,
  activeAlertCount,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(voiceAlertService.isVoiceEnabled());

  React.useEffect(() => {
    return voiceAlertService.subscribe((enabled) => setVoiceEnabled(enabled));
  }, []);

  const primaryNavItems = [
    { id: 'landing', label: 'Mission Brief' },
    { id: 'dashboard', label: 'Mission Dashboard', aliases: ['overview'] },
    { id: 'monitoring', label: 'Health Monitoring' },
    { id: 'ai-analysis', label: 'AI Health Analysis', aliases: ['analytics'] },
    { id: 'monito-ai', label: 'MONITO AI' },
    { id: 'reports', label: 'Reports' },
  ];

  const secondaryNavItems = [
    { id: 'dashboard', label: 'Overview', aliases: ['overview'] },
    { id: 'monitoring', label: 'Health Monitoring' },
    { id: 'ai-analysis', label: 'AI Analysis', aliases: ['analytics'] },
    { id: 'environment', label: 'Space Environment' },
    { id: 'bone-muscle', label: 'Bone & Muscle' },
    { id: 'sleep-wellness', label: 'Sleep & Mind' },
    { id: 'monito-ai', label: 'MONITO AI' },
    { id: 'reports', label: 'Reports' },
    { id: 'settings', label: 'Settings' },
    { id: 'system-health', label: 'System Health' },
  ];

  const isPrimaryActive = (item: { id: string; aliases?: string[] }) => {
    if (currentTab === item.id) return true;
    if (item.aliases && item.aliases.includes(currentTab)) return true;
    return false;
  };

  const isSecondaryActive = (item: { id: string; aliases?: string[] }) => {
    if (currentTab === item.id) return true;
    if (item.aliases && item.aliases.includes(currentTab)) return true;
    return false;
  };

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050816]/98 backdrop-blur-xl border-b border-[#00E5FF]/20 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
      {/* ROW 1: MAIN BRAND HEADER & PRIMARY NAVIGATION */}
      <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Circular Emblem + Wordmark + Subtitle */}
        <button
          onClick={() => handleNavClick('landing')}
          className="flex items-center text-left transition-opacity hover:opacity-95 shrink-0 cursor-pointer"
        >
          <Logo size="md" />
        </button>

        {/* Center: Primary Navigation (Always Visible on Desktop / Tablet >= 768px) */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-4 xl:gap-6 text-xs lg:text-sm font-sans tracking-wide shrink-0">
          {primaryNavItems.map((item) => {
            const active = isPrimaryActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`whitespace-nowrap transition-all cursor-pointer px-1 py-1 ${
                  active
                    ? 'text-[#00E5FF] border-b-2 border-[#00E5FF] font-semibold pb-1 shadow-[0_4px_12px_rgba(0,229,255,0.25)]'
                    : 'text-slate-300 hover:text-white font-medium'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right: DSN status + Provenance + Notification Bell + User Profile + Quick Action */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* DSN Connection Status Badge */}
          <NetworkStatusIndicator />

          {/* NASA Provenance Button */}
          <button
            onClick={onOpenProvenanceModal}
            className="hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full bg-[#051326] hover:bg-[#0c2242] border border-[#00E5FF]/40 text-[10px] font-mono text-[#00E5FF] transition-colors cursor-pointer shadow-sm hover:border-[#00E5FF]"
            title="Inspect Official NASA Research Data Provenance"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#21D4A5]" />
            <span className="font-bold">PROVENANCE</span>
          </button>

          {/* Notification Center Icon */}
          <button
            onClick={() => handleNavClick('alerts')}
            className="relative p-2 rounded-xl bg-[#101B30] border border-slate-700 hover:border-[#00E5FF]/40 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Active Health Threshold Alerts"
          >
            <Bell className="w-4 h-4 text-[#00E5FF]" />
            {activeAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF5368] text-white font-mono font-extrabold text-[9px] flex items-center justify-center animate-bounce">
                {activeAlertCount}
              </span>
            )}
          </button>

          {/* User Profile and Role Pill */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-xl border border-[#00E5FF]/30 bg-[#101B30] hover:bg-[#101B30]/80 text-xs font-medium text-slate-200 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm hover:border-[#00E5FF]"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="font-mono text-xs hidden sm:inline">CDR</span>
            <span className="text-[10px] font-mono text-[#00E5FF] bg-[#050816] px-1.5 py-0.5 rounded border border-[#00E5FF]/40">
              {currentUser.role === 'Mission Health Specialist' ? 'Flight Surgeon' : currentUser.role}
            </span>
          </button>

          {/* QUICK ACTION DROPDOWN MENU (NEXT TO USER PROFILE) */}
          <div className="relative">
            <button
              onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/30 text-xs font-medium text-amber-300 transition-all cursor-pointer shadow-sm hover:border-amber-400"
              title="Quick Mission Actions"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-xs hidden lg:inline font-bold">Quick Action</span>
              <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform ${isQuickActionOpen ? 'rotate-180' : ''}`} />
            </button>

            {isQuickActionOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0B1224] border border-amber-500/40 shadow-2xl p-1.5 z-50 text-xs font-mono space-y-1 animate-fadeIn">
                <button
                  onClick={() => {
                    onOpenLogVitals();
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
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
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-300 hover:text-white hover:bg-rose-950/60 transition-colors text-left cursor-pointer"
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
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-cyan-300 hover:text-white hover:bg-cyan-950/60 transition-colors text-left cursor-pointer"
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
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-blue-300 hover:text-white hover:bg-blue-950/60 transition-colors text-left cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-bold text-cyan-300">Mission Audit Ledger</div>
                      <div className="text-[10px] text-slate-400 font-sans">Full telemetry export (CSV/JSON)</div>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    const next = voiceAlertService.toggleVoiceAlerts();
                    if (next) voiceAlertService.testVoiceAnnouncement();
                    setIsQuickActionOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
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
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-950/50 transition-colors text-left cursor-pointer"
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

          {/* Mobile Menu Hamburger Toggle (Visible only on < md screens) */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-[#101B30] border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle mobile navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4 text-[#00E5FF]" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MOBILE COLLAPSIBLE DRAWER (Visible when hamburger is opened on mobile) */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#070D1F] border-t border-slate-800 px-4 py-3 space-y-2 shadow-2xl animate-fadeIn">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
            Primary Mission Navigation
          </div>
          <div className="grid grid-cols-2 gap-2">
            {primaryNavItems.map((item) => {
              const active = isPrimaryActive(item);
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/50 font-bold'
                      : 'bg-[#101B30] text-slate-300 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenProvenanceModal();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-1.5 text-xs font-mono text-[#00E5FF] py-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#21D4A5]" />
              <span>NASA Provenance</span>
            </button>
            <span className="text-[10px] font-mono text-emerald-400">SYS: NOMINAL</span>
          </div>
        </div>
      )}

      {/* ROW 2: SECONDARY NAVIGATION STRIP & HABITAT STATUS */}
      <div className="bg-[#0B1224]/95 border-t border-slate-800/80 w-full px-3 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="w-full flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {secondaryNavItems.map((tab) => {
              const active = isSecondaryActive(tab);
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    active
                      ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/50 font-bold shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400 shrink-0 font-mono tracking-wider">
            <span>HABITAT: LUNAR GATEWAY</span>
            <span className="text-slate-600">/</span>
            <span className="text-[#21D4A5] font-semibold">SYSTEM STATUS: NOMINAL</span>
          </div>
        </div>
      </div>
    </header>
  );
};
