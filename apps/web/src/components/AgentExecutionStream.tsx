import React from 'react';
import { Database, Search, ShieldCheck, Cpu, Network, CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

export interface ExecutionStep {
  id: string;
  step: number;
  node: string;
  label: string;
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp: string;
  favicons?: { name: string; url: string; iconUrl: string }[];
  detailMsg?: string;
}

interface AgentExecutionStreamProps {
  steps: ExecutionStep[];
  currentProgress: number;
  activeLabel: string;
  isFinished: boolean;
}

const WEBSITES = [
  { name: 'EU AI Act', domain: 'ec.europa.eu', icon: '🇪🇺' },
  { name: 'NIST AI RMF 1.0', domain: 'nist.gov', icon: '🏛️' },
  { name: 'India DPDP Act 2023', domain: 'meity.gov.in', icon: '🇮🇳' },
  { name: 'ISO/IEC 42001', domain: 'iso.org', icon: '🌐' },
  { name: 'Meridian Retail Benchmarks', domain: 'meridian-retail.com', icon: '🛍️' },
];

export function AgentExecutionStream({ steps, currentProgress, activeLabel, isFinished }: AgentExecutionStreamProps) {
  return (
    <div style={{
      backgroundColor: '#0f172a',
      borderRadius: '16px',
      padding: '20px',
      color: '#f8fafc',
      fontFamily: 'Inter, sans-serif',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      border: '1px solid #1e293b',
      marginBottom: '16px'
    }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            backgroundColor: isFinished ? '#10b981' : '#3b82f6',
            borderRadius: '8px',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isFinished ? '0 0 12px rgba(16,185,129,0.5)' : '0 0 12px rgba(59,130,246,0.5)'
          }}>
            {isFinished ? <CheckCircle2 size={18} color="#ffffff" /> : <Loader2 size={18} className="animate-spin" color="#ffffff" />}
          </div>
          <div>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>
              {isFinished ? 'Digital Twin State Synthesized' : 'Live Agent Execution Stream'}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>
              {activeLabel || 'Initializing multi-agent pipeline...'}
            </span>
          </div>
        </div>
        <div style={{
          backgroundColor: isFinished ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)',
          color: isFinished ? '#34d399' : '#60a5fa',
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '0.8125rem',
          fontWeight: 800,
          border: isFinished ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(59,130,246,0.3)'
        }}>
          {currentProgress}% COMPLETE
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ width: '100%', height: '8px', backgroundColor: '#1e293b', borderRadius: '9999px', overflow: 'hidden', marginBottom: '20px' }}>
        <div style={{
          height: '100%',
          width: `${currentProgress}%`,
          backgroundColor: isFinished ? '#10b981' : '#3b82f6',
          borderRadius: '9999px',
          transition: 'width 0.4s ease-in-out',
          boxShadow: isFinished ? '0 0 12px #10b981' : '0 0 12px #3b82f6'
        }} />
      </div>

      {/* Favicon & Research Sources Bar */}
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '12px 14px',
        marginBottom: '20px',
        border: '1px solid #334155'
      }}>
        <div style={{ fontSize: '0.71875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search size={13} color="#60a5fa" />
          Active Research & Vector Evidence Sources
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {WEBSITES.map((site) => (
            <div key={site.name} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#0f172a',
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#e2e8f0',
              border: '1px solid #334155'
            }}>
              <span>{site.icon}</span>
              <img
                src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=32`}
                alt={site.name}
                style={{ width: '14px', height: '14px', borderRadius: '2px' }}
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <span>{site.name}</span>
              <ExternalLink size={10} color="#64748b" />
            </div>
          ))}
        </div>
      </div>

      {/* Step Timeline Stream */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {steps.map((step) => {
          const isDone = step.status === 'completed';
          const isRunning = step.status === 'running';

          return (
            <div key={step.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              backgroundColor: isRunning ? 'rgba(59,130,246,0.1)' : isDone ? 'rgba(16,185,129,0.05)' : '#1e293b',
              border: isRunning ? '1px solid rgba(59,130,246,0.4)' : isDone ? '1px solid rgba(16,185,129,0.2)' : '1px solid #334155',
              transition: 'all 0.3s ease'
            }}>
              <div style={{ marginTop: '2px' }}>
                {isDone && <CheckCircle2 size={16} color="#34d399" />}
                {isRunning && <Loader2 size={16} className="animate-spin" color="#60a5fa" />}
                {step.status === 'pending' && <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '2px solid #64748b' }} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: isDone ? '#34d399' : isRunning ? '#60a5fa' : '#cbd5e1' }}>
                    {step.label}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: '#64748b', fontWeight: 600 }}>
                    {step.timestamp}
                  </span>
                </div>
                {step.detailMsg && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>
                    {step.detailMsg}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
