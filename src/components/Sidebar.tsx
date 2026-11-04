import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Brain,
  Radio,
  Dna,
  Moon,
  Bot,
  FileText,
  Sliders,
  ShieldAlert,
  ShieldCheck,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeAlertCount: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: User;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeAlertCount,
  isCollapsed,
  onToggleCollapse,
  currentUser,
}) => {
  // 9 Required Sidebar Navigation Items
  const navItems = [
    { id: 'overview', label: '1. Overview', icon: LayoutDashboard },
    { id: 'monitoring', label: '2. Health Monitoring', icon: Activity },
    { id: 'ai-analysis', label: '3. AI Health Analysis', icon: Brain },
    { id: 'environment', label: '4. Space Environment', icon: Radio },
    { id: 'bone-muscle', label: '5. Bone & Muscle Health', icon: Dna },
    { id: 'sleep-wellness', label: '6. Sleep & Wellness', icon: Moon },
    { id: 'monito-ai', label: '7. MONITO AI Assistant', icon: Bot },
    { id: 'reports', label: '8. Health Reports', icon: FileText },
    { id: 'settings', label: '9. Settings', icon: Sliders },
  ];

  return (
    <aside
      className={`fixed top-16 bottom-0 left-0 z-30 bg-[#0B1224] border-r border-[#00E5FF]/20 transition-all duration-300 flex flex-col justify-between shadow-[4px_0_24px_rgba(0,0,0,0.4)] ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="py-4 px-2 space-y-1 overflow-y-auto scrollbar-none flex-1">
        
        {/* Active mission badge */}
        {!isCollapsed && (
          <div className="px-3 py-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
              Mission Control Console
            </span>
            <span className="text-xs font-mono font-bold text-[#00E5FF] truncate block">
              ARTEMIS EXPEDITION 04
            </span>
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id || (item.id === 'overview' && currentTab === 'dashboard');

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id === 'overview' ? 'dashboard' : item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-bold shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#00E5FF]' : 'text-slate-400'}`} />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </button>
          );
        })}

        {/* Secondary items: Alerts & NASA Research */}
        <div className="pt-3 mt-3 border-t border-slate-800/80 space-y-1">
          <button
            onClick={() => onSelectTab('alerts')}
            title={isCollapsed ? `Alerts (${activeAlertCount})` : undefined}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentTab === 'alerts'
                ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-bold shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-4 h-4 text-[#FFB547] shrink-0" />
              {!isCollapsed && <span>Alert System</span>}
            </div>
            {!isCollapsed && activeAlertCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FFB547]/20 text-[#FFB547] border border-[#FFB547]/40">
                {activeAlertCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('research')}
            title={isCollapsed ? 'NASA Research' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentTab === 'research'
                ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-bold shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#00E5FF] shrink-0" />
            {!isCollapsed && <span>NASA Research</span>}
          </button>

          <button
            onClick={() => onSelectTab('system-health')}
            title={isCollapsed ? 'System Health & Tests' : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              currentTab === 'system-health'
                ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/40 font-bold shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            {!isCollapsed && <span>System Health & Tests</span>}
          </button>
        </div>
      </div>

      {/* Footer Strip with Collapse Toggle */}
      <div className="p-3 border-t border-slate-800/80 bg-[#050816] flex items-center justify-between">
        {!isCollapsed && (
          <div className="text-[11px] font-mono text-slate-400 truncate">
            <span>{currentUser.role === 'Mission Health Specialist' ? 'Flight Surgeon' : currentUser.role}</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-auto"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

    </aside>
  );
};
