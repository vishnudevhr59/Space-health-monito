import React, { useState, useRef, useEffect } from 'react';
import { AstronautProfile, HealthMeasurement, ResearchReference } from '../types';
import { telemetryStreamEngine, TelemetryFrame } from '../services/telemetryStreamEngine';
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
} from 'lucide-react';

interface MonitoAiPageProps {
  astronaut: AstronautProfile;
  telemetry: HealthMeasurement[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelUsed?: string;
  groundingReferences?: ResearchReference[];
  telemetrySnapshot?: Partial<TelemetryFrame>;
}

export const MonitoAiPage: React.FC<MonitoAiPageProps> = ({ astronaut, telemetry }) => {
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

**Live Context Connected:**
- Heart Rate: \`${currentFrame.heartRate} BPM\` · SpO2: \`${currentFrame.spo2}%\`
- Cabin Atmosphere: \`${currentFrame.cabinPressurePsi} psi\` · CO2: \`${currentFrame.cabinCo2MmHg} mmHg\`
- System Severity: **${currentFrame.severity}** [${currentFrame.anomalyName}]

*Operational Notice: I provide evidence-based decision support, bio-mathematical anomaly explainability, and risk mitigation; I do not formulate certified clinical diagnoses or replace your Flight Surgeon's directives.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash (NASA HRP Grounded)',
      telemetrySnapshot: currentFrame,
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedReferencesId, setExpandedReferencesId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick judge prompts for hackathon presentation
  const suggestedQuestions = [
    'Analyze Current Telemetry',
    'Evaluate Fatigue & Sleep Debt',
    'Check Decompression Protocols',
    'Review NASA HRP Radiation Limits',
    'Assess Vestibular Disorientation',
    'Explain Microgravity Bone Loss',
  ];

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

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendMessage = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || isLoading) return;

    const frameSnapshot = { ...currentFrame };

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          astronautId: astronaut.id,
          liveTelemetry: frameSnapshot,
          conversationHistory: messages.map((m) => ({
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
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `### 🛸 Space Health Knowledge Engine Synthesis (Offline Fallback)

Based on your active biotelemetry stream on **Mission Day ${astronaut.missionDay}**:

- **Real-Time Stream:** Heart Rate \`${frameSnapshot.heartRate} BPM\`, SpO2 \`${frameSnapshot.spo2}%\`, Cabin Pressure \`${frameSnapshot.cabinPressurePsi} psi\`, CO2 \`${frameSnapshot.cabinCo2MmHg} mmHg\`.
- **System Severity:** **${frameSnapshot.severity}** [${frameSnapshot.anomalyName}].
- **NASA HRP Clinical Recommendation:** Maintain countermeasure protocols (ARED resistive exercise + hydration + 460nm circadian phase lighting).

*NASA Human Research Roadmap (Evidence-Based Grounding).*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Space Health Monitor Local Engine',
        telemetrySnapshot: frameSnapshot,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearConversation = () => {
    setMessages(messages.slice(0, 1));
  };

  return (
    <div className="w-full max-w-screen-2xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-6 space-y-6 overflow-x-hidden">
      
      {/* HEADER WITH AI AGENT IDENTITY & LIVE STREAMING BADGES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#00E5FF] font-mono text-xs uppercase tracking-wider mb-1 font-bold">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span>Autonomous Aerospace Clinical Decision Support</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>MONITO AI</span>
            <span className="text-sm font-mono font-normal text-slate-400">
              — Your Space Health Companion
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
            Continuously evaluated against live 1Hz telemetry frames and grounded in peer-reviewed NASA Human Research Program (HRP) literature.
          </p>
        </div>

        {/* Action badges & Clear button */}
        <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-full bg-[#101B30] border border-[#00E5FF]/40 text-[#00E5FF] flex items-center gap-2 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            <span>MODEL: GEMINI 3.8 FLASH</span>
          </span>

          <span className="px-3 py-1.5 rounded-full bg-[#0B1224] border border-emerald-500/40 text-emerald-400 flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>TELEMETRY: LIVE INGEST</span>
          </span>

          <button
            onClick={handleClearConversation}
            className="px-3 py-1.5 rounded-xl bg-[#101B30] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            title="Reset conversation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* CONVERSATIONAL WORKSPACE */}
      <div className="rounded-3xl bg-[#101B30]/85 backdrop-blur-xl border border-[#00E5FF]/25 shadow-[0_0_40px_-5px_rgba(0,229,255,0.15)] flex flex-col h-[700px] max-h-[82vh] overflow-hidden">
        
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

        {/* Messages Stream */}
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

                {/* Footer metadata */}
                <div className="mt-3 flex items-center justify-between text-[10px] font-mono opacity-60">
                  <span>{msg.timestamp}</span>
                  <div className="flex items-center gap-2">
                    {msg.modelUsed && <span>{msg.modelUsed}</span>}
                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="hover:opacity-100 transition-opacity cursor-pointer"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
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
              <div className="bg-[#0B1224] border border-slate-800 rounded-3xl rounded-tl-none p-4 text-xs font-mono text-[#00E5FF] flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 animate-spin text-[#00E5FF]" />
                <span>MONITO AI synthesizing live telemetry snapshot & NASA HRP literature...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK JUDGE PROMPT PILL BUTTONS */}
        <div className="p-3 bg-[#0B1224] border-t border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-2 text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider shrink-0 mr-1 font-bold">
            Judge Quick Prompts:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full bg-[#101B30] hover:bg-[#00E5FF]/10 text-slate-300 hover:text-[#00E5FF] border border-slate-700 hover:border-[#00E5FF]/40 text-xs whitespace-nowrap transition-all cursor-pointer shrink-0 font-medium"
            >
              {q}
            </button>
          ))}
        </div>

        {/* INPUT PROMPT BAR */}
        <div className="p-4 bg-[#050816] border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask MONITO AI about spaceflight physiology, radiation hazards, or your live biotelemetry..."
              disabled={isLoading}
              className="flex-1 min-w-0 px-3.5 sm:px-4 py-3 sm:py-3.5 bg-[#101B30] border border-slate-700 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] font-sans"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-3.5 bg-gradient-to-r from-[#00E5FF] to-[#438BFF] text-[#050816] rounded-2xl font-bold transition-all shadow-[0_0_20px_-3px_rgba(0,229,255,0.4)] disabled:opacity-40 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4 text-[#050816]" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Powered by Gemini 3.8 Flash &bull; Context Grounded in Live 1Hz Telemetry Stream</span>
            <span className="text-[#00E5FF]">Non-Diagnostic Clinical Decision Support</span>
          </div>
        </div>

      </div>

    </div>
  );
};
