import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Logo } from '../components/Logo';
import {
  Lock,
  Mail,
  UserCheck,
  Shield,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  BadgeCheck,
  FileBadge,
} from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
  onNavigate: (tab: string) => void;
  currentUser?: User;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onNavigate, currentUser }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [badgeNumber, setBadgeNumber] = useState('');
  const [role, setRole] = useState<UserRole>('Astronaut');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Quick demonstration logins for the hackathon evaluator
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
    setSuccessMessage(`Authenticated as ${p.name} (${p.role}). Redirecting to Mission Control...`);
    setTimeout(() => {
      onNavigate('overview');
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Form validations
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid mission personnel email.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must contain at least 6 characters.');
      return;
    }

    if (!isLoginMode) {
      if (!fullName.trim()) {
        setErrorMessage('Full name and flight rank are required for registration.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }
    }

    const authorizedUser: User = {
      id: `usr-${Date.now()}`,
      email,
      fullName: fullName || (isLoginMode ? 'Mission Operator' : 'Astronaut'),
      role,
      badgeNumber: badgeNumber || `EXP-${Math.floor(Math.random() * 800 + 100)}`,
      assignedCrewId: role === 'Astronaut' ? 'astro-1' : undefined,
    };

    onLogin(authorizedUser);
    setSuccessMessage(`Authorization verified. Welcome to SPACE HEALTH MONITOR.`);
    setTimeout(() => {
      onNavigate('overview');
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#05070d] text-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center mb-6">
          <button onClick={() => onNavigate('landing')} className="cursor-pointer">
            <Logo size="lg" />
          </button>
        </div>

        <h2 className="text-center text-2xl font-extrabold text-white tracking-tight">
          {isLoginMode ? 'Mission Control Authorization' : 'Crew Personnel Registration'}
        </h2>
        <p className="mt-2 text-center text-xs font-mono text-slate-400">
          NASA Space Apps Challenge 2026 · Secure RBAC Gateway
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg relative z-10">
        <div className="bg-[#0b101f] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Instant Quick-Login Strip for Evaluators */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-slate-400 mb-2.5">
              <span>Fast Demonstration Sign-In</span>
              <span className="text-[10px] text-cyan-400 font-bold">1-Click Role Access</span>
            </div>
            
            <div className="space-y-2">
              {quickProfiles.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  onClick={() => handleQuickLogin(p)}
                  className="w-full text-left p-3 rounded-xl bg-slate-900/60 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-cyan-300">
                        {p.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                        {p.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{p.description}</div>
                  </div>
                  <UserCheck className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-4 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-[#0b101f] px-3 text-[11px] font-mono text-slate-500 uppercase tracking-wider">
              Or {isLoginMode ? 'Standard Credentials' : 'New Crew Signup'}
            </span>
          </div>

          {/* Form Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Custom Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginMode && (
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Full Name & Title
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., CDR Sarah Chen, Ph.D."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Official Mission Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="astronaut@spacehealth.nasa.gov"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLoginMode && (
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Personnel Mission Role (RBAC)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Astronaut', 'Mission Health Specialist', 'Administrator'] as UserRole[]).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`py-2 px-2 text-xs font-medium rounded-xl border transition-colors truncate cursor-pointer ${
                      role === r
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500 font-bold'
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
              className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-cyan-950 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>{isLoginMode ? 'Access Mission Console' : 'Register Crew Member'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Toggle between login and registration */}
          <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
            {isLoginMode ? (
              <span>
                New mission personnel?{' '}
                <button
                  type="button"
                  onClick={() => setIsLoginMode(false)}
                  className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have mission clearance?{' '}
                <button
                  type="button"
                  onClick={() => setIsLoginMode(true)}
                  className="text-cyan-400 hover:underline font-semibold cursor-pointer"
                >
                  Sign in
                </button>
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
