import React, { useState, useRef } from 'react';
import { Send, Bot, Brain, Search, PlayCircle, RefreshCw, Zap, ShieldCheck, Settings } from 'lucide-react';
import { AgentExecutionStream, type ExecutionStep } from './AgentExecutionStream';
import { API_URL } from '../config';


interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  title?: string;
  content: string | React.ReactNode;
  agentId?: string;
  isWarning?: boolean;
  isSuccess?: boolean;
}

const INITIAL_STEPS: ExecutionStep[] = [
  {
    id: 'step-1',
    step: 1,
    node: 'strategy',
    label: 'Agent 1: Value Chain Stages & Strategic Initiatives',
    progress: 16,
    status: 'pending',
    timestamp: '00:01s',
    detailMsg: 'Decomposing strategy into 6 core value chain stages & high-ROI initiatives.'
  },
  {
    id: 'step-2',
    step: 2,
    node: 'persist_strategy',
    label: 'Database Engine: Writing Value Chain Stages to PostgreSQL',
    progress: 33,
    status: 'pending',
    timestamp: '00:03s',
    detailMsg: 'Creating relational stage records and strategic intent mappings.'
  },
  {
    id: 'step-3',
    step: 3,
    node: 'process',
    label: 'Agent 2: Mapping Processes & Qdrant Evidence Search',
    progress: 50,
    status: 'pending',
    timestamp: '00:06s',
    detailMsg: 'Identifying operational bottlenecks, key activities & AI opportunities.'
  },
  {
    id: 'step-4',
    step: 4,
    node: 'role',
    label: 'Agent 3: Defining Roles & 6-Class Skill Reskilling Matrix',
    progress: 66,
    status: 'pending',
    timestamp: '00:09s',
    detailMsg: 'Mapping emerging, ai_augmented, changing, and declining skill transitions.'
  },
  {
    id: 'step-5',
    step: 5,
    node: 'governance',
    label: 'Agent 4: 10-Area Risk Audit & Regulatory Citations',
    progress: 83,
    status: 'pending',
    timestamp: '00:12s',
    detailMsg: 'Auditing against EU AI Act, NIST AI RMF 1.0, and India DPDP Act 2023.'
  },
  {
    id: 'step-6',
    step: 6,
    node: 'commit',
    label: 'NetworkX Engine: Synthesizing Graph Topology & Dependency Edges',
    progress: 100,
    status: 'pending',
    timestamp: '00:15s',
    detailMsg: 'Building multi-hop BFS graph structure and committing transaction.'
  }
];

