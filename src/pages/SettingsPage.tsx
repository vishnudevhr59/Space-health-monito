import React, { useState } from 'react';
import { AstronautProfile, User } from '../types';
import {
  Sliders,
  User as UserIcon,
  ShieldCheck,
  Bell,
  Gauge,
  Save,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  BookOpen,
  ExternalLink,
} from 'lucide-react';

interface SettingsPageProps {
  astronaut: AstronautProfile;
  currentUser: User;
  onUpdateAstronaut: (updated: Partial<AstronautProfile>) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  astronaut,
  currentUser,
  onUpdateAstronaut,
}) => {
  const [restingHrBaseline, setRestingHrBaseline] = useState(astronaut.baselineVitals?.restingHeartRate || 58);
  const [spo2Threshold, setSpo2Threshold] = useState(astronaut.baselineVitals?.spo2 || 98.4);
  const [radiationLimit, setRadiationLimit] = useState(astronaut.radiationMissionLimitMSv || 250);
  const [tempUnit, setTempUnit] = useState<'Celsius' | 'Fahrenheit'>('Celsius');
  const [pressureUnit, setPressureUnit] = useState<'kPa' | 'mmHg'>('kPa');
  const [audioAlerts, setAudioAlerts] = useState(true);
  const [autoAcknowledgeAdvisory, setAutoAcknowledgeAdvisory] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAstronaut({
      radiationMissionLimitMSv: Number(radiationLimit),
      baselineVitals: {
        ...astronaut.baselineVitals,
        restingHeartRate: Number(restingHrBaseline),
        spo2: Number(spo2Threshold),
      },
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs uppercase tracking-wider mb-1">
            <Sliders className="w-4 h-4" />
            <span>Mission Hardware & Calibration Profile</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            System & Mission Settings
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure astronaut baseline thresholds, environmental units, and notification preferences.
          </p>
        </div>

        {isSaved && (
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved & Synchronized</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ASTRONAUT PROFILE CALIBRATION */}
        <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-5">
          <div className="flex items-center gap-2 text-base font-bold text-white tracking-wide">
            <UserIcon className="w-5 h-5 text-[#00E5FF]" />
            <span>Assigned Astronaut Pre-Flight Baseline</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Astronaut Name</label>
              <input
                type="text"
                disabled
                value={astronaut.name}
                className="w-full px-3.5 py-2.5 bg-[#0B1224] border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Mission Callsign</label>
              <input
                type="text"
                disabled
                value={astronaut.callsign}
                className="w-full px-3.5 py-2.5 bg-[#0B1224] border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Resting Heart Rate Baseline (BPM)</label>
              <input
                type="number"
                value={restingHrBaseline}
                onChange={(e) => setRestingHrBaseline(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#0B1224] border border-slate-700/80 rounded-xl text-[#00E5FF] font-bold text-base tabular-nums focus:outline-none focus:border-[#00E5FF]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Used for dashed chart reference lines in Mission Control</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">SpO2 Nominal Baseline (%)</label>
              <input
                type="number"
                step="0.1"
                value={spo2Threshold}
                onChange={(e) => setSpo2Threshold(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#0B1224] border border-slate-700/80 rounded-xl text-sky-400 font-bold text-base tabular-nums focus:outline-none focus:border-[#00E5FF]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Used for dashed chart reference lines in Mission Control</span>
            </div>
          </div>
        </div>

        {/* MEDICAL SAFETY THRESHOLDS */}
        <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-5">
          <div className="flex items-center gap-2 text-base font-bold text-white tracking-wide">
            <ShieldCheck className="w-5 h-5 text-[#FFB547]" />
            <span>Mission Permissible Exposure Limits (PEL)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Cumulative Radiation Mission Limit (mSv)</label>
              <input
                type="number"
                value={radiationLimit}
                onChange={(e) => setRadiationLimit(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-[#0B1224] border border-slate-700/80 rounded-xl text-[#FFB547] font-bold text-base tabular-nums focus:outline-none focus:border-[#00E5FF]"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Artemis Gateway Standard: 250 mSv</span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-medium">Temperature Unit</label>
              <div className="flex gap-2">
                {(['Celsius', 'Fahrenheit'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setTempUnit(u)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs transition-all cursor-pointer font-medium ${
                      tempUnit === u ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/60 font-bold shadow-[0_0_12px_rgba(0,229,255,0.2)]' : 'bg-[#0B1224] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {u} ({u === 'Celsius' ? '°C' : '°F'})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ALERTS & NOTIFICATIONS PREFERENCES */}
        <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-5">
          <div className="flex items-center gap-2 text-base font-bold text-white tracking-wide">
            <Bell className="w-5 h-5 text-[#00E5FF]" />
            <span>Audio & Visual Alert Protocols</span>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-4 rounded-xl bg-[#0B1224]/80 border border-slate-800/80 cursor-pointer hover:border-[#00E5FF]/30 transition-colors">
              <div>
                <div className="font-semibold text-white">Audible Habitat Triage Chime</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Emit sound tones when Critical severity alerts are generated</div>
              </div>
              <input
                type="checkbox"
                checked={audioAlerts}
                onChange={(e) => setAudioAlerts(e.target.checked)}
                className="w-4 h-4 accent-[#00E5FF] cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-[#0B1224]/80 border border-slate-800/80 cursor-pointer hover:border-[#00E5FF]/30 transition-colors">
              <div>
                <div className="font-semibold text-white">Auto-Acknowledge Low-Severity Advisories</div>
                <div className="text-slate-400 text-[11px] mt-0.5">Automatically clear ground station telemetry packet gaps after 15 minutes</div>
              </div>
              <input
                type="checkbox"
                checked={autoAcknowledgeAdvisory}
                onChange={(e) => setAutoAcknowledgeAdvisory(e.target.checked)}
                className="w-4 h-4 accent-[#00E5FF] cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-7 py-3 bg-gradient-to-r from-[#00E5FF] to-[#438BFF] hover:brightness-110 text-[#050816] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(0,229,255,0.3)] flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>

      {/* ASTRONAUT SPACE HEALTH FREQUENTLY ASKED QUESTIONS (FAQS) */}
      <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-base font-bold text-white tracking-wide">
            <HelpCircle className="w-5 h-5 text-[#00E5FF]" />
            <span>Astronaut Space Health & Mission FAQs</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded-full border border-cyan-800">
            NASA HRP FLIGHT MEDICINE
          </span>
        </div>

        <div className="space-y-3 font-sans">
          {[
            {
              q: 'How do I manage acute Space Motion Sickness (SMS) during the first 72 hours in microgravity?',
              a: 'Space Motion Sickness results from otolith-canal sensory discordance in zero-g. Protocols prescribe minimizing rapid head pitch/yaw movements, anchoring visual gaze onto fixed vehicle horizon references, maintaining hydration, and administering 25 mg Promethazine (oral or IM) under Flight Surgeon standing orders. Symptoms typically resolve within 48 to 72 hours through cerebellar neuro-adaptation.',
            },
            {
              q: 'What should the crew do if a Solar Particle Event (SPE) radiation alert is triggered?',
              a: 'Immediately cease all extravehicular activities (EVAs), confirm airlock seal, and retreat to the designated Gateway / Vehicle Radiation Storm Shelter (water-shielded central core with >20 g/cm² areal mass). Maintain personal passive dosimeter monitoring, ingest prescribed antioxidant therapy, and await DSN Goldstone radiation flux all-clear from NASA Space Radiation Analysis Group (SRAG).',
            },
            {
              q: 'Why is 2.5 hours of daily ARED & CEVIS exercise mandatory to prevent osteopenia?',
              a: 'Without gravitational mechanical loading, osteoclast resorption outpaces osteoblast formation, leading to ~1% bone mineral density loss per month. The Advanced Resistive Exercise Device (ARED) delivers up to 2,600 N of axial loading to femur, pelvis, and lumbar spine, while CEVIS cycle ergometry preserves VO2 max, maintaining cardiac stroke volume and neuromuscular coordination.',
            },
            {
              q: 'How does microgravity cephalad fluid shift cause Spaceflight-Associated Neuro-ocular Syndrome (SANS)?',
              a: 'The absence of gravity eliminates the 2-meter hydrostatic column, shifting ~2 liters of vascular fluid headward. This chronic elevation in jugular venous and cerebral venous pressure causes optic disc edema, posterior globe flattening, hyperopic shifts, and choroidal folds. Countermeasures include daily Lower Body Negative Pressure (LBNP) sessions at -30 mmHg to draw blood caudally.',
            },
            {
              q: 'How does MONITO AI synchronize with NASA Houston Flight Surgeons via Deep Space Network?',
              a: 'Biotelemetry is sampled at 1Hz, encrypted with AES-256-GCM, hashed via SHA-256, and packetized for Deep Space Network (DSN) uplink on 32.05 GHz Ka-band. Even with light-time delays (1.3s Lunar Gateway, up to 21 min Mars), MONITO AI runs autonomous edge intelligence on board while ground flight surgeons monitor mirrored telemetry at NASA JSC Building 30.',
            },
            {
              q: 'What is the Armstrong Limit and how does ECLSS maintain 14.7 psi cabin pressure?',
              a: 'The Armstrong Limit (~0.92 psi or 47 mmHg) is where atmospheric pressure equals body temperature water vapor pressure, causing exposed bodily fluids to boil. Spacecraft Environmental Control & Life Support Systems (ECLSS) maintain 14.7 psi (101.3 kPa) at 21% O2 / 78% N2, scrubbing CO2 below 2.5 mmHg via Regenerative Amine Scrubbers to prevent hypercapnic headache.',
            },
            {
              q: 'What is the circadian 460nm blue light phototherapy protocol for sleep-wake synchronization?',
              a: 'Astronauts experience 16 sunrises every 24 hours in low Earth orbit. Dynamic Solid-State Lighting Assemblies (SSLAs) deliver high-intensity 460nm blue-enriched light upon cabin wake cycle to suppress melatonin and promote cognitive alertness, transitioning to low-irradiance warm light (<10 lux, 2700K) prior to sleep quarters ingress.',
            },
            {
              q: 'How do point-of-care medical devices (e.g. Butterfly iQ ultrasound, i-STAT) operate in weightlessness?',
              a: 'Point-of-care ultrasound uses handheld piezo-electric array transducers with specialized acoustic gel pads designed for zero-g surface tension. Blood gas and lactate analyzers (i-STAT) utilize closed microfluidic cartridges where capillary action draws blood samples without requiring gravity-dependent fluid settling.',
            },
            {
              q: 'How were Sunita Williams (Exp 71/72) and Gp Capt Shubhanshu Shukla (Axiom-4) monitored in space?',
              a: 'Astronauts rely on specialized multi-tier ecosystems rather than single consumer apps. Sunita Williams (during her 286-day ISS mission) wore the NASA Actiwatch Spectrum for circadian tracking, a non-invasive Sensor-Embedded Smart Vest during sleep, and the CSA Bio-Monitor (Hexoskin) streaming continuous ECG, SpO2, and skin temperature to ISS tablets alongside encrypted weekly Private Medical Conferences (PMCs) with Houston flight surgeons. Gp Capt Shubhanshu Shukla (Axiom-4 / ISRO Gaganyaan) tested next-generation edge-computing systems: an Oura Ring with Booz Allen edge readiness software (computing a 0–100 readiness score locally from HRV, RHR, sleep, and skin temp without Earth servers), TrialX Telemetric Health AI (TESH) motion/cardiovascular tracking, Suite Ride Continuous Glucose Monitors (CGM), and ISRO Voyager Displays cognitive eye-tracking.',
            },
            {
              q: 'How does the offline-first Edge-Computing Mission Readiness Score (0-100) work without ground cloud servers?',
              a: 'The algorithm compares live biometric readings against the crew member 7-day rolling orbital baseline across 4 weighted indicators: 1. Heart Rate Variability (HRV RMSSD, 35% weight: ratio of current to baseline, penalizing drops below 85%); 2. Resting Heart Rate (RHR, 25% weight: 4 pts penalty per bpm elevation above baseline); 3. Sleep Score (25% weight: duration factored against 7.5h target multiplied by sleep efficiency percentage); and 4. Skin Temperature Stability (15% weight: 60 pts penalty per 1.0°C deviation from baseline). Scores >=80 indicate GREEN (cleared for EVA extravehicular activity and complex docked maneuvers), 60-79 indicate YELLOW (station maintenance and 30-min sleep extension), and <60 indicate RED (cardiorespiratory fatigue; delay EVA and initiate medical consult).',
            },
          ].map((faq, i) => (
            <details
              key={i}
              className="group rounded-xl bg-[#0B1224] border border-slate-800 p-4 transition-all duration-200 hover:border-[#00E5FF]/40 open:border-[#00E5FF]/50"
            >
              <summary className="flex items-center justify-between font-medium text-xs sm:text-sm text-slate-200 cursor-pointer list-none select-none">
                <span className="flex items-center gap-2">
                  <span className="text-[#00E5FF] font-mono font-bold">0{i + 1}.</span>
                  <span>{faq.q}</span>
                </span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform duration-200 shrink-0 ml-2">
                  ▼
                </span>
              </summary>
              <p className="mt-3 text-xs text-slate-300 leading-relaxed pl-6 border-l-2 border-[#00E5FF]/30">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>

      {/* SCIENTIFIC SOURCES & NASA OPEN SCIENCE REPOSITORY (Strictly located in SettingsPage) */}
      <div className="bg-[#101B30]/90 backdrop-blur-md border border-[#00E5FF]/20 rounded-2xl p-6 sm:p-7 shadow-[0_4px_24px_rgba(0,229,255,0.03)] space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-base font-bold text-white tracking-wide">
            <BookOpen className="w-5 h-5 text-[#21D4A5]" />
            <span>Official NASA Scientific Sources & Data Provenance</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
            PEER-REVIEWED STANDARDS
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-[#0B1224] border border-slate-800 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white text-sm">NASA Human Research Program (HRP)</span>
              <a
                href="https://www.nasa.gov/hrp/"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>HRP.gov</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400 text-xs font-sans leading-relaxed">
              Provides the evidence books and risk mitigation protocols for the 5 hazards of human spaceflight: radiation, isolation, distance, gravity fields, and closed environments.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1224] border border-slate-800 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white text-sm">NASA Open Science Data Repository (OSDR)</span>
              <a
                href="https://osdr.nasa.gov/"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>OSDR.gov</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400 text-xs font-sans leading-relaxed">
              Hosts spaceflight omics, phenotypic datasets, and astronaut physiological baseline profiles calibrated from Apollo, Skylab, Shuttle, and ISS expeditions.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1224] border border-slate-800 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white text-sm">NASA GeneLab Multi-Omics</span>
              <a
                href="https://genelab.nasa.gov/"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>GeneLab</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400 text-xs font-sans leading-relaxed">
              Open-access multi-omics repository characterizing telomere dynamics, DNA damage response, mitochondrial stress, and immune system alterations in long-duration spaceflight.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B1224] border border-slate-800 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-white text-sm">Human Research Roadmap (HRR)</span>
              <a
                href="https://humanresearchroadmap.nasa.gov/"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>HRR.gov</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-slate-400 text-xs font-sans leading-relaxed">
              Defines gap milestones, clinical risk thresholds, and medical countermeasure certification standards for Artemis lunar missions and future human Mars exploration.
            </p>
          </div>
        </div>

        {/* SCIENTIFIC INTEGRITY & BIO-MATHEMATICAL NOTICE */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-sans space-y-1.5">
          <div className="font-bold text-slate-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Scientific Integrity & Operational Decision Support Notice</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            All displayed astronaut biometric measurements and streaming telemetry are realistic models calibrated directly against NASA physiological literature and flight standards (NASA-STD-3001 Vol 1). This application does not access private protected health information and is designed exclusively as an operational clinical decision-support tool.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row justify-between text-[10px] font-mono text-slate-500 border-t border-slate-800">
            <span>NASA Space Apps Challenge 2026 Submission</span>
            <span>SPACE HEALTH MONITO &bull; Monitoring Human Health Beyond Earth</span>
          </div>
        </div>
      </div>

    </div>
  );
};

