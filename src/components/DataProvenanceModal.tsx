import React, { useState, useEffect } from 'react';
import { Database, BookOpen, ExternalLink, ShieldCheck, X, Search, Info } from 'lucide-react';

interface DataProvenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataProvenanceModal: React.FC<DataProvenanceModalProps> = ({ isOpen, onClose }) => {
  const [provenanceData, setProvenanceData] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetch('/api/provenance')
        .then((res) => res.json())
        .then((data) => setProvenanceData(data))
        .catch((err) => console.error('Provenance load error:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const provenanceBadges: Record<string, { label: string; color: string; desc: string }> = {
    REAL_RESEARCH_DATA: {
      label: 'REAL RESEARCH DATA',
      color: 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60',
      desc: 'Peer-reviewed NASA OSDR / GeneLab / Twins Study published empirical dataset.',
    },
    SIMULATED_TELEMETRY: {
      label: 'SIMULATED TELEMETRY',
      color: 'bg-cyan-950/80 text-cyan-400 border-cyan-700/60',
      desc: 'Synthetic continuous biotelemetry stream calibrated with NASA Human Research Program population norms.',
    },
    ILLUSTRATIVE_REFERENCE: {
      label: 'ILLUSTRATIVE REFERENCE VALUES',
      color: 'bg-sky-950/80 text-sky-400 border-sky-700/60',
      desc: 'Standard mission rehabilitation benchmarks and normative spaceflight envelopes.',
    },
    USER_ENTERED: {
      label: 'USER-ENTERED MEASUREMENTS',
      color: 'bg-purple-950/80 text-purple-400 border-purple-700/60',
      desc: 'Manual telemetry logged on-console by astronaut or flight medical team.',
    },
    AI_GENERATED: {
      label: 'AI-GENERATED INTERPRETATIONS',
      color: 'bg-amber-950/80 text-amber-400 border-amber-700/60',
      desc: 'Algorithmic inference outputs from Isolation Forest and Google Gemini decision-support models.',
    },
  };

  const datasets = provenanceData?.verifiedDatasets || [];
  const references = provenanceData?.researchKnowledgeBase || [];

  const filteredReferences = references.filter((r: any) => {
    const matchCategory = activeCategory === 'ALL' || r.category === activeCategory;
    const matchSearch =
      !searchQuery ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.datasetId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.authors.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#0B1224] border border-[#00E5FF]/40 rounded-3xl shadow-[0_0_50px_rgba(0,229,255,0.2)] overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#101B30]/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#00E5FF] font-bold">
                Scientific Traceability & Provenance Registry
              </div>
              <h2 className="text-xl font-extrabold text-white">
                NASA Research Data Provenance
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] focus-visible:outline-none"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROVENANCE DEFINITION CARDS */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 font-semibold">
              Data Category Classifications (Explicit Mandatory Labelling)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(provenanceBadges).map(([key, info]) => (
                <div key={key} className={`p-3.5 rounded-xl border ${info.color} flex flex-col justify-between`}>
                  <span className="font-mono font-bold text-[11px] block">{info.label}</span>
                  <p className="text-[11px] opacity-80 mt-1 leading-snug">{info.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* VERIFIED NASA RESEARCH DATASETS */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-white font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#21D4A5]" />
                <span>Verified Official NASA Research Citations & Baseline Datasets</span>
              </h3>
              
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Filter by dataset or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-[#050816] border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>

            <div className="space-y-4">
              {filteredReferences.map((ref: any) => (
                <div
                  key={ref.id}
                  className="p-5 rounded-2xl bg-[#101B30]/70 border border-slate-800 hover:border-[#00E5FF]/40 transition-colors space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold mr-2">
                        {ref.datasetId || 'NASA OSDR'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        Category: <strong className="text-white">{ref.category}</strong>
                      </span>
                    </div>
                    {ref.url && (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-[#00E5FF] hover:underline flex items-center gap-1 self-start sm:self-auto"
                      >
                        <span>Official Source Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white leading-snug">{ref.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{ref.authors} ({ref.source}, {ref.year})</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono bg-[#050816]/60 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Study Cohort & Sample Size:</span>
                      <span className="text-slate-200">{ref.studyPopulation} (N={ref.sampleSize})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Variables Tracked:</span>
                      <span className="text-[#00E5FF]">{ref.variablesUsed?.join(', ')}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-500 block text-[10px] uppercase">Methodology:</span>
                      <span className="text-slate-300">{ref.methodology}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-slate-500 block text-[10px] uppercase">Known Scientific Limitations:</span>
                      <span className="text-amber-300/80">{ref.knownLimitations}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block mb-1">
                      Key Empirical Findings Grounded in Application:
                    </span>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {ref.keyFindings?.map((finding: string, idx: number) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-800 bg-[#101B30]/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>Non-diagnostic advisory system · Calibrated to NASA standards</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors cursor-pointer"
          >
            Close Provenance Viewer
          </button>
        </div>

      </div>
    </div>
  );
};
