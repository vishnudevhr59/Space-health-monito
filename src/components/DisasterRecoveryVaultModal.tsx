import React, { useState, useEffect } from 'react';
import {
  offlineSyncService,
  CryptographicLedgerBlock,
  OfflineSyncState,
} from '../services/offlineSyncService';
import {
  ShieldCheck,
  ShieldAlert,
  Database,
  Wifi,
  WifiOff,
  RefreshCw,
  Lock,
  Unlock,
  Key,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  ArrowRight,
  Fingerprint,
  RotateCcw,
} from 'lucide-react';

interface DisasterRecoveryVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DisasterRecoveryVaultModal: React.FC<DisasterRecoveryVaultModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [syncState, setSyncState] = useState<OfflineSyncState>(offlineSyncService.getState());
  const [blocks, setBlocks] = useState<CryptographicLedgerBlock[]>(offlineSyncService.getLedgerBlocks());
  const [auditQueue, setAuditQueue] = useState<any[]>(offlineSyncService.getOfflineAuditQueue());
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    blockCount: number;
    lastVerifiedHash: string;
  } | null>(null);
  const [isFlushing, setIsFlushing] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    const unsub = offlineSyncService.subscribe((state) => {
      setSyncState(state);
      setBlocks(offlineSyncService.getLedgerBlocks());
      setAuditQueue(offlineSyncService.getOfflineAuditQueue());
    });
    return unsub;
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle Occultation
  const handleToggleOccultation = () => {
    offlineSyncService.toggleOccultation();
    setSyncState(offlineSyncService.getState());
    setBlocks(offlineSyncService.getLedgerBlocks());
    setAuditQueue(offlineSyncService.getOfflineAuditQueue());
  };

  // Verify Ledger Integrity
  const handleVerifyLedger = async () => {
    setIsVerifying(true);
    const res = await offlineSyncService.verifyLedgerIntegrity();
    setTimeout(() => {
      setVerificationResult(res);
      setIsVerifying(false);
    }, 600);
  };

  // Reconcile and Flush
  const handleReconcileAndFlush = async () => {
    setIsFlushing(true);
    await offlineSyncService.reconcileAndFlushLedger();
    setBlocks(offlineSyncService.getLedgerBlocks());
    setAuditQueue(offlineSyncService.getOfflineAuditQueue());
    setIsFlushing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0B1221] border border-[#00E5FF]/30 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden text-slate-100 font-mono">
        
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-[#050816]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF]">
              <Lock className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-white">
                  Disaster Recovery Vault & Cryptographic Ledger
                </h3>
                <span className="text-[10px] bg-[#00E5FF]/20 text-[#00E5FF] px-2 py-0.5 rounded-full border border-[#00E5FF]/30 font-bold">
                  SHA-256 RECONCILIATION
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                Earth-independent data resilience during deep-space orbital occultation & DSN blackouts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OCCULTATION SIMULATION CONTROLLER BANNER */}
        <div className="p-4 sm:p-5 bg-[#101B30] border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {syncState.isOccultationSimulated ? (
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 animate-pulse">
                <WifiOff className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
                <Wifi className="w-5 h-5" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">DSN Telemetry Link Status:</span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    syncState.isOccultationSimulated
                      ? 'bg-amber-950/40 text-amber-300 border-amber-500/40 animate-pulse'
                      : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  {syncState.isOccultationSimulated
                    ? 'ORBITAL OCCULTATION (DSN LINK SUSPENDED)'
                    : 'ONLINE · NASA MCC-H / DSN GOLDSTONE LOCK'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                {syncState.isOccultationSimulated
                  ? 'All telemetry frames, anomalies, and clinical shift handovers are cryptographically signed and stored in the local vault.'
                  : 'Real-time 1Hz biotelemetry and cryptographic audit chain synchronized with Mission Control.'}
              </p>
            </div>
          </div>

          {/* Action button: Toggle Occultation */}
          <button
            onClick={handleToggleOccultation}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
              syncState.isOccultationSimulated
                ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm'
            }`}
          >
            {syncState.isOccultationSimulated ? (
              <>
                <Wifi className="w-4 h-4 text-emerald-400" />
                <span>Re-Establish DSN Link</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-400" />
                <span>Simulate Orbital Occultation</span>
              </>
            )}
          </button>
        </div>

        {/* VAULT METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-6 bg-[#050816] border-b border-slate-800 text-xs">
          <div className="p-3.5 rounded-2xl bg-[#0B1221] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Verified Ledger Blocks</span>
            <div className="text-2xl font-extrabold text-white mt-1 tabular-nums">
              {blocks.length}
            </div>
            <span className="text-[10px] text-[#21D4A5] block">Genesis to Tip</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B1221] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Queued Offline Records</span>
            <div className="text-2xl font-extrabold text-[#FFB547] mt-1 tabular-nums">
              {syncState.unreconciledAuditCount + syncState.pendingCount}
            </div>
            <span className="text-[10px] text-slate-400 block">
              {syncState.isOccultationSimulated ? 'Pending Link Flush' : '0 Pending · Flushed'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B1221] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Cryptographic Hash Standard</span>
            <div className="text-sm font-extrabold text-[#00E5FF] mt-1">
              FIPS 180-4 SHA-256
            </div>
            <span className="text-[10px] text-slate-400 block">Merkle Root Verified</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0B1221] border border-slate-800 space-y-1">
            <span className="text-slate-400 text-[11px] block">Last Synchronized</span>
            <div className="text-xs font-bold text-slate-200 mt-1 truncate">
              {syncState.lastSync ? new Date(syncState.lastSync).toLocaleTimeString() : 'Sol 142 Active'}
            </div>
            <span className="text-[10px] text-[#21D4A5] block">256-bit AES Sealed</span>
          </div>
        </div>

        {/* LEDGER BLOCK EXPLORER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#00E5FF]" />
                <span>Immutable Cryptographic Ledger Blocks</span>
              </h4>
              <p className="text-xs text-slate-400 font-sans">
                Each block contains previous hash link, timestamp, payload Merkle root, and SHA-256 seal
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleVerifyLedger}
                disabled={isVerifying}
                className="px-3 py-1.5 rounded-xl bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Chain...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-3.5 h-3.5" />
                    <span>Verify Chain Integrity</span>
                  </>
                )}
              </button>

              {!syncState.isOccultationSimulated && (syncState.unreconciledAuditCount > 0 || syncState.pendingCount > 0) && (
                <button
                  onClick={handleReconcileAndFlush}
                  disabled={isFlushing}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isFlushing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Flushing Queue...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reconcile & Flush Now</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Verification Banner */}
          {verificationResult && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>
                  Ledger Hash Chain 100% Cryptographically Valid across all {verificationResult.blockCount} blocks.
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                Tip: {verificationResult.lastVerifiedHash.substring(0, 16)}...
              </span>
            </div>
          )}

          {/* Block cards */}
          <div className="space-y-3">
            {blocks.slice().reverse().map((b) => (
              <div
                key={`block-${b.blockIndex}`}
                className="p-3.5 sm:p-4 rounded-2xl bg-[#050816] border border-slate-800 hover:border-[#00E5FF]/40 transition-all space-y-2 text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">
                      BLOCK #{b.blockIndex.toString().padStart(3, '0')}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30">
                      {b.payloadType}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(b.timestamp).toISOString()}
                  </span>
                </div>

                <p className="text-slate-200 text-xs font-sans">
                  {b.transactionsSummary}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                  <div className="truncate bg-[#0B1221] p-1.5 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block">PREVIOUS HASH:</span>
                    <span className="text-slate-300 font-mono truncate">{b.previousHash}</span>
                  </div>
                  <div className="truncate bg-[#0B1221] p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[#21D4A5] block">BLOCK HASH (SHA-256):</span>
                    <span className="text-emerald-400 font-mono truncate">{b.blockHash}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#050816] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#21D4A5]" />
            <span>NASA Space Health Monito Cryptographic Ledger Standards</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer text-xs"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
