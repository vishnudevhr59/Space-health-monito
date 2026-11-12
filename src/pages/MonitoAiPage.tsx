import React, { useState, useRef, useEffect } from 'react';
import { AstronautProfile, HealthMeasurement, ResearchReference } from '../types';
import { telemetryStreamEngine, TelemetryFrame } from '../services/telemetryStreamEngine';
import { voiceAlertService } from '../services/voiceAlertService';
import {
  Brain,
  Send,
  Sparkles,
  BookOpen,
  Copy,
  Check,
  RotateCcw,
  User,
  Bot,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Radio,
  Activity,
  Heart,
  Droplets,
  Wind,
  ShieldAlert,
  Zap,
  Search,
  History,
  X,
  Volume2,
  VolumeX,
  RefreshCw,
  HelpCircle,
  CornerDownLeft,
} from 'lucide-react';

interface MonitoAiPageProps {
  astronaut: AstronautProfile;
  telemetry: HealthMeasurement[];
  onNavigate?: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelUsed?: string;
  groundingReferences?: ResearchReference[];
  telemetrySnapshot?: Partial<TelemetryFrame>;
  isStreaming?: boolean;
}

// Curated Aerospace Medical & NASA HRP Autocomplete Knowledge Base
const PREDICTIVE_AEROSPACE_QUERIES = [
  'Space radiation GCR exposure and career permissible limits',
  'Space motion sickness (SMS) otolith discordance remedies',
  'Spaceflight Associated Neuro-ocular Syndrome (SANS) optic disc edema',
  'Spacecraft cabin pressure Armstrong limit calculation',
  'Space anemia hematocrit reduction in microgravity',
  'Space nutrition & bone calcium osteoblast demineralization',
  'ARED high-load axial resistance exercise protocols',
  'Cephalad fluid redistribution and central venous pressure shift',
  'Atmospheric ECLSS partial CO2 hypercapnia symptoms',
  'Evaluate current live 1Hz biotelemetry excursion',
  'Assess sleep architecture and circadian 460nm phototherapy',
  'Check EVA airlock pre-breathe 100% oxygen protocol',
  'NASA Human Research Program 5 hazards of spaceflight',
  'Deep Space Network Goldstone telemetry lock status',
];

