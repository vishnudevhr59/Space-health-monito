import React from 'react';
import { Logo } from './Logo';
import { User, UserRole } from '../types';
import { UserCheck, ShieldAlert, Bell, Wifi, Activity, ShieldCheck } from 'lucide-react';
import { NetworkStatusIndicator } from './NetworkStatusIndicator';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  onOpenAuthModal: () => void;
  onOpenProvenanceModal: () => void;
  activeAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenAuthModal,
  onOpenProvenanceModal,
  activeAlertCount,
}) => {
  const primaryNavItems = [
    { id: 'dashboard', label: 'Mission Dashboard' },
    { id: 'monitoring', label: 'Health Monitoring' },
    { id: 'analytics', label: 'AI Health Analysis' },
    { id: 'monito-ai', label: 'MONITO AI' },
    { id: 'reports', label: 'Reports' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#050816]/95 backdrop-blur-xl border-b border-[#00E5FF]/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      
      {/* Strict One-Row Three-Zone Top Bar Contract */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => onSelectTab('landing')}
          className="flex items-center text-left transition-opacity hover:opacity-90 shrink-0 cursor-pointer"
        >
          <Logo size="md" />
        </button>

        {/* Zone 2: Mission Telemetry Quick Telemetry Banner (Desktop) */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-mono">
          <button
            onClick={() => onSelectTab('landing')}
            className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
              currentTab === 'landing'
                ? 'text-[#00E5FF] border-b-2 border-[#00E5FF] font-bold'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Mission Brief
          </button>

          {primaryNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                currentTab === item.id
                  ? 'text-[#00E5FF] border-b-2 border-[#00E5FF] font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Connection Status + Provenance + Notification Center + User Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          
          {/* Real-time Dynamic Network / Offline Sync Status */}
          <NetworkStatusIndicator />

          {/* NASA Provenance Button */}
          <button
            onClick={onOpenProvenanceModal}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0B1224] hover:bg-[#101B30] border border-[#00E5FF]/30 text-[10px] font-mono text-[#00E5FF] transition-colors cursor-pointer"
            title="Inspect Official NASA Research Data Provenance"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#21D4A5]" />
            <span className="font-bold">PROVENANCE</span>
          </button>

          {/* Notification Center Icon */}
          <button
            onClick={() => onSelectTab('alerts')}
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

          {/* User Profile Pill */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#00E5FF]/30 bg-[#101B30] hover:bg-[#101B30]/80 text-xs font-medium text-slate-200 transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm hover:border-[#00E5FF]"
          >
            <UserCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="truncate max-w-[110px] font-mono">{currentUser.fullName.split(' ')[0]}</span>
            <span className="text-[10px] font-mono text-[#00E5FF] bg-[#050816] px-1.5 py-0.5 rounded border border-[#00E5FF]/40">
              {currentUser.role === 'Mission Health Specialist' ? 'Flight Surgeon' : currentUser.role}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Strip for Module Tabs */}
      <div className="bg-[#0B1224]/90 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-1 sm:gap-1.5">
            {[
              { id: 'dashboard', label: 'Overview' },
              { id: 'monitoring', label: 'Health Monitoring' },
              { id: 'analytics', label: 'AI Analysis' },
              { id: 'environment', label: 'Space Environment' },
              { id: 'bone-muscle', label: 'Bone & Muscle' },
              { id: 'sleep-wellness', label: 'Sleep & Mind' },
              { id: 'monito-ai', label: 'MONITO AI' },
              { id: 'reports', label: 'Reports' },
              { id: 'settings', label: 'Settings' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  currentTab === tab.id
                    ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/50 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4 text-[11px] text-slate-400 shrink-0">
            <span>HABITAT: LUNAR GATEWAY</span>
            <span className="text-slate-600">/</span>
            <span className="text-[#21D4A5]">SYS: 100% NOMINAL</span>
          </div>
        </div>
      </div>
    </header>
  );
};
