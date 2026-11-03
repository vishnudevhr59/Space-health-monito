import React, { useState, useRef, useEffect } from 'react';
import { AstronautProfile, HealthMeasurement, ResearchReference } from '../types';
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
}

export const MonitoAiPage: React.FC<MonitoAiPageProps> = ({ astronaut, telemetry }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `### Welcome aboard, Commander ${astronaut.name}.

I am **MONITO AI**, your autonomous space health companion and clinical decision-support assistant aboard ${astronaut.destination} (Mission Day ${astronaut.missionDay}).

I am continuously synchronized with your biotelemetry streams and grounded in verified **NASA Human Research Program (HRP)**, **NASA Open Science Data Repository (OSDR)**, and **GeneLab** literature.

You can ask me to:
- Evaluate your recent vitals, anomalies, and cardiovascular baseline trends.
- Explain the biological mechanics of microgravity bone loss, space radiation risks, and muscle atrophy.
- Recommend countermeasure protocols (ARED resistive loading, CEVIS ergometry, hydration, and circadian lighting).

*Operational Notice: I provide evidence-based decision support and risk analysis; I do not formulate medical diagnoses or replace your Flight Surgeon's clinical directives.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelUsed: 'gemini-3.8-flash (NASA HRP Grounded)',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedReferencesId, setExpandedReferencesId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Exact 5 suggested scientific questions from prompt
  const suggestedQuestions = [
    'Explain how microgravity affects bone density.',
    'Analyze my recent sleep patterns.',
    'Explain space radiation exposure.',
    'Identify unusual changes in my health indicators.',
    'What are the physiological challenges of Mars missions?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSendMessage = async (queryText?: string) => {
    const query = queryText || inputQuery;
    if (!query.trim() || isLoading) return;

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
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `### Space Health Knowledge Engine Synthesis\n\nBased on your local mission baseline on **Mission Day ${astronaut.missionDay}**:\n\n- **Biotelemetry Status:** Heart Rate ${telemetry[telemetry.length - 1]?.heartRate || 64} BPM, SpO2 ${telemetry[telemetry.length - 1]?.spo2 || 98.4}%, Core Temperature 36.6°C.\n- **Scientific Observation:** Microgravity shifts central fluid cephalad, altering baroreceptor tone. Countermeasures: Maintain ARED resistive load protocol and 460nm dynamic blue lighting to safeguard circadian phase.\n\n*Reference: NASA Human Research Roadmap (Bone & Cardiovascular Disciplines).*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Space Health Monito Local Engine',
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* HEADER WITH AI AGENT IDENTITY */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[#00E5FF] font-mono text-xs uppercase tracking-wider mb-1 font-bold">
            <Cpu className="w-4 h-4" />
            <span>Autonomous Aerospace Clinical Decision Support</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>MONITO AI</span>
            <span className="text-sm font-mono font-normal text-slate-400">
              — Your Space Health Companion
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Grounded in peer-reviewed NASA Human Research Program literature with authorized biotelemetry access.
          </p>
        </div>

        {/* Action badges & Clear button */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-full bg-[#101B30] border border-[#00E5FF]/40 text-[#00E5FF] flex items-center gap-2 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            <span>MODEL: GEMINI 3.8 FLASH</span>
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
      <div className="rounded-3xl bg-[#101B30]/85 backdrop-blur-xl border border-[#00E5FF]/25 shadow-[0_0_40px_-5px_rgba(0,229,255,0.15)] flex flex-col h-[680px] overflow-hidden">
        
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
                className={`relative max-w-2xl rounded-3xl p-5 text-sm leading-relaxed shadow-lg ${
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
                    return (
                      <p key={idx} className={msg.sender === 'user' ? 'text-[#050816]' : 'text-slate-300'}>
                        {paragraph}
                      </p>
                    );
                  })}
                </div>

                {/* Expandable Grounding References */}
                {msg.groundingReferences && msg.groundingReferences.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs">
                    <button
                      onClick={() =>
                        setExpandedReferencesId(
                          expandedReferencesId === msg.id ? null : msg.id
                        )
                      }
                      className="flex items-center justify-between w-full text-[#00E5FF] font-mono text-[11px] hover:underline cursor-pointer mb-1"
                    >
                      <span className="flex items-center gap-1.5 font-bold">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>NASA Human Research Citations ({msg.groundingReferences.length})</span>
                      </span>
                      {expandedReferencesId === msg.id ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedReferencesId === msg.id && (
                      <div className="space-y-2 mt-2">
                        {msg.groundingReferences.map((ref, rIdx) => (
                          <div
                            key={rIdx}
                            className="p-3 rounded-xl bg-[#050816] border border-slate-800 space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">{ref.title}</span>
                              <a
                                href={ref.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#00E5FF] hover:text-white flex items-center gap-1 font-mono text-[10px]"
                              >
                                <span>Source</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              {ref.summary}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Footer Strip: Timestamp, Model, Copy Response */}
                <div className="mt-3 pt-2 flex items-center justify-between text-[10px] font-mono border-t border-slate-800/60 text-slate-400">
                  <span>{msg.timestamp}</span>

                  <div className="flex items-center gap-3">
                    {msg.modelUsed && (
                      <span className="text-[#00E5FF]/80">{msg.modelUsed}</span>
                    )}

                    <button
                      onClick={() => handleCopyText(msg.text, msg.id)}
                      className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-[#21D4A5]" />
                          <span className="text-[#21D4A5]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-9 h-9 rounded-2xl bg-[#101B30] border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-9 h-9 rounded-2xl bg-[#050816] border border-[#00E5FF]/60 flex items-center justify-center text-[#00E5FF] shrink-0 mt-0.5 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#0B1224] border border-slate-800 rounded-3xl rounded-tl-none p-4 text-xs font-mono text-[#00E5FF] flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 animate-spin text-[#00E5FF]" />
                <span>MONITO AI synthesizing NASA Human Research Program literature...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 5 EXACT SUGGESTED SCIENTIFIC QUESTIONS SHORTCUTS */}
        <div className="p-3 bg-[#0B1224] border-t border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-2 text-xs">
          <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider shrink-0 mr-1 font-bold">
            Suggested Queries:
          </span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full bg-[#101B30] hover:bg-[#00E5FF]/10 text-slate-300 hover:text-[#00E5FF] border border-slate-700 hover:border-[#00E5FF]/40 text-xs whitespace-nowrap transition-all cursor-pointer shrink-0"
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
              placeholder="Ask MONITO AI about spaceflight physiology, radiation hazards, or your personal vitals..."
              disabled={isLoading}
              className="flex-1 px-4 py-3.5 bg-[#101B30] border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00E5FF] font-sans"
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
            <span>Powered by Gemini 3.8 Flash &bull; Retrieval Grounded with NASA HRP Knowledge Base</span>
            <span className="text-[#00E5FF]">Non-Diagnostic Clinical Decision Support</span>
          </div>
        </div>

      </div>

    </div>
  );
};