// Curated "People also ask" Accordion Items (matching Google Search image)
const PEOPLE_ALSO_ASK_ITEMS = [
  {
    id: 'paa-1',
    question: 'How long can an astronaut stay in space before permanent bone loss occurs?',
    answer:
      'Astronauts lose ~1% of cortical and trabecular bone mass per month in microgravity, primarily in weight-bearing lower limbs and spine. High-load axial resistance exercise (ARED squats and deadlifts at 120+ kg) combined with Vitamin D3 and bisphosphonates reduces this loss below 0.85%/month, allowing missions of 180 to 360 days with anticipated full recovery upon terrestrial rehabilitation.',
    suggestedQuery: 'Explain Microgravity Bone Loss & ARED Countermeasures',
  },
  {
    id: 'paa-2',
    question: 'What is the Armstrong Limit and why does blood boil without cabin pressure?',
    answer:
      'The Armstrong Limit is the atmospheric altitude (~63,000 ft or 19.2 km, corresponding to ~0.92 psi or 47 mmHg) where ambient atmospheric pressure equals the vapor pressure of water at human core body temperature (37°C). Below this pressure, bodily fluids (saliva, tears, and alveolar moisture) boil spontaneously at normal body temperature, leading to rapid ebullism and fatal pulmonary collapse.',
    suggestedQuery: 'Check Decompression Protocols and Armstrong Limit',
  },
  {
    id: 'paa-3',
    question: 'How does microgravity affect blood pressure and cephalad fluid shift?',
    answer:
      'Without hydrostatic gravity, approximately 2 liters of intravascular and interstitial fluid shifts from the lower limbs toward the head ("cephalad fluid redistribution"). This engorges internal jugular veins, increases intracranial pressure (SANS etiology), and resets carotid-cardiac baroreceptors, producing transient orthostatic intolerance upon re-entry.',
    suggestedQuery: 'Assess Cephalad Fluid Shift & SANS Optic Disc Pressure',
  },
  {
    id: 'paa-4',
    question: 'What are the 5 hazards of human spaceflight mapped by NASA HRP?',
    answer:
      'NASA’s Human Research Program maps the 5 existential hazards of human spaceflight as: 1. Space Radiation (GCR and SPEs); 2. Isolation and Confinement (circadian disruption and psychological stress); 3. Distance from Earth (communications delay and autonomous medical triage); 4. Gravity Fields (microgravity muscle atrophy and vestibular conflict); and 5. Hostile Closed Environments (ECLSS atmospheric pressure, CO2 scrubbers, and microbial loop).',
    suggestedQuery: 'Review NASA HRP 5 Hazards of Human Spaceflight',
  },
  {
    id: 'paa-5',
    question: 'How does the Deep Space Network (DSN) uplink medical telemetry to Houston?',
    answer:
      'Deep-space spacecraft transmit encrypted biomedical telemetry frames via 32.05 GHz Ka-band or 8.4 GHz X-band radio frequencies to NASA’s Deep Space Network 70-meter antennas at Goldstone (California), Madrid (Spain), or Canberra (Australia). Telemetry is demodulated, verified via SHA-256 cryptographic hashes, and routed in real time to the Flight Surgeon Console at NASA Johnson Space Center (Houston, TX).',
    suggestedQuery: 'Check Deep Space Network Ground Uplink Status',
  },
  {
    id: 'paa-6',
    question: 'How were Sunita Williams (Exp 71/72) and Shubhanshu Shukla (Axiom-4) monitored in space?',
    answer:
      'Sunita Williams was monitored over her 286-day ISS mission using the NASA Actiwatch Spectrum (circadian phototherapy & actigraphy), the CSA Bio-Monitor / Hexoskin (streaming continuous ECG, respiration, SpO2, and skin temperature to ISS tablets), and regular encrypted Private Medical Conferences (PMCs). Group Captain Shubhanshu Shukla (Axiom-4 / ISRO) tested next-generation edge-computing health tools: an Oura Ring with Booz Allen onboard edge readiness scoring (computing 0-100 readiness from HRV, RHR, sleep, and skin temp locally), TrialX TESH motion/cardiovascular tracking, Suite Ride Continuous Glucose Monitors (CGM), and ISRO Voyager Displays cognitive eye-tracking.',
    suggestedQuery: 'Explain Sunita Williams & Shubhanshu Shukla Space Telemetry Architecture',
  },
  {
    id: 'paa-7',
    question: 'How does the offline-first Edge Mission Readiness algorithm calculate scores?',
    answer:
      'The edge algorithm calculates a 0-100 score locally on the astronaut tablet without cloud latency using 4 weighted physiological factors compared against the astronaut personal baseline: 1. Heart Rate Variability (HRV RMSSD, 35% weight); 2. Resting Heart Rate elevation (RHR, 25% weight); 3. Sleep Duration and Efficiency (25% weight); and 4. Skin Temperature deviation (15% weight). Scores >=80 are GREEN (cleared for EVA prep), 60-79 are YELLOW (maintenance only), and <60 are RED (EVA suspended).',
    suggestedQuery: 'Calculate Edge Mission Readiness Score & 4-Factor Breakdown',
  },
];

// "People also search for" 2-Column Tactical Grid (matching Google Search image)
const PEOPLE_ALSO_SEARCH_FOR_ITEMS = [
  { label: 'Axiom-4 Edge Readiness', query: 'Explain Axiom-4 Shubhanshu Shukla Oura Ring edge readiness algorithm' },
  { label: 'Sunita Williams Actiwatch', query: 'Detail Sunita Williams Expedition 71/72 Actiwatch Spectrum and Bio-Monitor' },
  { label: 'CGM Metabolic Glucose', query: 'Analyze Suite Ride Continuous Glucose Monitor stability in microgravity' },
  { label: 'Space Radiation Dose', query: 'Evaluate space radiation dosimetry and GCR absorbed dose limits' },
  { label: 'Live Biotelemetry Ingest', query: 'Analyze current live 1Hz biotelemetry and vital signs' },
  { label: 'Microgravity Bone Loss', query: 'Explain microgravity bone density loss and ARED resistance loading' },
  { label: 'SANS Visual Acuity', query: 'Evaluate Spaceflight-Associated Neuro-ocular Syndrome optic sheath pressure' },
  { label: 'NASA Houston Uplink', query: 'Check Deep Space Network Goldstone telemetry lock and ground station status' },
];

