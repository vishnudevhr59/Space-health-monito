import React from 'react';
import { Logo } from './Logo';
import { ExternalLink, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#05070f] border-t border-slate-800/80 mt-16 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          <div className="md:col-span-2">
            <Logo size="md" className="mb-3" />
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              SPACE HEALTH MONITO is an AI-powered astronaut health-monitoring and clinical decision support platform developed for the NASA Space Apps Challenge 2026.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-cyan-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NASA Space Apps Challenge 2026 Submission · Team SPACE HEALTH MONITO</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 font-mono">
              Scientific Sources
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.nasa.gov/hrp/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  NASA Human Research Program (HRP)
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://osdr.nasa.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  NASA Open Science Data Repository (OSDR)
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://genelab.nasa.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  NASA GeneLab Multi-Omics
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://humanresearchroadmap.nasa.gov/"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors inline-flex items-center gap-1"
                >
                  Human Research Roadmap
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3 font-mono">
              Scientific Integrity Notice
            </h4>
            <p className="text-[11px] leading-relaxed text-slate-500">
              All displayed astronaut biometric measurements are realistic simulated models calibrated to NASA physiological literature. This system does not access private medical records and is designed as an operational decision-support tool, not an autonomous diagnostic device.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-mono">
          <div>
            "Monitoring Human Health Beyond Earth." · NASA Space Apps Challenge 2026
          </div>
          <div>
            MERN + Python ML Engine + Gemini AI Decision Support
          </div>
        </div>
      </div>
    </footer>
  );
};
