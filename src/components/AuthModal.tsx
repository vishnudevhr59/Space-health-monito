import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { X, Lock, Mail, UserCheck, Shield, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('Astronaut');

  if (!isOpen) return null;

  const quickProfiles: Array<{
    name: string;
    role: UserRole;
    email: string;
    badge: string;
    description: string;
  }> = [
    {
      name: 'CDR Sarah Chen, Ph.D.',
      role: 'Astronaut',
      email: 'sarah.chen@spacehealth.nasa.gov',
      badge: 'EXP-72-CDR',
      description: 'Lunar Gateway Commander · Artemis Expedition 04',
    },
    {
      name: 'Dr. Evelyn Reed, M.D.',
      role: 'Mission Health Specialist',
      email: 'flight.surgeon@spacehealth.nasa.gov',
      badge: 'JSC-FLTSURG-09',
      description: 'Lead Flight Surgeon · NASA Johnson Space Center',
    },
    {
      name: 'Marcus Vance',
      role: 'Administrator',
      email: 'flight.director@spacehealth.nasa.gov',
      badge: 'NASA-ADMIN-01',
      description: 'Flight Operations Director · Telemetry Systems',
    },
  ];

  const handleQuickLogin = (p: typeof quickProfiles[0]) => {
    const user: User = {
      id: `usr-${p.badge}`,
      email: p.email,
      fullName: p.name,
      role: p.role,
      badgeNumber: p.badge,
      assignedCrewId: p.role === 'Astronaut' ? 'astro-1' : undefined,
    };
    onLogin(user);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: `usr-${Date.now()}`,
      email: email || 'crew@spacehealth.nasa.gov',
      fullName: fullName || 'Mission Specialist',
      role: selectedRole,
      badgeNumber: `EXP-${Math.floor(Math.random() * 800 + 100)}`,
      assignedCrewId: selectedRole === 'Astronaut' ? 'astro-1' : undefined,
    };
    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0b101f] border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:outline-none"
          title="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Mission Authentication System</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Role-Based Access Control (RBAC)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Current session: <span className="text-cyan-300 font-medium">{currentUser.fullName}</span> ({currentUser.role})
          </p>
        </div>

        {/* Quick Demo Switcher (Crucial for presentation) */}
        <div className="mb-6">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
            <span>Instant Role Demonstration</span>
            <span className="text-[10px] text-cyan-400">Select to test perspective</span>
          </div>

          <div className="space-y-2">
            {quickProfiles.map((p) => {
              const isCurrent = currentUser.role === p.role && currentUser.email === p.email;
              return (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleQuickLogin(p)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isCurrent
                      ? 'bg-cyan-950/40 border-cyan-500/60 shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {p.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.description}</div>
                  </div>
                  <UserCheck className={`w-4 h-4 shrink-0 ${isCurrent ? 'text-cyan-400' : 'text-slate-600'}`} />
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative my-4 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-[#0b101f] px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
            Or Custom Mission Credentials
          </span>
        </div>

        {/* Custom Auth Form */}
        <form onSubmit={handleCustomSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Mission Personnel Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Dr. Alex Mercer"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Official Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="operator@spacehealth.nasa.gov"
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Select Mission Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Astronaut', 'Mission Health Specialist', 'Administrator'] as UserRole[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`py-1.5 px-2 text-xs font-medium rounded-lg border transition-colors truncate ${
                    selectedRole === r
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {r === 'Mission Health Specialist' ? 'Flight Surgeon' : r}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-2.5 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-cyan-950 cursor-pointer"
          >
            Authorize Mission Session
          </button>
        </form>

      </div>
    </div>
  );
};
