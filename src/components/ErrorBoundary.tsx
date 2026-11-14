import React from 'react';
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected telemetry rendering fault',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('[SPACE HEALTH MONITO] Subsystem render fault:', error, errorInfo);
  }

  handleRecover = () => {
    this.setState({ hasError: false, errorMessage: '' });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full max-w-2xl mx-auto my-8 p-6 rounded-2xl bg-[#0B1224] border border-rose-500/40 shadow-2xl text-slate-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-mono">
                {this.props.fallbackTitle || 'Subsystem Telemetry Recovery'}
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Automatic fault isolation prevented a full console outage.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#050816] border border-slate-800 text-xs font-mono text-rose-300 break-words">
            {this.state.errorMessage}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => this.setState({ hasError: false, errorMessage: '' })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry View</span>
            </button>

            {this.props.onReset && (
              <button
                onClick={this.handleRecover}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold transition-colors cursor-pointer"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
                <span>Return to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
