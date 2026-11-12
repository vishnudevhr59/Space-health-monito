import React from 'react';
import {
  LayoutDashboard,
  Activity,
  Cpu,
  Bell,
  Sliders,
} from 'lucide-react';

interface BottomNavBarProps {
  currentTab: string;
  onSelectTab: (tabId: string) => void;
  activeAlertCount?: number;
}

interface NavItemConfig {
  id: string;
  label: string;
  icon: React.ElementType;
  aliases?: string[];
  badgeCount?: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentTab,
  onSelectTab,
  activeAlertCount = 0,
}) => {
  // Exactly 5 core navigation items as specified
  const navItems: NavItemConfig[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      aliases: ['overview'],
    },
    {
      id: 'monitoring',
      label: 'Monitoring',
      icon: Activity,
    },
    {
      id: 'ai-analysis',
      label: 'AI Analysis',
      icon: Cpu,
      aliases: ['analytics'],
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: Bell,
      badgeCount: activeAlertCount,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Sliders,
    },
  ];

  const isActive = (item: NavItemConfig) => {
    if (currentTab === item.id) return true;
    if (item.aliases && item.aliases.includes(currentTab)) return true;
    return false;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 w-full bg-[#050816]/95 backdrop-blur-2xl border-t border-[#00E5FF]/25 shadow-[0_-8px_35px_rgba(0,0,0,0.8)] select-none safe-area-pb"
      aria-label="Primary App Bottom Navigation"
    >
      <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-6">
        <div className="grid grid-cols-5 h-16 items-center">
          {navItems.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative flex flex-col items-center justify-center h-full min-h-[56px] py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] ${
                  active
                    ? 'text-[#00E5FF] font-extrabold'
                    : 'text-slate-400 hover:text-slate-200 font-medium'
                }`}
                aria-current={active ? 'page' : undefined}
                aria-label={item.label}
              >
                {/* Top Active Glowing Accent Beam */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 sm:w-12 h-1 bg-gradient-to-r from-cyan-400 via-[#00E5FF] to-emerald-400 rounded-full shadow-[0_0_12px_#00E5FF]" />
                )}

                {/* Icon Container with active backplate & dynamic notification badge */}
                <div
                  className={`relative p-1.5 rounded-xl transition-all duration-200 ${
                    active
                      ? 'bg-[#00E5FF]/15 text-[#00E5FF] shadow-[0_0_16px_rgba(0,229,255,0.3)] scale-105'
                      : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5 sm:w-5 sm:h-5 transition-transform" />

                  {/* Active Notification Badge for Alerts */}
                  {item.badgeCount !== undefined && item.badgeCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white font-mono font-black text-[10px] flex items-center justify-center shadow-[0_0_10px_rgba(244,63,94,0.7)] animate-pulse">
                      {item.badgeCount}
                    </span>
                  )}
                </div>

                {/* Nav Label */}
                <span
                  className={`text-[10px] sm:text-[11px] font-mono tracking-tight mt-0.5 truncate transition-colors ${
                    active ? 'text-[#00E5FF] font-bold' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