export function Sidebar() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Enterprise Digital Twin Engine Ready. Enter strategic directives or type "ask: [scenario]" to trigger graph reasoning.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamingPipeline, setIsStreamingPipeline] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [activeLabel, setActiveLabel] = useState('');
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>(INITIAL_STEPS);
  const [isFinished, setIsFinished] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, executionSteps, isStreamingPipeline]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const currentInput = input;
    setInput('');

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: currentInput };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const lower = currentInput.toLowerCase();
    const isQueryOrSim = lower.startsWith('ask:') || 
      lower.startsWith('query:') || 
      lower.includes('simulate') || 
      lower.includes('what if') || 
      lower.includes('what to') || 
      lower.includes('which') || 
      lower.includes('budget') || 
      lower.endsWith('?');

    if (isQueryOrSim) {
      // Execute Executive Query / Simulation Endpoint
      try {
        const res = await fetch(`${API_URL}/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: currentInput }),
        });
        const data = await res.json();
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'agent',
          title: 'Agent 5: Executive Query & NetworkX Graph Reasoning',
          content: data.answer || 'Query processed.'
        }]);
      } catch (err) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'system',
          isWarning: true,
          content: '⚠️ Backend query error. Ensure API server is running on port 8000.'
        }]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Ingestion Streaming Pipeline Mode
    setIsStreamingPipeline(true);
    setIsFinished(false);
    setCurrentProgress(5);
    setActiveLabel('Agent 1: Ingesting Executive Strategy & Setting Direction...');
    
    // Reset steps state
    const resetSteps = INITIAL_STEPS.map((s, idx) => ({
      ...s,
      status: idx === 0 ? 'running' : 'pending',
    })) as ExecutionStep[];
    setExecutionSteps(resetSteps);

    try {
      const response = await fetch(`${API_URL}/ingest/strategy/stream?statement=${encodeURIComponent(currentInput)}`);
      if (!response.body) throw new Error('ReadableStream not supported.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanLine = line.replace(/^data:\s*/, '').trim();
          if (!cleanLine) continue;
          try {
            const parsed = JSON.parse(cleanLine);
            
            if (parsed.event === 'node_complete') {
              const nodeName = parsed.node;
              const progress = parsed.progress;
              const label = parsed.label;

              setCurrentProgress(progress);
              setActiveLabel(label);

              setExecutionSteps(prev => prev.map(step => {
                if (step.node === nodeName) {
                  return { ...step, status: 'completed' };
                }
                if (parsed.step && step.step === parsed.step + 1) {
                  return { ...step, status: 'running' };
                }
                return step;
              }));
            }

            if (parsed.event === 'complete') {
              setCurrentProgress(100);
              setActiveLabel('Enterprise Digital Twin Pipeline Completed Successfully!');
              setIsFinished(true);

              setExecutionSteps(prev => prev.map(s => ({ ...s, status: 'completed' })));

              // Fetch updated graph state from database
              const fullStateRes = await fetch(`${API_URL}/graph/state`);
              if (fullStateRes.ok) {
                const fullStateData = await fullStateRes.json();
                window.dispatchEvent(new CustomEvent('graph-update', { detail: fullStateData }));
              }

              setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'system',
                isSuccess: true,
                content: `✅ Transformation Digital Twin Synthesized! Created ${parsed.summary?.value_chain_stages_count || 6} Value Chain Stages, ${parsed.summary?.processes_count || 5} Processes, and ${parsed.summary?.initiatives_count || 4} Initiatives in PostgreSQL.`
              }]);
            }
          } catch (e) {
            console.error('SSE JSON parse note:', e);
          }
        }
      }
    } catch (err) {
      console.error('Streaming connection error:', err);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'system',
        isWarning: true,
        content: '⚠️ Stream connection closed. Please ensure Docker container modus-api is running on port 8000.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const [apiKey, setApiKey] = useState(localStorage.getItem('llm_api_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [showSettings, setShowSettings] = useState(!localStorage.getItem('llm_api_key'));

  // Sync API Key to localStorage when updated from sidebar
  React.useEffect(() => {
    if (apiKey) {
      localStorage.setItem('llm_api_key', apiKey);
    } else {
      localStorage.removeItem('llm_api_key');
    }
  }, [apiKey]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '440px', minWidth: '400px', flexShrink: 0, backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#f8fafc' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#2563eb', borderRadius: '8px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={18} color="#ffffff" />
            </div>
            <div>
              <h2 style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0f172a', margin: 0, lineHeight: 1.2 }}>Transformation AI Engine</h2>
              <span style={{ fontSize: '0.71875rem', color: '#64748b', fontWeight: 600 }}>Multi-Agent Strategy & Digital Twin</span>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#e2e8f0'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Settings size={16} />
            {showSettings ? 'Close' : 'API Settings'}
          </button>
        </div>

        {/* API Key Input */}
        {showSettings && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
            <label style={{ fontSize: '0.71875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              OpenAI / Groq API Key
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                style={{ flex: 1, padding: '6px 10px', fontSize: '0.8125rem', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                style={{ padding: '6px 10px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Sample Strategy Prompts */}
      <div style={{ padding: '10px 16px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', gap: '8px', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        <button
          onClick={() => { setInput('Become an AI-first regional retailer within 3 years — improve margin, reduce stockouts, and personalize customer experience while managing labor costs.'); }}
          style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.71875rem', color: '#334155', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Zap size={12} color="#2563eb" /> Load Meridian Strategy
        </button>
        <button
          onClick={() => { setInput('ask: What should Meridian transform first and why?'); }}
          style={{ padding: '4px 10px', borderRadius: '9999px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.71875rem', color: '#334155', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Search size={12} color="#2563eb" /> Executive Q&A Target
        </button>
      </div>

      {/* Main Messages & Execution Stream Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Render Intermediate Agent Execution Stream Box if pipeline is active */}
        {isStreamingPipeline && (
          <AgentExecutionStream
            steps={executionSteps}
            currentProgress={currentProgress}
            activeLabel={activeLabel}
            isFinished={isFinished}
          />
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: msg.role === 'user' ? '85%' : '100%',
              backgroundColor: msg.role === 'user' ? '#2563eb' : msg.isSuccess ? '#f0fdf4' : msg.isWarning ? '#fff1f2' : '#ffffff',
              color: msg.role === 'user' ? '#ffffff' : msg.isSuccess ? '#166534' : msg.isWarning ? '#991b1b' : '#0f172a',
              border: msg.role === 'user' ? 'none' : msg.isSuccess ? '1px solid #bbf7d0' : msg.isWarning ? '1px solid #fecdd3' : '1px solid #e2e8f0',
              borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '12px',
              padding: '12px 14px',
              boxShadow: msg.role === 'user' ? '0 2px 4px rgba(37,99,235,0.2)' : '0 1px 3px rgba(0,0,0,0.05)'
            }}
          >
            {msg.title && (
              <div style={{ fontSize: '0.71875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bot size={12} color="#2563eb" /> {msg.title}
              </div>
            )}
            <div style={{ fontSize: '0.8125rem', lineHeight: 1.5, fontWeight: 500 }}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} style={{ padding: '14px 16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f8fafc', border: '1.5px solid #cbd5e1', borderRadius: '10px', padding: '4px 6px 4px 12px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type strategy or ask: [question]..."
            disabled={isLoading}
            style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontSize: '0.8125rem', color: '#0f172a', padding: '6px 0' }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              backgroundColor: input.trim() && !isLoading ? '#2563eb' : '#cbd5e1',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
          >
            <Send size={14} />
          </button>
        </div>
      </form>
    </div>
  );
}
