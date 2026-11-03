import React, { useState, useEffect } from 'react';
import { offlineSyncService, SyncStatus } from '../services/offlineSyncService';
import { Wifi, WifiOff, RefreshCw, Database, CloudUpload, AlertCircle, CheckCircle2 } from 'lucide-react';

export const NetworkStatusIndicator: React.FC = () => {
  const [syncState, setSyncState] = useState(offlineSyncService.getState());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = offlineSyncService.subscribe((state) => {
      setSyncState(state);
    });
    return unsubscribe;
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await offlineSyncService.syncQueuedMeasurements();
    setIsSyncing(false);
  };

  const getBadgeConfig = () => {
    switch (syncState.status) {
      case 'LIVE':
        return {
          icon: <Wifi className="w-3.5 h-3.5 text-[#21D4A5]" />,
          dotColor: 'bg-[#21D4A5]',
          label: 'DSN LINK: LIVE',
          colorClass: 'text-[#21D4A5] bg-[#21D4A5]/10 border-[#21D4A5]/30',
          description: 'Telemetry synchronizing directly with Deep Space Network',
        };
      case 'CACHED':
        return {
          icon: <Database className="w-3.5 h-3.5 text-[#38bdf8]" />,
          dotColor: 'bg-[#38bdf8]',
          label: 'CACHED (OFFLINE)',
          colorClass: 'text-[#38bdf8] bg-[#38bdf8]/10 border-[#38bdf8]/30',
          description: 'No telemetry link. Displaying verified local cache.',
        };
      case 'PENDING_SYNC':
        return {
          icon: <CloudUpload className="w-3.5 h-3.5 text-[#FFB547]" />,
          dotColor: 'bg-[#FFB547] animate-pulse',
          label: `${syncState.pendingCount} QUEUED OFFLINE`,
          colorClass: 'text-[#FFB547] bg-[#FFB547]/10 border-[#FFB547]/30',
          description: `${syncState.pendingCount} local records queued to sync upon link recovery`,
        };
      case 'SYNCING':
        return {
          icon: <RefreshCw className="w-3.5 h-3.5 text-[#00E5FF] animate-spin" />,
          dotColor: 'bg-[#00E5FF]',
          label: 'SYNCHRONIZING...',
          colorClass: 'text-[#00E5FF] bg-[#00E5FF]/10 border-[#00E5FF]/30',
          description: 'Flushing local measurements to station telemetry store',
        };
      case 'SYNC_FAILED':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-[#FF5368]" />,
          dotColor: 'bg-[#FF5368]',
          label: 'SYNC INTERRUPTED',
          colorClass: 'text-[#FF5368] bg-[#FF5368]/10 border-[#FF5368]/30',
          description: 'Telemetry upload failed. Retrying automatically.',
        };
      default:
        return {
          icon: <WifiOff className="w-3.5 h-3.5 text-slate-400" />,
          dotColor: 'bg-slate-400',
          label: 'OFFLINE',
          colorClass: 'text-slate-400 bg-slate-800 border-slate-700',
          description: 'Network link down',
        };
    }
  };

  const badge = getBadgeConfig();

  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <div
        className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${badge.colorClass} shadow-sm transition-all`}
        title={badge.description}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${badge.dotColor}`} />
        {badge.icon}
        <span className="font-bold text-[10px] tracking-wider uppercase">{badge.label}</span>
      </div>

      {syncState.pendingCount > 0 && (
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="p-1 rounded bg-[#101B30] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-[#00E5FF] transition-colors cursor-pointer"
          title="Force Sync Offline Queue"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#00E5FF]' : ''}`} />
        </button>
      )}

      {syncState.lastSync && (
        <span className="text-[10px] text-slate-500 hidden xl:inline">
          Sync: {new Date(syncState.lastSync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} UTC
        </span>
      )}
    </div>
  );
};
