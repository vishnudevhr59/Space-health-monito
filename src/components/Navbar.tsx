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

  React.useEffect(() => {
    return voiceAlertService.subscribe((enabled) => setVoiceEnabled(enabled));
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050816]/98 backdrop-blur-2xl border-b border-[#00E5FF]/20 shadow-[0_4px_30px_rgba(0,0,0,0.7)] select-none">
      <div className="w-full max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left: Brand Wordmark (Single Line) */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className="flex items-center text-left transition-opacity hover:opacity-95 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] rounded-xl"
          title="Return to Mission Dashboard"
        >
          <Logo size="md" />
        </button>

        {/* Center: Mission Control Telemetry Lock Readout (Desktop & Tablet) */}
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-300 bg-[#0B1224]/80 px-4 py-1.5 rounded-full border border-slate-800">
          <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse shrink-0" />
          <span className="text-[#00E5FF] font-bold">NASA MCC-H / DSN GOLDSTONE ACTIVE</span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">EXP-04</span>
          <span className="text-slate-600">·</span>
          <span className="text-emerald-400 font-bold">1Hz TELEMETRY LOCK</span>
        </div>

        {/* Right: Controls + DSN Link Status + Provenance + Profile + Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* DSN Connection Status Badge (Clickable to open Disaster Recovery Vault) */}
          <NetworkStatusIndicator onOpenVault={onOpenVault} />

          {/* NASA Ground Uplink Button */}
          <button
            onClick={() => onSelectTab('ground-uplink')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-emerald-950 to-teal-950 hover:bg-emerald-900 border border-emerald-500/50 text-[10px] font-mono text-emerald-300 transition-all cursor-pointer shadow-sm hover:border-emerald-400 active:scale-95 min-h-[36px]"
            title="Send Real-Time Health Reports to NASA Flight Surgeon Team (Houston, USA)"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="font-bold hidden sm:inline">NASA UPLINK</span>
            <span className="font-bold sm:hidden">UPLINK</span>
          </button>

          {/* NASA Provenance Button */}
          <button
            onClick={onOpenProvenanceModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#051326] hover:bg-[#0c2242] border border-[#00E5FF]/40 text-[10px] font-mono text-[#00E5FF] transition-all cursor-pointer shadow-sm hover:border-[#00E5FF] active:scale-95 min-h-[36px]"
            title="Inspect Official NASA Research Data Provenance"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#21D4A5]" />
            <span className="font-bold">PROVENANCE</span>
          </button>

          {/* User Profile and Role Pill */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-xl border border-[#00E5FF]/30 bg-[#101B30] hover:bg-[#101B30]/80 text-xs font-medium text-slate-200 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm hover:border-[#00E5FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] min-h-[40px]"
            title="Inspect Session & Role-Based Access"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="font-mono text-xs hidden sm:inline">CDR</span>
            <span className="text-[10px] font-mono text-[#00E5FF] bg-[#050816] px-1.5 py-0.5 rounded border border-[#00E5FF]/40">
              {currentUser.role === 'Mission Health Specialist' ? 'Flight Surgeon' : currentUser.role}
            </span>
          </button>

          {/* QUICK ACTION DROPDOWN MENU */}
          <div className="relative">
            <button
              onClick={() => setIsQuickActionOpen(!isQuickActionOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/30 text-xs font-medium text-amber-300 transition-all cursor-pointer shadow-sm hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 min-h-[40px] active:scale-95"
              title="Quick Mission Actions"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-xs hidden xl:inline font-bold">Quick Actions</span>
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
    </header>
  );
};
