import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Send, Network, ChevronDown, ChevronRight, ExternalLink,
  ArrowRight, X, CheckCircle2, Sliders, Database, Building2, Plus,
  Search, PanelLeft, Settings, HelpCircle, Compass, FileText, User,
  Mic, MessageSquare, Shield, Activity, Lightbulb, Briefcase, Layers,
  Square, Trash2, Loader2
} from 'lucide-react';
import { ReactFlowProvider } from '@xyflow/react';
import { GraphView } from '../components/GraphView';
import { PipelineFlowView } from '../components/PipelineFlowView';

/* ── Types ────────────────────────────────────────────── */
interface ThinkingStep {
  text: string;
  done: boolean;
}

interface Source {
  name: string;
  url: string;
  domain: string;
  icon: string;
}

interface Msg {
  id: string;
  role: 'user' | 'ai';
  text: string;
  progress?: number;          // 0 to 100
  progressLabel?: string;     // e.g. "Deep Researching Regulatory Matrix..."
  thinking?: ThinkingStep[];
  sources?: Source[];
  thinkingDuration?: number;  // seconds
  showGraph?: boolean;        // render "Open Graph" CTA
}

interface ChatSession {
  id: string;
  title: string;
  timestamp: number;
  isExecuting?: boolean;
  messages: Msg[];
}

/* ── Real Web Evidence & Regulatory Sources ─────────────── */
const SOURCES_MAP: Record<string, Source[]> = {
  strategy: [
    { name: 'McKinsey Digital', url: 'https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights', domain: 'mckinsey.com', icon: '📊' },
    { name: 'Gartner Architecture', url: 'https://www.gartner.com/en/information-technology', domain: 'gartner.com', icon: '📈' },
  ],
  process: [
    { name: 'ISO/IEC 42001 AI', url: 'https://www.iso.org/standard/81230.html', domain: 'iso.org', icon: '🌐' },
  ],
  role: [
    { name: 'WEF Future of Jobs', url: 'https://www.weforum.org/reports/the-future-of-jobs-report-2023', domain: 'weforum.org', icon: '💼' },
  ],
  governance: [
    { name: 'EU AI Act (CELEX 52021PC0206)', url: 'https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:52021PC0206', domain: 'eur-lex.europa.eu', icon: '🇪🇺' },
    { name: 'NIST AI RMF 1.0', url: 'https://www.nist.gov/itl/ai-risk-management-framework', domain: 'nist.gov', icon: '🏛️' },
    { name: 'India DPDP Act 2023', url: 'https://www.meity.gov.in/content/digital-personal-data-protection-act-2023', domain: 'meity.gov.in', icon: '🇮🇳' },
  ],
};

const SUGGESTIONS = [
  { icon: FileText, label: 'Run Meridian Strategy', text: 'Become an AI-first regional retailer within 3 years — improve margin, reduce stockouts, and personalize customer experience while managing labor costs.' },
  { icon: Lightbulb, label: 'Priority automation targets?', text: 'ask: What should we automate first and why?' },
  { icon: Briefcase, label: 'Workforce reskilling impact?', text: 'ask: Which roles change most with 6-class skill transitions?' },
  { icon: Shield, label: 'Regulatory compliance risks?', text: 'ask: What governance risks exist under EU AI Act and NIST?' },
];

/* ── CSS-in-JS tokens (Pure Deep Obsidian Black Theme) ─────────────── */
const t = {
  sidebarBg: '#050505',
  bg:        '#000000',
  surface:   '#121212',
  surface2:  '#1a1a1a',
  surface3:  '#242424',
  border:    '#1f1f1f',
  border2:   '#2a2a2a',
  text:      '#ffffff',
  text2:     '#a0a0a0',
  text3:     '#666666',
  accent:    '#0ea5e9',
  accentDim: 'rgba(14,165,233,0.15)',
  green:     '#22c55e',
  mono:      "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace",
  sans:      "'Inter', -apple-system, system-ui, sans-serif",
};

/* ═══════════════════════════════════════════════════════
   ThinkingBlock — Collapsible reasoning panel with Stop button
   ═══════════════════════════════════════════════════════ */
