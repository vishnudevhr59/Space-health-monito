import React, { useState } from 'react';
import { ResearchReference } from '../types';
import {
  BookOpen,
  Search,
  ExternalLink,
  Shield,
  Layers,
  Filter,
  CheckCircle2,
  Atom,
} from 'lucide-react';

interface ResearchPageProps {
  researchList: ResearchReference[];
}

export const ResearchPage: React.FC<ResearchPageProps> = ({ researchList }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Space Radiation',
    'Microgravity & Bone/Muscle',
    'Cardiovascular',
    'Sleep & Behavioral',
    'Immune System',
  ];

  const filteredResearch = researchList.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.source.toLowerCase().includes(q) ||
        item.keyFindings.some((f) => f.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Peer-Reviewed Spaceflight Medicine Repository</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            NASA Space Health Research Integration
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Authoritative scientific literature grounding SPACE HEALTH MONITO algorithms, anomaly detection thresholds, and MONITO AI assistant queries.
          </p>
        </div>

        {/* Official Sources Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-cyan-400">
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">NASA HRP</span>
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">NASA OSDR</span>
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">GENELAB</span>
          <span className="px-2 py-1 rounded bg-slate-900 border border-slate-800">NTRS</span>
        </div>
      </div>

      {/* SEARCH AND CATEGORY FILTER */}
      <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_4px_24px_rgba(0,229,255,0.03)]">
        
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by topic, biomarker, or study title..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0B1224] border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] font-sans transition-colors"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/50 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

      </div>

      {/* RESEARCH CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResearch.map((item) => (
          <div
            key={item.id}
            className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 hover:border-[#00E5FF]/50 transition-all flex flex-col justify-between shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-4"
          >
            <div>
              {/* Category & Source Strip */}
              <div className="flex items-center justify-between text-xs font-mono text-[#00E5FF] mb-2 font-semibold">
                <span className="uppercase tracking-wider">{item.category}</span>
                <span className="text-slate-400 font-normal">Pub: {item.year}</span>
              </div>

              {/* Title */}
              <h3 className="text-base font-bold text-white mb-2 leading-snug">
                {item.title}
              </h3>

              {/* Authors & Source */}
              <div className="text-xs font-mono text-slate-400 mb-3">
                {item.authors} · <strong className="text-slate-200">{item.source}</strong>
              </div>

              {/* Summary */}
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                {item.summary}
              </p>

              {/* Key Findings Bulleted */}
              <div className="p-4 rounded-xl bg-[#0B1224]/80 border border-slate-800/80 space-y-2">
                <div className="text-[11px] font-mono uppercase text-[#00E5FF] tracking-wider font-bold">
                  Key Scientific Findings:
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {item.keyFindings.map((finding, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#00E5FF] mt-0.5">•</span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Relevance to Monito System & External URL */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="text-[11px] text-slate-400">
                <strong className="text-cyan-400 font-mono">Platform Integration:</strong>{' '}
                {item.relevanceToAstronautMonitoring}
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white font-mono text-xs transition-colors shrink-0"
              >
                <span>Read NASA Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        ))}
      </div>

      {/* SCIENTIFIC DATA REPOSITORY LINKS BANNER */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-[#0c1224] to-slate-900 border border-slate-800 p-6 sm:p-8">
        <h3 className="text-base font-bold text-white mb-2">
          Open Science & NASA Public Data Portals
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-3xl">
          SPACE HEALTH MONITO is built on the philosophy of open aerospace science. All foundational physiological models utilize publicly released NASA repositories:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <a
            href="https://osdr.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-xl bg-[#070b16] border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-white text-sm">NASA OSDR</div>
              <div className="text-[11px] text-slate-400 mt-1">Open Science Data Repository</div>
            </div>
            <ExternalLink className="w-4 h-4 text-cyan-400" />
          </a>

          <a
            href="https://genelab.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-xl bg-[#070b16] border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-white text-sm">NASA GeneLab</div>
              <div className="text-[11px] text-slate-400 mt-1">Spaceflight Omics & Biology</div>
            </div>
            <ExternalLink className="w-4 h-4 text-cyan-400" />
          </a>

          <a
            href="https://humanresearchroadmap.nasa.gov/"
            target="_blank"
            rel="noreferrer"
            className="p-4 rounded-xl bg-[#070b16] border border-slate-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-white text-sm">Human Research Roadmap</div>
              <div className="text-[11px] text-slate-400 mt-1">Exploration Evidence Books</div>
            </div>
            <ExternalLink className="w-4 h-4 text-cyan-400" />
          </a>
        </div>
      </div>

    </div>
  );
};