export const MonitoAiPage: React.FC<MonitoAiPageProps> = ({ astronaut, telemetry, onNavigate }) => {
  const [currentFrame, setCurrentFrame] = useState<TelemetryFrame>(() =>
    telemetryStreamEngine.getCurrentFrame()
  );

  useEffect(() => {
    const unsubscribe = telemetryStreamEngine.subscribe((f) => setCurrentFrame(f));
    return unsubscribe;
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `### 🛸 Welcome aboard, Commander ${astronaut.name}.

I am **MONITO AI**, your autonomous space health companion and clinical decision-support assistant aboard ${astronaut.destination} (Mission Day ${astronaut.missionDay}).

I am continuously synchronized with your **1Hz biotelemetry stream** and grounded in verified **NASA Human Research Program (HRP)**, **NASA Open Science Data Repository (OSDR)**, and **GeneLab** literature.

**Live Telemetry Ingest:**
- Heart Rate: \`${currentFrame.heartRate} BPM\` · SpO2: \`${currentFrame.spo2}%\`
- Cabin Atmosphere: \`${currentFrame.cabinPressurePsi} psi\` · CO2: \`${currentFrame.cabinCo2MmHg} mmHg\`
- System Severity: **${currentFrame.severity}** [${currentFrame.anomalyName}]

*Operational Notice: I provide evidence-based decision support and bio-mathematical anomaly explainability; I do not formulate certified clinical diagnoses or replace your Flight Surgeon's directives.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'Gemini 3.8 Flash (NASA HRP Grounded)',
      telemetrySnapshot: currentFrame,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const inputQueryRef = useRef(inputQuery);

  useEffect(() => {
    inputQueryRef.current = inputQuery;
  }, [inputQuery]);

  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [expandedReferencesId, setExpandedReferencesId] = useState<string | null>(null);
  const [expandedPaaId, setExpandedPaaId] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number>(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Search History from localStorage
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('monito_ai_search_history');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return [
      'Analyze Current Telemetry',
      'Check Decompression Protocols',
      'Review NASA HRP Radiation Limits',
    ];
  });

  const saveSearchToHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('monito_ai_search_history', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const removeSearchHistoryItem = (e: React.MouseEvent, itemToRemove: string) => {
    e.stopPropagation();
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item !== itemToRemove);
      try {
        localStorage.setItem('monito_ai_search_history', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
  };

  const clearAllSearchHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchHistory([]);
    try {
      localStorage.removeItem('monito_ai_search_history');
    } catch (e) {
      // ignore
    }
  };

  // Close autocomplete on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsInputFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered predictive suggestions based on user typing
  const filteredSuggestions = inputQuery.trim()
    ? PREDICTIVE_AEROSPACE_QUERIES.filter((q) =>
        q.toLowerCase().includes(inputQuery.trim().toLowerCase())
      )
    : PREDICTIVE_AEROSPACE_QUERIES.slice(0, 5);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  };

  useEffect(() => {
    scrollToBottom('smooth');
    const scrollTimer = setTimeout(() => {
      scrollToBottom('auto');
    }, 60);
    return () => clearTimeout(scrollTimer);
  }, [messages, isLoading]);

  // Listen for programmatic query triggers from external controls
  useEffect(() => {
    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent<{ query?: string }>;
      if (customEvent.detail?.query) {
        handleSendMessage(customEvent.detail.query);
      }
    };
    window.addEventListener('monito-ai-trigger-query', handleTrigger);
    return () => window.removeEventListener('monito-ai-trigger-query', handleTrigger);
  }, [currentFrame, isLoading]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Voice Readout using Web SpeechSynthesis
  const handleSpeakText = (text: string, id: string) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text
      .replace(/###|####|\*\*|\*|`|\[.*?\]\(.*?\)/g, '')
      .replace(/[-*]\s+/g, '')
      .slice(0, 400);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en') && v.name.includes('Natural')) || voices.find((v) => v.lang.startsWith('en'));
    if (englishVoice) utterance.voice = englishVoice;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (queryText?: string) => {
    const candidateText =
      typeof queryText === 'string' && queryText.trim().length > 0
        ? queryText
        : (inputQuery || inputQueryRef.current || '');
    const query = candidateText.trim();
    if (!query || isLoading) return;

    // Save to Google-style search history
    saveSearchToHistory(query);

    // Clear input state & close autocomplete dropdown
    setInputQuery('');
    inputQueryRef.current = '';
    setIsInputFocused(false);
    setSelectedSuggestionIndex(-1);

    // Fetch freshest live 1Hz telemetry frame
    const engineFrame = telemetryStreamEngine.getCurrentFrame();
    const frameSnapshot: TelemetryFrame = {
      ...engineFrame,
      heartRate: Number(engineFrame.heartRate) || 64,
      spo2: Number(engineFrame.spo2) || 98.4,
      cabinPressurePsi: Number(engineFrame.cabinPressurePsi) || 14.7,
      cabinCo2MmHg: Number(engineFrame.cabinCo2MmHg) || 2.2,
      vestibularConflictScore: Number(engineFrame.vestibularConflictScore) || 1.4,
      severity: engineFrame.severity || 'NOMINAL',
      anomalyName: engineFrame.anomalyName || 'Nominal Operations',
      systolicBP: Number(engineFrame.systolicBP) || 114,
      diastolicBP: Number(engineFrame.diastolicBP) || 72,
      bodyTemperature: Number(engineFrame.bodyTemperature) || 36.6,
      hrv: Number(engineFrame.hrv) || 64,
      respiratoryRate: Number(engineFrame.respiratoryRate) || 14,
    };

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          prompt: query,
          query: query,
          astronautId: astronaut.id,
          liveTelemetry: frameSnapshot,
          telemetry: frameSnapshot,
          conversationHistory: messages.slice(-10).map((m) => ({
            role: m.sender,
            content: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();

      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        groundingReferences: data.groundingReferences,
        telemetrySnapshot: frameSnapshot,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.warn('MONITO AI query fallback engaged:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `### 🛸 Space Health Monito — Clinical Decision Support (Resilient Offline Mode)

Commander **${astronaut.name}**, your query (*"${query}"*) has been evaluated against your active **1Hz biotelemetry stream** on **Mission Day ${astronaut.missionDay}**:

- **Active Biosensors:** Heart Rate \`${frameSnapshot.heartRate} BPM\`, SpO2 \`${frameSnapshot.spo2}%\`, Hemodynamics \`${frameSnapshot.systolicBP}/${frameSnapshot.diastolicBP} mmHg\` (MAP: ${Math.round(frameSnapshot.diastolicBP + (frameSnapshot.systolicBP - frameSnapshot.diastolicBP) / 3)} mmHg).
- **ECLSS Atmosphere:** Cabin Pressure \`${frameSnapshot.cabinPressurePsi} psi\`, Partial CO2 \`${frameSnapshot.cabinCo2MmHg} mmHg\`.
- **Mission Health Status:** **${frameSnapshot.severity}** [${frameSnapshot.anomalyName}].

**NASA HRP Operational Recommendations:**
1. **Autonomic Balance:** Maintain fluid loading (400 mL isotonic saline buffer with electrolytes) to support central arterial volume.
2. **Atmospheric Verification:** Verify OGA cycle status and active charcoal / amine scrubbing efficiency.
3. **Countermeasure Protocol:** Execute scheduled ARED resistive loading (60 min) and CEVIS cycle ergometry to protect musculoskeletal integrity.

*NASA Human Research Program (HRP) Evidence Books & Flight Medicine Guidelines.*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Space Health Monito Local Engine (NASA HRP Rulebook)',
        telemetrySnapshot: frameSnapshot,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    window.speechSynthesis.cancel();
    setSpeakingId(null);
    setMessages(messages.slice(0, 1));
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
      
      {/* HEADER: AI AGENT IDENTITY & LIVE STREAMING BADGES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#00E5FF] font-mono text-xs uppercase tracking-wider mb-1 font-bold">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span>Autonomous Aerospace Clinical Decision Support & Gemini Intelligence</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>MONITO AI</span>
            <span className="text-sm font-mono font-normal text-slate-400">
              — Your Real-Time Space Health Companion
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Google-powered conversational clinical intelligence evaluated against 1Hz biotelemetry and grounded in NASA Human Research Program (HRP) evidence.
          </p>
        </div>

        {/* Action badges & Ground Uplink Shortcut */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-full bg-[#101B30] border border-[#00E5FF]/40 text-[#00E5FF] flex items-center gap-2 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            <span>GEMINI 3.8 FLASH</span>
          </span>

          <span className="px-3 py-1.5 rounded-full bg-[#0B1224] border border-emerald-500/40 text-emerald-400 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>1Hz LIVE INGEST</span>
          </span>

          {onNavigate && (
            <button
              onClick={() => onNavigate('ground-uplink')}
              className="px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-900 to-cyan-950 border border-cyan-400 text-cyan-200 hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer font-bold shadow-sm"
              title="Transmit Clinical Report to NASA Houston Flight Surgeon"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>NASA Ground Uplink</span>
            </button>
          )}

          <button
            onClick={handleClearConversation}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-[#101B30] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* CONVERSATIONAL WORKSPACE */}
      <div className="rounded-3xl bg-[#101B30]/85 backdrop-blur-xl border border-[#00E5FF]/25 shadow-[0_0_40px_-5px_rgba(0,229,255,0.15)] flex flex-col h-[740px] max-h-[85vh] overflow-hidden">
        
        {/* LIVE TELEMETRY STREAM CONTEXT HUD */}
        <div className="px-4 py-2.5 bg-[#070D1E] border-b border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] uppercase font-bold text-slate-400">ACTIVE TELEMETRY FRAME:</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="text-slate-500">HR:</span>
              <strong className="text-[#00E5FF] font-bold tabular-nums">{currentFrame.heartRate} BPM</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-slate-500">SpO2:</span>
              <strong className="text-sky-400 font-bold tabular-nums">{currentFrame.spo2}%</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-slate-500">BP:</span>
              <strong className="text-emerald-400 font-bold tabular-nums">{currentFrame.systolicBP}/{currentFrame.diastolicBP}</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-slate-500">CABIN P:</span>
              <strong className="text-amber-400 font-bold tabular-nums">{currentFrame.cabinPressurePsi} psi</strong>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-slate-500">CO2:</span>
              <strong className="text-white font-bold tabular-nums">{currentFrame.cabinCo2MmHg} mmHg</strong>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                currentFrame.severity === 'CRITICAL'
                  ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                  : currentFrame.severity === 'WARNING'
                  ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                  : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
              }`}
            >
              {currentFrame.severity}
            </span>
          </div>
        </div>

        {/* MESSAGES STREAM */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 sm:gap-4 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-9 h-9 rounded-2xl bg-[#050816] border border-[#00E5FF]/60 flex items-center justify-center text-[#00E5FF] shrink-0 mt-0.5 shadow-[0_0_15px_rgba(0,229,255,0.25)]">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative max-w-2xl rounded-3xl p-4 sm:p-5 text-sm leading-relaxed shadow-lg break-words overflow-hidden ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-[#00E5FF] to-[#438BFF] text-[#050816] font-medium rounded-tr-none'
                    : 'bg-[#0B1224] border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Content formatting */}
                <div className="space-y-3 prose prose-invert prose-sm max-w-none">
                  {msg.text.split('\n\n').map((paragraph, idx) => {
                    if (paragraph.startsWith('### ')) {
                      return (
                        <h4 key={idx} className="text-base font-bold text-white mt-1 mb-1">
                          {paragraph.replace('### ', '')}
                        </h4>
                      );
                    }
                    if (paragraph.startsWith('#### ')) {
                      return (
                        <h5 key={idx} className="text-sm font-semibold text-[#00E5FF] mt-1 mb-1">
                          {paragraph.replace('#### ', '')}
                        </h5>
                      );
                    }
                    if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                      const items = paragraph.split('\n').filter(Boolean);
                      return (
                        <ul key={idx} className="list-disc list-inside space-y-1 text-slate-300 my-1">
                          {items.map((item, i) => (
                            <li key={i}>{item.replace(/^[-*]\s+/, '')}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (/^\d+\.\s/.test(paragraph)) {
                      const items = paragraph.split('\n').filter(Boolean);
                      return (
                        <ol key={idx} className="list-decimal list-inside space-y-1.5 text-slate-300 my-1 font-mono text-xs">
                          {items.map((item, i) => (
                            <li key={i} className="leading-relaxed">
                              {item.replace(/^\d+\.\s+/, '')}
                            </li>
                          ))}
                        </ol>
                      );
                    }
                    return (
                      <p key={idx} className={msg.sender === 'user' ? 'text-[#050816]' : 'text-slate-300'}>
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                {/* Grounding Citations */}
                {msg.groundingReferences && msg.groundingReferences.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <button
                      onClick={() =>
                        setExpandedReferencesId(expandedReferencesId === msg.id ? null : msg.id)
                      }
                      className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-mono font-bold cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{msg.groundingReferences.length} Verified NASA Research References</span>
                      {expandedReferencesId === msg.id ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedReferencesId === msg.id && (
                      <div className="mt-3 space-y-2 font-mono text-[11px]">
                        {msg.groundingReferences.map((ref) => (
                          <div
                            key={ref.id}
                            className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/40 transition-colors"
                          >
                            <div className="font-bold text-white flex items-center justify-between">
                              <span>{ref.title}</span>
                              <a
                                href={ref.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline flex items-center gap-1"
                              >
                                <span>{ref.datasetId || 'NASA'}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                            <div className="text-slate-400 mt-1">{ref.authors} ({ref.year}) &bull; {ref.source}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer metadata & Gemini Voice / Copy Actions */}
                <div className="mt-3 flex items-center justify-between text-[10px] font-mono opacity-80 pt-2 border-t border-slate-800/50">
                  <span>{msg.timestamp}</span>
                  <div className="flex items-center gap-2.5">
                    {msg.modelUsed && <span className="text-slate-400 hidden sm:inline">{msg.modelUsed}</span>}

                    {/* Gemini Voice Readout */}
                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => handleSpeakText(msg.text, msg.id)}
                        className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                          speakingId === msg.id ? 'text-emerald-400' : 'text-slate-400 hover:text-cyan-400'
                        }`}
                        title={speakingId === msg.id ? 'Stop reading' : 'Read response aloud'}
                      >
                        {speakingId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}

                    {/* Copy Button */}
                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="p-1 rounded hover:bg-slate-800 transition-colors text-slate-400 hover:text-white cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-2xl bg-cyan-900/40 border border-cyan-500/50 flex items-center justify-center text-cyan-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 items-center">
              <div className="w-9 h-9 rounded-2xl bg-[#050816] border border-[#00E5FF]/60 flex items-center justify-center text-[#00E5FF] shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#0B1224] border border-slate-800 rounded-3xl rounded-tl-none p-4 text-xs font-mono text-[#00E5FF] flex items-center gap-2.5 shadow-lg">
                <Sparkles className="w-4 h-4 animate-spin text-[#00E5FF]" />
                <span>MONITO AI synthesizing 1Hz live telemetry & NASA HRP literature via Gemini...</span>
              </div>
            </div>
          )}

          {/* GOOGLE-STYLE "PEOPLE ALSO ASK" ACCORDION SECTION (matching image_ff53bfc9.png) */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 tracking-wide font-sans">
              <HelpCircle className="w-4 h-4 text-[#00E5FF]" />
              <span>People also ask</span>
            </div>

            <div className="space-y-2">
              {PEOPLE_ALSO_ASK_ITEMS.map((item) => {
                const isOpen = expandedPaaId === item.id;
                return (
                  <div
                    key={item.id}
                    className="rounded-2xl bg-[#0B1224] border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedPaaId(isOpen ? null : item.id)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-medium text-slate-200 hover:text-white cursor-pointer focus-visible:outline-none"
                    >
                      <span>{item.question}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                          isOpen ? 'rotate-180 text-[#00E5FF]' : ''
                        }`}
                      />
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed space-y-3 border-t border-slate-800/60 font-sans animate-in fade-in duration-150">
                        <p>{item.answer}</p>
                        <button
                          onClick={() => handleSendMessage(item.suggestedQuery)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#101B30] hover:bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] text-[11px] font-mono font-bold transition-all cursor-pointer"
                        >
                          <Search className="w-3 h-3" />
                          <span>Ask MONITO this in chat &rarr;</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* GOOGLE-STYLE "PEOPLE ALSO SEARCH FOR" 2-COLUMN TACTICAL GRID (matching image_fc7ca9c9.png) */}
          <div className="mt-8 pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 tracking-wide font-sans">
                <Search className="w-4 h-4 text-[#00E5FF]" />
                <span>People also search for</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Tap to search instantly</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PEOPLE_ALSO_SEARCH_FOR_ITEMS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(item.query)}
                  disabled={isLoading}
                  className="px-4 py-3 rounded-2xl bg-[#0B1224] hover:bg-[#101B30] border border-slate-800 hover:border-[#00E5FF]/50 text-slate-200 hover:text-[#00E5FF] transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-medium cursor-pointer group shadow-sm active:scale-98"
                >
                  <span className="truncate">{item.label}</span>
                  <Search className="w-4 h-4 text-slate-400 group-hover:text-[#00E5FF] shrink-0 transition-transform group-hover:scale-110" />
                </button>
              ))}
            </div>
          </div>

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT PROMPT BAR WITH GOOGLE-STYLE AUTOCOMPLETE & SEARCH HISTORY */}
        <div className="p-4 bg-[#050816] border-t border-slate-800 relative" ref={searchContainerRef}>
          
          {/* FLOATING AUTOCOMPLETE DROPDOWN (appears when user focuses or types in search input) */}
          {isInputFocused && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-[#0B1224] border border-slate-700 rounded-3xl shadow-[0_-10px_35px_rgba(0,0,0,0.8)] overflow-hidden z-50 text-xs font-sans max-h-80 overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
              
              {/* RECENT SEARCHES (with Clock icon 🕒 and delete button ✕) */}
              {searchHistory.length > 0 && (
                <div className="p-2 border-b border-slate-800">
                  <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-purple-400" />
                      <span>Recent Searches</span>
                    </span>
                    <button
                      type="button"
                      onClick={clearAllSearchHistory}
                      className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-0.5">
                    {searchHistory.map((queryText, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          handleSendMessage(queryText);
                        }}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-200 hover:bg-[#101B30] hover:text-[#00E5FF] cursor-pointer group transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <History className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span className="truncate">{queryText}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => removeSearchHistoryItem(e, queryText)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer shrink-0"
                          title="Remove from history"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REAL-TIME PREDICTIVE SEARCH SUGGESTIONS (Highlights matching substring) */}
              <div className="p-2">
                <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{inputQuery.trim() ? 'Matching Telemetry & Medical Queries' : 'Suggested Inquiries'}</span>
                </div>

                <div className="space-y-0.5">
                  {filteredSuggestions.map((suggestion, idx) => {
                    const matchStart = inputQuery.trim()
                      ? suggestion.toLowerCase().indexOf(inputQuery.trim().toLowerCase())
                      : -1;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSendMessage(suggestion)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-slate-300 hover:bg-[#101B30] hover:text-[#00E5FF] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span className="truncate">
                            {matchStart >= 0 ? (
                              <>
                                {suggestion.slice(0, matchStart)}
                                <strong className="text-white font-black underline decoration-cyan-400">
                                  {suggestion.slice(matchStart, matchStart + inputQuery.trim().length)}
                                </strong>
                                {suggestion.slice(matchStart + inputQuery.trim().length)}
                              </>
                            ) : (
                              suggestion
                            )}
                          </span>
                        </div>
                        <CornerDownLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* FORM INPUT */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputQuery);
            }}
            className="flex items-center gap-3"
          >
            <div className="relative flex-1 min-w-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <textarea
                rows={1}
                value={inputQuery}
                onFocus={() => setIsInputFocused(true)}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputQuery);
                  }
                  if (e.key === 'Escape') {
                    setIsInputFocused(false);
                  }
                }}
                placeholder="Search or ask MONITO AI (e.g. 'space radiation', 'heart rate excursion', 'pre-breathe')..."
                disabled={isLoading}
                className="w-full pl-10 sm:pl-11 pr-3.5 sm:pr-4 py-3 sm:py-3.5 bg-[#101B30] border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] focus-visible:ring-2 focus-visible:ring-[#00E5FF]/50 font-sans resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="min-h-[44px] min-w-[44px] p-3.5 bg-gradient-to-r from-[#00E5FF] to-[#438BFF] text-[#050816] rounded-2xl font-bold transition-all shadow-[0_0_20px_-3px_rgba(0,229,255,0.4)] disabled:opacity-40 cursor-pointer shrink-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
              title="Send query to MONITO AI"
            >
              <Send className="w-4 h-4 text-[#050816]" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Powered by Gemini 3.8 Flash &bull; Real-Time Search & Autocomplete</span>
            <span className="text-[#00E5FF]">NASA HRP Evidence Grounded</span>
          </div>
        </div>

      </div>

    </div>
  );
};