function ThinkingBlock({ steps, sources, duration, isLive, progress, progressLabel, onStop }: {
  steps: ThinkingStep[];
  sources?: Source[];
  duration?: number;
  isLive: boolean;
  progress?: number;
  progressLabel?: string;
  onStop?: () => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ marginBottom: 16 }}>
      {/* Toggle header row */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 13, fontWeight: 600, color: t.text3, fontFamily: t.sans,
          marginBottom: open ? 8 : 0,
          transition: 'color .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = t.text2)}
        onMouseLeave={e => (e.currentTarget.style.color = t.text3)}
      >
        {open
          ? <ChevronDown size={14} strokeWidth={2.5} />
          : <ChevronRight size={14} strokeWidth={2.5} />}
        {isLive
          ? <>Reasoning & Deep Researching…</>
          : <>Reasoned for {duration ?? '—'}s</>}
      </button>

      {open && (
        <div style={{
          borderLeft: `2px solid ${t.border2}`,
          paddingLeft: 16,
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {/* WHITE Progress Bar with Percentage */}
          {isLive && progress !== undefined && (
            <div style={{
              margin: '4px 0 10px',
              padding: '10px 14px',
              borderRadius: 10,
              backgroundColor: t.surface,
              border: `1px solid ${t.border}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>
                  {progressLabel || 'Deep Researching Enterprise Architecture…'}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: '#ffffff', fontFamily: t.mono }}>
                  {progress}%
                </span>
              </div>
              <div style={{ width: '100%', height: 5, borderRadius: 999, backgroundColor: '#222225', overflow: 'hidden' }}>
                <div style={{
                  width: `${progress}%`, height: '100%', borderRadius: 999,
                  backgroundColor: '#ffffff',
                  boxShadow: '0 0 12px rgba(255,255,255,0.8)',
                  transition: 'width 0.4s ease-out',
                }} />
              </div>
            </div>
          )}

          {/* Reasoning Steps */}
          {steps.map((s, i) => {
            const isLast = i === steps.length - 1;
            const isPulsing = !s.done && isLast && isLive;

            return (
              <div key={i} style={{
                fontSize: 13, lineHeight: 1.55, color: s.done ? t.text2 : t.text,
                fontFamily: t.sans, display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                {s.done ? (
                  <CheckCircle2 size={14} color={t.green} style={{ marginTop: 2, flexShrink: 0 }} />
                ) : isPulsing ? (
                  <span className="thinking-pulse-white" style={{ marginTop: 6, flexShrink: 0 }} />
                ) : (
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%',
                    backgroundColor: t.text3, marginTop: 6, flexShrink: 0,
                    display: 'inline-block'
                  }} />
                )}
                <span>{s.text}</span>
              </div>
            );
          })}

          {/* Dynamic Web Evidence Sources */}
          {sources && sources.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {sources.map(s => (
                <a
                  key={s.name}
                  href={s.url || `https://${s.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 999,
                    backgroundColor: t.surface, border: `1px solid ${t.border}`,
                    fontSize: 11.5, fontWeight: 600, color: t.text2,
                    textDecoration: 'none', transition: 'all .15s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#ffffff';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = t.border;
                    e.currentTarget.style.color = t.text2;
                  }}
                >
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${s.domain}&sz=32`}
                    alt="" style={{ width: 13, height: 13, borderRadius: 2 }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  {s.icon} {s.name}
                  <ExternalLink size={9} color={t.text3} />
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Dashboard — Transformation Intelligence (Pure Black Theme)
   ═══════════════════════════════════════════════════════ */
export function Dashboard() {
  const navigate = useNavigate();
  
  // Persistent active session ID
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => {
    return localStorage.getItem('ti_active_session_id') || `session-${Date.now()}`;
  });

  // Saved chat sessions history (Backend + Local sync)
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('ti_saved_sessions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'session-default', title: 'Meridian Retail Strategy', timestamp: Date.now() - 3600000, messages: [] },
    ];
  });

  // Persistent messages state
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const activeId = localStorage.getItem('ti_active_session_id');
      const savedSessions = localStorage.getItem('ti_saved_sessions');
      if (savedSessions && activeId) {
        const parsed: ChatSession[] = JSON.parse(savedSessions);
        const active = parsed.find(s => s.id === activeId);
        if (active && active.messages) return active.messages;
      }
      const rawActive = localStorage.getItem('ti_active_messages');
      return rawActive ? JSON.parse(rawActive) : [];
    } catch {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [hasGraph, setHasGraph] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const startTime = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [orgName, setOrgName] = useState(() => localStorage.getItem('org_name') || 'Transformation Retail Group');

  // Fetch chat sessions for current user from PostgreSQL backend API on mount
  useEffect(() => {
    const fetchBackendSessions = async () => {
      try {
        const userEmail = localStorage.getItem('user_email');
        const url = userEmail
          ? `http://localhost:8000/api/v1/chats?user_email=${encodeURIComponent(userEmail)}`
          : 'http://localhost:8000/api/v1/chats';

        const res = await fetch(url);
        if (res.ok) {
          const remoteSessions: ChatSession[] = await res.json();
          if (remoteSessions && remoteSessions.length > 0) {
            setSessions(remoteSessions);
            localStorage.setItem('ti_saved_sessions', JSON.stringify(remoteSessions));

            const activeId = localStorage.getItem('ti_active_session_id');
            const active = remoteSessions.find(s => s.id === activeId);
            if (active && active.messages && active.messages.length > 0) {
              setMessages(active.messages);
            }
          } else {
            // New user with no remote sessions: start fresh
            setSessions([]);
            setMessages([]);
            localStorage.removeItem('ti_saved_sessions');
            localStorage.removeItem('ti_active_messages');
            localStorage.removeItem('ti_active_session_id');
          }
        }
      } catch (e) {
        console.warn('Backend chat sync offline — using local storage');
      }
    };
    fetchBackendSessions();
  }, []);

  // Sync to PostgreSQL backend DB whenever active session or messages change
  const syncSessionToBackend = async (sessionId: string, title: string, msgs: Msg[]) => {
    try {
      await fetch('http://localhost:8000/api/v1/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sessionId,
          title: title,
          user_email: localStorage.getItem('user_email') || 'admin@meridianretail.com',
          messages: msgs,
        }),
      });
    } catch {
      /* skip */
    }
  };

  // Auto-save active chat messages to localStorage and active session
  useEffect(() => {
    try {
      localStorage.setItem('ti_active_messages', JSON.stringify(messages));
      localStorage.setItem('ti_active_session_id', currentSessionId);

      if (currentSessionId && messages.length > 0) {
        setSessions(prev => {
          const exists = prev.find(s => s.id === currentSessionId);
          let updated: ChatSession[];
          const firstMsgText = messages[0]?.text || 'Transformation Strategy';
          const title = exists ? exists.title : (firstMsgText.length > 34 ? firstMsgText.slice(0, 34) + '…' : firstMsgText);

          if (exists) {
            updated = prev.map(s => s.id === currentSessionId ? { ...s, messages, isExecuting: busy } : s);
          } else {
            updated = [{ id: currentSessionId, title, timestamp: Date.now(), messages, isExecuting: busy }, ...prev];
          }
          localStorage.setItem('ti_saved_sessions', JSON.stringify(updated));

          // Sync with PostgreSQL DB
          syncSessionToBackend(currentSessionId, title, messages);

          return updated;
        });
      }
    } catch { /* skip */ }
  }, [messages, currentSessionId, busy]);

  // Sync organization name dynamically & fetch from database on mount
  useEffect(() => {
    const fetchOrgFromBackend = async () => {
      try {
        const res = await fetch('http://localhost:8000/organisations/current');
        if (res.ok) {
          const org = await res.json();
          if (org.name) {
            localStorage.setItem('org_name', org.name);
            setOrgName(org.name);
          }
          if (org.industry) localStorage.setItem('org_industry', org.industry);
          if (org.description) localStorage.setItem('org_strategy', org.description);
          localStorage.setItem('setup_completed', 'true');
        }
      } catch {
        /* skip */
      }
    };
    fetchOrgFromBackend();

    const syncOrg = () => {
      setOrgName(localStorage.getItem('org_name') || 'Transformation Retail Group');
    };
    window.addEventListener('storage-update', syncOrg);
    window.addEventListener('storage', syncOrg);
    return () => {
      window.removeEventListener('storage-update', syncOrg);
      window.removeEventListener('storage', syncOrg);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy]);

  /* ── Stop Generation Handler ──────────────────────── */
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setBusy(false);

    // Mark current session as not executing
    setSessions(prev => {
      const updated = prev.map(s => s.id === currentSessionId ? { ...s, isExecuting: false } : s);
      localStorage.setItem('ti_saved_sessions', JSON.stringify(updated));
      return updated;
    });

    // Mark current AI thinking step as stopped
    setMessages(prev => prev.map(m => {
      if (m.role === 'ai' && !m.thinkingDuration) {
        return {
          ...m,
          progress: 100,
          text: (m.text || '') + '\n\n*Generation stopped by user.*',
          thinkingDuration: Math.round((Date.now() - startTime.current) / 1000),
          thinking: m.thinking?.map(s => ({ ...s, done: true })),
        };
      }
      return m;
    }));
  };

  /* ── Start New Chat ──────────────────────────────── */
  const startNewChat = () => {
    if (busy) stopGeneration();
    const newId = `session-${Date.now()}`;
    setMessages([]);
    setInput('');
    setCurrentSessionId(newId);
    localStorage.setItem('ti_active_session_id', newId);
    localStorage.removeItem('ti_active_messages');
  };

  /* ── Load Past Chat Session ──────────────────────── */
  const loadSession = (session: ChatSession) => {
    if (busy) stopGeneration();
    setMessages(session.messages || []);
    setCurrentSessionId(session.id);
    localStorage.setItem('ti_active_session_id', session.id);
    localStorage.setItem('ti_active_messages', JSON.stringify(session.messages || []));
  };

  /* ── Send handler ─────────────────────────────────── */
  const send = async (override?: string) => {
    const raw = override ?? input;
    if (!raw.trim() || busy) return;
    if (!override) setInput('');

    const uid  = `u-${Date.now()}`;
    const aid  = `a-${Date.now()}`;
    const isQ  = /^(ask:|query:)|simulate|what if|which|how to|budget|\?$/i.test(raw.toLowerCase());

    // Instant session title creation & entry into Recent Runs list
    const sessionTitle = raw.length > 34 ? raw.slice(0, 34) + '…' : raw;
    const activeId = currentSessionId || `session-${Date.now()}`;
    if (currentSessionId !== activeId) setCurrentSessionId(activeId);

    setSessions(prev => {
      const exists = prev.find(s => s.id === activeId);
      let updated: ChatSession[];
      if (exists) {
        updated = prev.map(s => s.id === activeId ? { ...s, title: sessionTitle, isExecuting: true } : s);
      } else {
        updated = [{ id: activeId, title: sessionTitle, timestamp: Date.now(), messages: [], isExecuting: true }, ...prev];
      }
      localStorage.setItem('ti_saved_sessions', JSON.stringify(updated));
      return updated;
    });

    setMessages(p => [...p, { id: uid, role: 'user', text: raw }]);
    setBusy(true);
    startTime.current = Date.now();
    abortControllerRef.current = new AbortController();

    // Seed assistant skeleton
    const initThinking: ThinkingStep[] = isQ
      ? [{ text: 'Parsing executive query & traversing multi-hop graph…', done: false }]
      : [
          { text: 'Parsing strategy statement & initializing 5-agent pipeline…', done: false },
        ];

    setMessages(p => [...p, {
      id: aid, role: 'ai',
      text: isQ ? 'Traversing enterprise digital twin graph...' : 'Deep Researching enterprise transformation intent & regulatory requirements...',
      progress: 5,
      progressLabel: 'Initializing 5-Agent Execution Pipeline…',
      thinking: initThinking,
      sources: [],
    }]);

    const updateAi = (fn: (m: Msg) => Msg) =>
      setMessages(p => p.map(m => m.id === aid ? fn(m) : m));

    const pushStepProgress = (text: string, nodeName?: string, progressPct?: number, progressLbl?: string, textSummary?: string) => {
      updateAi(m => {
        const existingSources = m.sources ?? [];
        const newSources = nodeName && SOURCES_MAP[nodeName] ? SOURCES_MAP[nodeName] : [];
        const combinedSources = [...existingSources];
        
        for (const ns of newSources) {
          if (!combinedSources.some(s => s.name === ns.name)) {
            combinedSources.push(ns);
          }
        }

        return {
          ...m,
          progress: progressPct ?? m.progress,
          progressLabel: progressLbl ?? m.progressLabel,
          text: textSummary ?? m.text,
          sources: combinedSources,
          thinking: [...(m.thinking ?? []).map(s => ({ ...s, done: true })), { text, done: false }],
        };
      });
    };

    /* ── Query path ───────────────────────────────── */
    if (isQ) {
      try {
        pushStepProgress('Traversing NetworkX multi-hop dependency graph…', undefined, 50, 'Traversing Graph Nodes…');
        const r = await fetch('http://localhost:8000/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: raw }),
          signal: abortControllerRef.current.signal,
        });
        const d = await r.json();
        const dur = Math.round((Date.now() - startTime.current) / 1000);
        updateAi(m => ({
          ...m,
          progress: 100,
          text: d.answer ?? 'Traversal completed.',
          thinking: m.thinking?.map(s => ({ ...s, done: true })),
          thinkingDuration: dur,
        }));
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          updateAi(m => ({
            ...m,
            text: '⚠️ Backend error — ensure API is running on port 8000.',
            thinking: m.thinking?.map(s => ({ ...s, done: true })),
            thinkingDuration: Math.round((Date.now() - startTime.current) / 1000),
          }));
        }
      } finally {
        setBusy(false);
        setSessions(prev => {
          const updated = prev.map(s => s.id === activeId ? { ...s, isExecuting: false } : s);
          localStorage.setItem('ti_saved_sessions', JSON.stringify(updated));
          return updated;
        });
      }
      return;
    }

    /* ── Pipeline streaming path ──────────────────── */
    try {
      const res = await fetch(
        `http://localhost:8000/ingest/strategy/stream?statement=${encodeURIComponent(raw)}`,
        { signal: abortControllerRef.current.signal }
      );
      if (!res.body) throw new Error('No stream');

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop() || '';

        for (const ln of lines) {
          const clean = ln.replace(/^data:\s*/, '').trim();
          if (!clean) continue;
          try {
            const ev = JSON.parse(clean);

            if (ev.event === 'node_complete') {
              const stepLabels: Record<string, string> = {
                strategy:         'Drafting 6 value chain stages & strategic transformation initiatives',
                persist_strategy: 'Persisting value chain stages into PostgreSQL relational store',
                process:          'Mapping operational processes, activities & AI automation opportunities',
                role:             'Analyzing workforce roles & 6-class skill reskilling transitions',
                governance:       'Conducting 10-area regulatory governance audit under EU AI Act & NIST RMF',
                commit:           'Building NetworkX dependency graph & committing transaction',
              };

              const progressMap: Record<string, { pct: number; label: string; text: string }> = {
                strategy: {
                  pct: 16,
                  label: 'Deep Researching: Value Chain & Strategy Synthesis…',
                  text: 'Deep Researching value chain stages and synthesizing transformation intent across enterprise operations…'
                },
                persist_strategy: {
                  pct: 33,
                  label: 'Persisting Relational Store…',
                  text: 'Persisting value chain stages and strategic objectives into PostgreSQL relational model…'
                },
                process: {
                  pct: 50,
                  label: 'Deep Researching: Process & AI Automation Targets…',
                  text: 'Mapping operational processes, sequential activities, and identifying high-impact AI automation opportunities…'
                },
                role: {
                  pct: 66,
                  label: 'Deep Researching: Workforce & 6-Class Skill Transitions…',
                  text: 'Evaluating 11 workforce roles across 6-class skill transitions (emerging, AI-augmented, and declining skills)…'
                },
                governance: {
                  pct: 83,
                  label: 'Deep Researching: EU AI Act, NIST & DPDP Governance Matrix…',
                  text: 'Conducting 10-area regulatory compliance audit with legal citations under EU AI Act, NIST AI RMF, and India DPDP Act 2023…'
                },
                commit: {
                  pct: 95,
                  label: 'Assembling NetworkX Multi-Hop Graph…',
                  text: 'Building NetworkX multi-hop dependency graph and committing full Digital Twin graph transaction…'
                },
              };

              const info = progressMap[ev.node] || { pct: ev.progress || 50, label: 'Processing Digital Twin…', text: `Processing ${ev.node}...` };
              const stepText = stepLabels[ev.node] ?? ev.label ?? `Completed ${ev.node}`;

              // Push main step + granular detail sub-steps from backend
              pushStepProgress(stepText, ev.node, info.pct, info.label, info.text);

              // Update the AI body text with concise detail context
              const details: string[] = ev.details || [];
              if (details.length > 0) {
                updateAi(m => ({
                  ...m,
                  text: details.join('\n'),
                }));
              }
            }

            if (ev.event === 'complete') {
              // Fetch full graph state
              const sr = await fetch('http://localhost:8000/graph/state');
              if (sr.ok) {
                const gd = await sr.json();
                setHasGraph(true);
                window.dispatchEvent(new CustomEvent('graph-update', { detail: gd }));
              }

              const dur = Math.round((Date.now() - startTime.current) / 1000);
              const sc = ev.summary ?? {};
              const txt = [
                `Your enterprise digital twin has been synthesized.`,
                ``,
                `**Created entities:**`,
                `- ${sc.value_chain_stages_count ?? 6} Value Chain Stages with core processes & sequential activities`,
                `- ${sc.processes_count ?? 5} Processes mapped to AI automation opportunities`,
                `- 11 Roles with 6-class skill transitions (emerging → ai_augmented → declining)`,
                `- 10-area governance audit findings citing EU AI Act, NIST AI RMF 1.0, and India DPDP Act 2023`,
                `- ${sc.initiatives_count ?? 4} Strategic transformation initiatives with NetworkX dependency edges`,
                ``,
                `All entities are persisted in PostgreSQL and indexed in the Qdrant vector store.`,
              ].join('\n');
              updateAi(m => ({
                ...m,
                progress: 100,
                text: txt,
                thinkingDuration: dur,
                showGraph: true,
                thinking: m.thinking?.map(s => ({ ...s, done: true })),
              }));
            }
            if (ev.event === 'error') {
              const dur = Math.round((Date.now() - startTime.current) / 1000);
              updateAi(m => ({
                ...m,
                progress: 100,
                progressLabel: 'Pipeline Execution Failed',
                text: (m.text || '') + `\n\n**Pipeline Error:** ${ev.detail || 'Unknown backend error.'}`,
                thinkingDuration: dur,
                thinking: m.thinking?.map(s => ({ ...s, done: true })),
              }));
              break;
            }
          } catch { /* skip non-json */ }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        updateAi(m => ({
          ...m,
          text: '⚠️ Stream error — ensure Docker containers are running.',
          thinking: m.thinking?.map(s => ({ ...s, done: true })),
          thinkingDuration: Math.round((Date.now() - startTime.current) / 1000),
        }));
      }
    } finally {
      setBusy(false);
      setSessions(prev => {
        const updated = prev.map(s => s.id === activeId ? { ...s, isExecuting: false } : s);
        localStorage.setItem('ti_saved_sessions', JSON.stringify(updated));
        return updated;
      });
    }
  };

  /* ── Render ─────────────────────────────────────── */
  const empty = messages.length === 0;

  return (
    <>
      {/* keyframes & smooth transitions */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .spin-loader {
          animation: spin 1s linear infinite;
        }
        @keyframes tpulseWhite {
          0%, 100% { opacity: .25; }
          50% { opacity: 1; }
        }
        .thinking-pulse-white {
          display: inline-block; width: 7px; height: 7px;
          border-radius: 50%; background: #ffffff;
          box-shadow: 0 0 8px rgba(255,255,255,0.9);
          animation: tpulseWhite 1.3s ease-in-out infinite;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .msg-enter { animation: fadeUp .35s cubic-bezier(.16,1,.3,1) both; }
        ::placeholder { color: ${t.text3}; }
        input:focus { outline: none; }
        .graph-cta:hover { background: ${t.accent} !important; color: #fff !important; }
        .sidebar-smooth {
          transition: width 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-btn:hover { background: #1a1a1a !important; color: #fff !important; }
        .sug-card:hover { border-color: #0ea5e9 !important; background: #121212 !important; }
      `}</style>

      <div style={{
        display: 'flex',
        height: '100vh', width: '100vw',
        backgroundColor: t.bg, color: t.text,
        fontFamily: t.sans, overflow: 'hidden',
      }}>

        {/* ═══════════════════════════════════════════════════════
           LEFT SIDEBAR — Pure Deep Black Theme & App Name
           ═══════════════════════════════════════════════════════ */}
        <aside
          className="sidebar-smooth"
          style={{
            width: sidebarOpen ? 260 : 0,
            opacity: sidebarOpen ? 1 : 0,
            overflow: 'hidden',
            backgroundColor: t.sidebarBg,
            borderRight: sidebarOpen ? `1px solid ${t.border}` : 'none',
            display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', padding: sidebarOpen ? '16px 14px' : '16px 0',
            boxSizing: 'border-box', flexShrink: 0, zIndex: 60,
          }}
        >
          {sidebarOpen && (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
                {/* Brand Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '0 4px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Sparkles size={16} color="#fff" />
                    </div>
                    <div>
                      <span style={{ fontSize: 14, fontWeight: 800, color: t.text, letterSpacing: '-0.02em', display: 'block' }}>
                        Transformation Intelligence
                      </span>
                      <span style={{ fontSize: 10.5, color: t.text3, display: 'block', fontWeight: 600 }}>
                        {orgName}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      all: 'unset', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 28, height: 28, borderRadius: 8, color: t.text2,
                      backgroundColor: 'transparent',
                    }}
                    className="nav-btn"
                    title="Close Sidebar"
                  >
                    <PanelLeft size={17} />
                  </button>
                </div>

                {/* New Strategic Session Action */}
                <button
                  onClick={startNewChat}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    backgroundColor: t.surface, border: `1px solid ${t.border}`,
                    fontSize: 13.5, fontWeight: 700, color: t.text,
                    boxSizing: 'border-box', marginBottom: 20, flexShrink: 0,
                    transition: 'all .15s',
                  }}
                  className="nav-btn"
                >
                  <Plus size={16} color={t.accent} />
                  <span>New Strategic Session</span>
                </button>

                {/* Workspace Navigation */}
                <div style={{ fontSize: 11, fontWeight: 800, color: t.text3, padding: '0 8px', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>
                  Digital Twin Platform
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 24, flexShrink: 0 }}>
                  <button
                    onClick={() => setPipelineOpen(true)}
                    style={{
                      all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 8, fontSize: 13, color: t.text, fontWeight: 600,
                    }}
                    className="nav-btn"
                  >
                    <Layers size={16} color={t.accent} />
                    <span>5-Agent Pipeline</span>
                  </button>

                  <button
                    onClick={() => setGraphOpen(true)}
                    style={{
                      all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 8, fontSize: 13, color: t.text2, fontWeight: 500,
                    }}
                    className="nav-btn"
                  >
                    <Network size={16} color="#8b5cf6" />
                    <span>Knowledge Graph</span>
                  </button>

                  <button
                    onClick={() => navigate('/profile?tab=vector')}
                    style={{
                      all: 'unset', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 8, fontSize: 13, color: t.text2, fontWeight: 500,
                    }}
                    className="nav-btn"
                  >
                    <Database size={16} color="#22c55e" />
                    <span>Qdrant Document Ingestion</span>
                  </button>
                </div>

                {/* History Session Links */}
                <div style={{ fontSize: 11, fontWeight: 800, color: t.text3, padding: '0 8px', marginBottom: 8, letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0 }}>
                  Recent Runs
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 4 }}>
                  {sessions.map(s => {
                    const isSelected = currentSessionId === s.id;
                    const isRunningNow = s.isExecuting || (isSelected && busy);

                    return (
                      <div
                        key={s.id}
                        onClick={() => loadSession(s)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '8px 10px', borderRadius: 8, fontSize: 13,
                          color: isSelected ? '#ffffff' : t.text2,
                          backgroundColor: isSelected ? '#18181b' : 'transparent',
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                        className="nav-btn"
                      >
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, paddingRight: 6 }}>
                          {s.title}
                        </span>

                        {/* Spinner next to executing chat */}
                        {isRunningNow && (
                          <Loader2 size={13} className="spin-loader" color="#0ea5e9" style={{ flexShrink: 0 }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sidebar Bottom: User Profile & Qdrant Knowledge Vault */}
              <div style={{ borderTop: `1px solid ${t.border}`, paddingTop: 14 }}>
                <div
                  onClick={() => navigate('/profile')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                    backgroundColor: t.surface, border: `1px solid ${t.border}`,
                    transition: 'all 0.15s',
                  }}
                  className="nav-btn"
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 8,
                    backgroundColor: t.accentDim, color: t.accent,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 13,
                  }}>
                    EA
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: t.text, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Profile & Vault
                    </div>
                    <div style={{ fontSize: 11, color: t.text3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {orgName}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </aside>

        {/* ═══════════════════════════════════════════════════════
           MAIN CHAT CANVAS — Pure Black Obsidian Interface
           ═══════════════════════════════════════════════════════ */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', maxHeight: '100vh', overflow: 'hidden', position: 'relative' }}>

          {/* ── Top Bar Header (Cleaned up) ───────────────────────────────── */}
          <header style={{
            height: 54, padding: '0 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderBottom: `1px solid ${t.border}`,
            backgroundColor: t.bg, zIndex: 40,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {!sidebarOpen && (
                <button
                  onClick={() => setSidebarOpen(true)}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    width: 32, height: 32, borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: t.surface, border: `1px solid ${t.border}`,
                    color: t.text2, transition: 'all .15s',
                  }}
                  className="nav-btn"
                  title="Open Sidebar"
                >
                  <PanelLeft size={18} />
                </button>
              )}

              <span style={{ fontSize: 15, fontWeight: 800, color: t.text, letterSpacing: '-0.02em' }}>
                Transformation Intelligence
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {hasGraph && (
                <button
                  onClick={() => setGraphOpen(true)}
                  style={{
                    all: 'unset', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 13, fontWeight: 700, color: t.accent,
                    padding: '6px 16px', borderRadius: 999,
                    border: `1px solid ${t.accent}`,
                    backgroundColor: t.accentDim,
                    transition: 'all .15s',
                  }}
                >
                  <Network size={15} /> Knowledge Graph
                </button>
              )}
            </div>
          </header>

          {/* ── Scrollable Message & Input Area ─────────────── */}
          <div ref={scrollRef} style={{
            flex: 1, minHeight: 0, height: 'calc(100vh - 54px)', maxHeight: 'calc(100vh - 54px)',
            overflowY: 'auto', overflowX: 'hidden',
            paddingBottom: 220, boxSizing: 'border-box',
          }}>

            {/* ═══════════════════════════════════════════════════════
               EMPTY STATE — Pure Obsidian Dark Mode
               ═══════════════════════════════════════════════════════ */}
            {empty && (
              <div style={{
                minHeight: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                maxWidth: 720, width: '100%', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box',
              }}>
                <h1 style={{
                  fontSize: 34, fontWeight: 800, color: t.text,
                  letterSpacing: '-0.03em', margin: '0 0 12px', textAlign: 'center',
                }}>
                  What shall we transform?
                </h1>
                <p style={{ fontSize: 15, color: t.text2, margin: '0 0 36px', textAlign: 'center' }}>
                  Synthesize an enterprise digital twin for <strong style={{ color: t.text }}>{orgName}</strong> or run multi-hop graph queries.
                </p>

                {/* Pill Input Box in Center */}
                <form
                  onSubmit={e => { e.preventDefault(); send(); }}
                  style={{
                    width: '100%', maxWidth: 680,
                    display: 'flex', alignItems: 'center', gap: 12,
                    backgroundColor: t.surface, border: `1px solid ${t.border}`,
                    borderRadius: 999, padding: '8px 12px 8px 20px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
                    marginBottom: 36, boxSizing: 'border-box',
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Enter strategic intent or ask an executive question…"
                    disabled={busy}
                    style={{
                      flex: 1, border: 'none', background: 'transparent',
                      fontSize: 15, color: t.text, padding: '8px 0',
                      fontFamily: t.sans, outline: 'none',
                    }}
                  />

                  {/* Send or ChatGPT Stop Button */}
                  {busy ? (
                    <button
                      type="button"
                      onClick={stopGeneration}
                      style={{
                        all: 'unset', cursor: 'pointer',
                        width: 36, height: 36, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: '#ffffff', color: '#000000',
                        transition: 'all .15s',
                      }}
                      title="Stop generating"
                    >
                      <Square size={13} fill="#000000" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      style={{
                        all: 'unset', cursor: input.trim() ? 'pointer' : 'not-allowed',
                        width: 36, height: 36, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: input.trim() ? t.accent : t.surface2,
                        color: '#ffffff', transition: 'all .15s',
                      }}
                    >
                      <ArrowRight size={16} />
                    </button>
                  )}
                </form>

                {/* Suggestion Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, width: '100%', maxWidth: 680 }}>
                  {SUGGESTIONS.map((s, idx) => {
                    const IconComp = s.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => send(s.text)}
                        className="sug-card"
                        style={{
                          padding: '16px 18px', borderRadius: 14,
                          backgroundColor: t.surface, border: `1px solid ${t.border}`,
                          cursor: 'pointer', transition: 'all 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <IconComp size={16} color={t.accent} />
                          <span style={{ fontSize: 13.5, fontWeight: 700, color: t.text }}>
                            {s.label}
                          </span>
                        </div>
                        <div style={{ fontSize: 12, color: t.text3, lineHeight: 1.45 }}>
                          {s.text.length > 74 ? s.text.slice(0, 74) + '…' : s.text}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════
               MESSAGES FEED
               ═══════════════════════════════════════════════════════ */}
            {!empty && (
              <div style={{ width: '100%', maxWidth: 880, margin: '0 auto', padding: '28px 24px 0', boxSizing: 'border-box' }}>
                {messages.map(m => (
                  <div key={m.id} className="msg-enter" style={{ marginBottom: 32 }}>

                    {/* USER */}
                    {m.role === 'user' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{
                          backgroundColor: t.surface2, border: `1px solid ${t.border2}`,
                          borderRadius: 20, borderBottomRightRadius: 4,
                          padding: '12px 20px', maxWidth: '82%',
                          fontSize: 14.5, lineHeight: 1.6, fontWeight: 500, color: t.text,
                        }}>
                          {m.text}
                        </div>
                      </div>
                    )}

                    {/* AI */}
                    {m.role === 'ai' && (
                      <div style={{ width: '100%' }}>
                        {/* Thinking block with progress bar */}
                        {m.thinking && m.thinking.length > 0 && (
                          <ThinkingBlock
                            steps={m.thinking}
                            sources={m.sources}
                            duration={m.thinkingDuration}
                            isLive={!m.thinkingDuration}
                            progress={m.progress}
                            progressLabel={m.progressLabel}
                            onStop={stopGeneration}
                          />
                        )}

                        {/* Body text — renders markdown bold, italic, and bullets */}
                        {m.text && (
                          <div style={{
                            fontSize: 14.5, lineHeight: 1.7, color: t.text,
                            wordBreak: 'break-word',
                          }}>
                            {m.text.split('\n').map((line, li) => {
                              const isBullet = line.trimStart().startsWith('- ');
                              const lineContent = isBullet ? line.trimStart().slice(2) : line;

                              // Render inline markdown: **bold** and *italic*
                              const renderInline = (text: string) =>
                                text.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((seg, i) => {
                                  if (seg.startsWith('**') && seg.endsWith('**'))
                                    return <strong key={i} style={{ fontWeight: 700 }}>{seg.slice(2, -2)}</strong>;
                                  if (seg.startsWith('*') && seg.endsWith('*') && seg.length > 2)
                                    return <em key={i} style={{ fontStyle: 'italic', color: t.text2 }}>{seg.slice(1, -1)}</em>;
                                  return <span key={i}>{seg}</span>;
                                });

                              if (isBullet) {
                                return (
                                  <div key={li} style={{ display: 'flex', gap: 8, paddingLeft: 4, marginBottom: 2 }}>
                                    <span style={{ color: t.accent, fontWeight: 700, flexShrink: 0 }}>•</span>
                                    <span>{renderInline(lineContent)}</span>
                                  </div>
                                );
                              }

                              if (line.trim() === '') return <div key={li} style={{ height: 8 }} />;

                              return <div key={li}>{renderInline(line)}</div>;
                            })}
                          </div>
                        )}

                        {/* Graph CTA */}
                        {m.showGraph && (
                          <button
                            className="graph-cta"
                            onClick={() => setGraphOpen(true)}
                            style={{
                              all: 'unset', cursor: 'pointer',
                              display: 'inline-flex', alignItems: 'center', gap: 8,
                              marginTop: 20, padding: '10px 22px',
                              borderRadius: 12, fontSize: 14, fontWeight: 700,
                              color: t.accent, backgroundColor: t.accentDim,
                              border: `1px solid ${t.accent}`,
                              transition: 'all .15s',
                            }}
                          >
                            <Network size={16} />
                            Explore Knowledge Graph
                            <ArrowRight size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Fixed Bottom Input Bar (when chat is active) ────── */}
          {!empty && (
            <div style={{
              position: 'fixed', bottom: 0, right: 0, left: sidebarOpen ? 260 : 0,
              display: 'flex', justifyContent: 'center',
              padding: '16px 24px 24px',
              background: `linear-gradient(transparent, ${t.bg} 50%)`,
              pointerEvents: 'none', zIndex: 40,
              transition: 'left 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
              <form
                onSubmit={e => { e.preventDefault(); send(); }}
                style={{
                  pointerEvents: 'auto',
                  width: '100%', maxWidth: 760,
                  display: 'flex', alignItems: 'center', gap: 10,
                  backgroundColor: t.surface,
                  border: `1px solid ${t.border}`,
                  borderRadius: 999, padding: '6px 10px 6px 20px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Enter strategy or ask a question…"
                  disabled={busy}
                  style={{
                    flex: 1, border: 'none', background: 'transparent',
                    fontSize: 14.5, color: t.text, padding: '10px 0',
                    fontFamily: t.sans, outline: 'none',
                  }}
                />

                {/* Send or ChatGPT Stop Button */}
                {busy ? (
                  <button
                    type="button"
                    onClick={stopGeneration}
                    style={{
                      all: 'unset', cursor: 'pointer',
                      width: 36, height: 36, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: '#ffffff', color: '#000000',
                      transition: 'all .15s',
                    }}
                    title="Stop generating"
                  >
                    <Square size={13} fill="#000000" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    style={{
                      all: 'unset', cursor: input.trim() ? 'pointer' : 'not-allowed',
                      width: 36, height: 36, borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: input.trim() ? t.accent : t.surface2,
                      color: '#ffffff', transition: 'all .15s',
                    }}
                  >
                    <ArrowRight size={16} />
                  </button>
                )}
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ─── n8n-STYLE 5-AGENT REACTFLOW GRAPH WORKSPACE ─────────────── */}
      {pipelineOpen && (
        <ReactFlowProvider>
          <PipelineFlowView
            onClose={() => setPipelineOpen(false)}
            onExecute={() => {
              setPipelineOpen(false);
              send('Synthesize 5-Agent Digital Twin Pipeline: 1) Strategy, 2) Operational Processes, 3) Workforce & 6-Class Skills, 4) Regulatory Governance, 5) NetworkX Graph.');
            }}
          />
        </ReactFlowProvider>
      )}

      {/* ─── Graph Fullscreen Overlay ──────────────── */}
      {graphOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            height: 54, borderBottom: '1px solid #e2e8f0',
            padding: '0 24px', display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Network size={18} color="#4f46e5" />
              <span style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                Digital Twin Knowledge Graph
              </span>
            </div>
            <button
              onClick={() => setGraphOpen(false)}
              style={{
                all: 'unset', cursor: 'pointer',
                width: 32, height: 32, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1',
                color: '#334155', transition: 'all .15s',
              }}
            >
              <X size={18} />
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <ReactFlowProvider>
              <GraphView />
            </ReactFlowProvider>
          </div>
        </div>
      )}
    </>
  );
}
