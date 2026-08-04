import React, { useState } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  type NodeProps,
  type Node,
  type Edge,
  MarkerType,
  ConnectionLineType,
} from '@xyflow/react';
import { Play, X, Cpu, Database, GitBranch, Network } from 'lucide-react';
import { GraphView } from './GraphView';
import '@xyflow/react/dist/style.css';

/* ── Shared font stack ──────────────────────────────── */
const FONT = "'Inter', -apple-system, system-ui, sans-serif";
const MONO = "'SF Mono', 'Fira Code', 'JetBrains Mono', monospace";

/* ═══════════════════════════════════════════════════════
   TRIGGER NODE — the starting point (like n8n "When…")
   ═══════════════════════════════════════════════════════ */
function TriggerNode({ data }: NodeProps<Node<{ label: string; sublabel: string }>>) {
  return (
    <div style={{
      width: 200, borderRadius: 12, overflow: 'hidden',
      border: '1.5px solid #f59e0b',
      boxShadow: '0 4px 20px rgba(245,158,11,0.15)',
      fontFamily: FONT,
    }}>
      <div style={{
        height: 6, background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
      }} />
      <div style={{
        padding: '14px 16px', backgroundColor: '#18181b',
      }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
          ⚡ Trigger
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
          {data.label}
        </div>
        <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.4 }}>
          {data.sublabel}
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: '#f59e0b', width: 10, height: 10, border: '2px solid #18181b' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   AGENT NODE — the main processing blocks
   ═══════════════════════════════════════════════════════ */
function AgentNode({ data }: NodeProps<Node<{
  number: number; title: string; subtitle: string;
  icon: string; color: string; tools: string[];
  hasInput?: boolean; hasOutput?: boolean;
  outputBottom?: boolean; inputTop?: boolean;
}>>) {
  return (
    <div style={{
      width: 240, borderRadius: 12, overflow: 'hidden',
      border: `1.5px solid ${data.color}33`,
      boxShadow: `0 4px 24px ${data.color}12`,
      fontFamily: FONT, transition: 'box-shadow 0.2s',
    }}>
      {/* Color strip top */}
      <div style={{ height: 5, background: data.color }} />

      <div style={{ padding: '12px 14px', backgroundColor: '#141416' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            backgroundColor: `${data.color}18`, border: `1px solid ${data.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16,
          }}>
            {data.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 10, fontWeight: 800, color: data.color, letterSpacing: '0.05em' }}>
              AGENT {data.number}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f4f4f5', lineHeight: 1.2 }}>
              {data.title}
            </div>
          </div>
        </div>

        {/* Description */}
        <div style={{ fontSize: 11, color: '#a1a1aa', lineHeight: 1.45, marginBottom: 10 }}>
          {data.subtitle}
        </div>

        {/* Tools section */}
        <div style={{
          backgroundColor: '#0c0c0e', borderRadius: 8, padding: '8px 10px',
          border: '1px solid #27272a',
        }}>
          <div style={{ fontSize: 9, fontWeight: 800, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
            FastMCP Tools
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {data.tools.map((tool, i) => (
              <div key={i} style={{
                fontSize: 10.5, fontFamily: MONO, color: data.color,
                padding: '3px 6px', borderRadius: 4,
                backgroundColor: `${data.color}0a`,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span style={{ color: '#52525b' }}>ƒ</span> {tool}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Handles */}
      {(data.hasInput !== false) && (
        <Handle
          type="target"
          position={data.inputTop ? Position.Top : Position.Left}
          style={{ background: data.color, width: 10, height: 10, border: '2px solid #141416' }}
        />
      )}
      {(data.hasOutput !== false) && (
        <Handle
          type="source"
          position={data.outputBottom ? Position.Bottom : Position.Right}
          style={{ background: data.color, width: 10, height: 10, border: '2px solid #141416' }}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   DATA STORE NODE — Qdrant / PostgreSQL
   ═══════════════════════════════════════════════════════ */
function DataStoreNode({ data }: NodeProps<Node<{
  label: string; sublabel: string; icon: string;
  color: string; hasInput?: boolean; hasOutput?: boolean;
}>>) {
  return (
    <div style={{
      width: 190, borderRadius: 12, overflow: 'hidden',
      border: `1.5px solid ${data.color}40`,
      boxShadow: `0 4px 16px ${data.color}10`,
      fontFamily: FONT,
    }}>
      <div style={{ height: 4, background: data.color, opacity: 0.6 }} />
      <div style={{ padding: '12px 14px', backgroundColor: '#111113' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{data.icon}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7' }}>{data.label}</div>
            <div style={{ fontSize: 10, color: '#71717a' }}>{data.sublabel}</div>
          </div>
        </div>
      </div>

      {data.hasInput !== false && (
        <Handle type="target" position={Position.Left}
          style={{ background: data.color, width: 8, height: 8, border: '2px solid #111113' }} />
      )}
      {data.hasOutput !== false && (
        <Handle type="source" position={Position.Right}
          style={{ background: data.color, width: 8, height: 8, border: '2px solid #111113' }} />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   OUTPUT / GRAPH NODE — Knowledge Graph terminal
   ═══════════════════════════════════════════════════════ */
function OutputNode({ data }: NodeProps<Node<{
  label: string; sublabel: string; icon: string; color: string; onClickGraph?: () => void;
}>>) {
  return (
    <div
      onClick={data.onClickGraph}
      style={{
        width: 210, borderRadius: 12, overflow: 'hidden',
        border: `1.5px solid ${data.color}88`,
        boxShadow: `0 6px 28px ${data.color}25`,
        fontFamily: FONT, cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
      onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div style={{ height: 6, background: `linear-gradient(90deg, ${data.color}, ${data.color}88)` }} />
      <div style={{ padding: '14px 16px', backgroundColor: '#141416' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{data.icon}</span>
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: data.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Click to Open Graph
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{data.label}</div>
            <div style={{ fontSize: 10.5, color: '#71717a', marginTop: 2 }}>{data.sublabel}</div>
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Left}
        style={{ background: data.color, width: 10, height: 10, border: '2px solid #141416' }} />
    </div>
  );
}

/* ── Node type registry ─────────────────────────────── */
const nodeTypes = {
  trigger: TriggerNode,
  agent: AgentNode,
  dataStore: DataStoreNode,
  output: OutputNode,
};

/* ═══════════════════════════════════════════════════════
   LAYOUT — n8n-style branching DAG
   ═══════════════════════════════════════════════════════ */

const initialNodes: Node[] = [
  // ─ Trigger ─
  {
    id: 'trigger', type: 'trigger',
    position: { x: 0, y: 220 },
    data: { label: 'Strategy Statement', sublabel: 'Executive transformation intent' },
  },

  // ─ Agent 1 ─
  {
    id: 'a1', type: 'agent',
    position: { x: 280, y: 200 },
    data: {
      number: 1, title: 'Strategy Synthesizer', icon: '🎯', color: '#0ea5e9',
      subtitle: 'Deconstructs intent into 6 value chain stages & initiatives.',
      tools: ['parse_strategy_statement()', 'synthesize_value_chain()'],
    },
  },

  // ─ Agent 2 (branch up) ─
  {
    id: 'a2', type: 'agent',
    position: { x: 620, y: 60 },
    data: {
      number: 2, title: 'Process & Automation', icon: '⚙️', color: '#38bdf8',
      subtitle: 'Maps operational processes, activities & AI opportunities.',
      tools: ['map_operational_processes()', 'score_ai_opportunity()'],
    },
  },

  // ─ Agent 3 (branch down) ─
  {
    id: 'a3', type: 'agent',
    position: { x: 620, y: 350 },
    data: {
      number: 3, title: 'Workforce & Skills', icon: '👥', color: '#8b5cf6',
      subtitle: 'Evaluates roles across 6-class skill transitions.',
      tools: ['classify_skill_shifts()', 'generate_reskilling_paths()'],
    },
  },

  // ─ Agent 4 (merge) ─
  {
    id: 'a4', type: 'agent',
    position: { x: 960, y: 200 },
    data: {
      number: 4, title: 'Regulatory Governance', icon: '🛡️', color: '#ec4899',
      subtitle: 'EU AI Act, NIST RMF & DPDP compliance audit.',
      tools: ['query_compliance_matrix()', 'audit_governance()'],
    },
  },

  // ─ Agent 5 ─
  {
    id: 'a5', type: 'agent',
    position: { x: 1280, y: 200 },
    data: {
      number: 5, title: 'NetworkX Graph Builder', icon: '🕸️', color: '#22c55e',
      subtitle: 'Assembles multi-hop dependency edges & commits state.',
      tools: ['build_dependency_graph()', 'commit_transaction()'],
    },
  },

  // ─ Data Stores ─
  {
    id: 'qdrant', type: 'dataStore',
    position: { x: 620, y: 560 },
    data: { label: 'Qdrant Vector Store', sublabel: 'Semantic document index', icon: '🔮', color: '#a78bfa', hasInput: false },
  },
  {
    id: 'postgres', type: 'dataStore',
    position: { x: 1280, y: 500 },
    data: { label: 'PostgreSQL', sublabel: 'Relational entity store', icon: '🐘', color: '#60a5fa', hasOutput: false },
  },

  // ─ Knowledge Graph Output ─
  {
    id: 'kg', type: 'output',
    position: { x: 1600, y: 210 },
    data: { label: 'Knowledge Graph', sublabel: 'Click to view Digital Twin Graph', icon: '🌐', color: '#34d399' },
  },
];

const edgeDefaults = {
  type: 'smoothstep',
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#52525b' },
};

const initialEdges: Edge[] = [
  // Trigger → Agent 1
  { id: 'e-t-1', source: 'trigger', target: 'a1', ...edgeDefaults, style: { stroke: '#f59e0b', strokeWidth: 2 } },

  // Agent 1 → Agent 2 (branch up)
  { id: 'e-1-2', source: 'a1', target: 'a2', ...edgeDefaults, style: { stroke: '#0ea5e9', strokeWidth: 2 } },
  // Agent 1 → Agent 3 (branch down)
  { id: 'e-1-3', source: 'a1', target: 'a3', ...edgeDefaults, style: { stroke: '#0ea5e9', strokeWidth: 2 } },

  // Agent 2 → Agent 4 (merge)
  { id: 'e-2-4', source: 'a2', target: 'a4', ...edgeDefaults, style: { stroke: '#38bdf8', strokeWidth: 2 } },
  // Agent 3 → Agent 4 (merge)
  { id: 'e-3-4', source: 'a3', target: 'a4', ...edgeDefaults, style: { stroke: '#8b5cf6', strokeWidth: 2 } },

  // Agent 4 → Agent 5
  { id: 'e-4-5', source: 'a4', target: 'a5', ...edgeDefaults, style: { stroke: '#ec4899', strokeWidth: 2 } },

  // Agent 5 → Knowledge Graph
  { id: 'e-5-kg', source: 'a5', target: 'kg', ...edgeDefaults, style: { stroke: '#22c55e', strokeWidth: 2 } },

  // Qdrant → Agent 4 (feeds compliance evidence)
  { id: 'e-q-4', source: 'qdrant', target: 'a4', ...edgeDefaults, animated: false, style: { stroke: '#a78bfa', strokeWidth: 1.5, strokeDasharray: '6 3' } },

  // Agent 5 → PostgreSQL (persists)
  { id: 'e-5-pg', source: 'a5', target: 'postgres', ...edgeDefaults, animated: false, style: { stroke: '#60a5fa', strokeWidth: 1.5, strokeDasharray: '6 3' } },
];

/* ═══════════════════════════════════════════════════════
   PipelineFlowView — Fullscreen Workspace with Tabs
   ═══════════════════════════════════════════════════════ */
export function PipelineFlowView({ onClose, onExecute }: { onClose: () => void; onExecute: () => void }) {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'graph'>('pipeline');

  const nodesWithClick = initialNodes.map(n => {
    if (n.id === 'kg') {
      return {
        ...n,
        data: {
          ...n.data,
          onClickGraph: () => setActiveTab('graph'),
        },
      };
    }
    return n;
  });

  const [nodes, , onNodesChange] = useNodesState(nodesWithClick);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      backgroundColor: '#09090b', display: 'flex', flexDirection: 'column',
      fontFamily: FONT,
    }}>
      {/* ── Top Bar with Tab Switcher ──────────────────────────────── */}
      <div style={{
        height: 52, padding: '0 20px',
        backgroundColor: '#0f0f11', borderBottom: '1px solid #1f1f23',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GitBranch size={16} color="#fff" />
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: '#f4f4f5' }}>
              Digital Twin Workspace
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            backgroundColor: '#18181b', padding: 3, borderRadius: 8,
            border: '1px solid #27272a',
          }}>
            <button
              onClick={() => setActiveTab('pipeline')}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 6,
                fontSize: 12, fontWeight: 700,
                backgroundColor: activeTab === 'pipeline' ? '#0ea5e9' : 'transparent',
                color: activeTab === 'pipeline' ? '#fff' : '#a1a1aa',
                transition: 'all 0.15s',
              }}
            >
              <GitBranch size={13} /> 5-Agent Pipeline DAG
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 12px', borderRadius: 6,
                fontSize: 12, fontWeight: 700,
                backgroundColor: activeTab === 'graph' ? '#8b5cf6' : 'transparent',
                color: activeTab === 'graph' ? '#fff' : '#a1a1aa',
                transition: 'all 0.15s',
              }}
            >
              <Network size={13} /> Knowledge Graph Visualizer
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {activeTab === 'pipeline' && (
            <button
              onClick={onExecute}
              style={{
                all: 'unset', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 16px', borderRadius: 8,
                backgroundColor: '#22c55e', color: '#fff',
                fontWeight: 700, fontSize: 13, fontFamily: FONT,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#16a34a')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#22c55e')}
            >
              <Play size={13} fill="#fff" /> Execute Pipeline
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              all: 'unset', cursor: 'pointer',
              width: 30, height: 30, borderRadius: 6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#18181b', border: '1px solid #27272a',
              color: '#71717a', transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = '#71717a')}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── Main Workspace Body (Pipeline vs Knowledge Graph) ─────────────────────── */}
      <div style={{ flex: 1, position: 'relative' }}>
        {activeTab === 'pipeline' ? (
          <>
            <style>{`
              .react-flow__node { transition: box-shadow 0.2s; }
              .react-flow__node:hover { z-index: 10 !important; }
              .react-flow__node.selected { z-index: 10 !important; }
              .react-flow__controls { background: #18181b !important; border: 1px solid #27272a !important; border-radius: 8px !important; }
              .react-flow__controls-button { background: #18181b !important; border-bottom: 1px solid #27272a !important; color: #a1a1aa !important; fill: #a1a1aa !important; }
              .react-flow__controls-button:hover { background: #27272a !important; }
              .react-flow__controls-button svg { fill: #a1a1aa !important; }
              .react-flow__minimap { background: #111113 !important; border: 1px solid #27272a !important; border-radius: 8px !important; }
              .react-flow__attribution { display: none; }
            `}</style>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              connectionLineType={ConnectionLineType.SmoothStep}
              fitView
              fitViewOptions={{ padding: 0.25 }}
              proOptions={{ hideAttribution: true }}
            >
              <Background color="#1f1f23" variant={BackgroundVariant.Dots} gap={20} size={1} />
              <Controls position="bottom-left" />
              <MiniMap
                position="bottom-right"
                nodeColor={(n) => {
                  const d = n.data as any;
                  return d?.color || '#52525b';
                }}
                maskColor="rgba(0,0,0,0.7)"
                style={{ width: 160, height: 100 }}
              />
            </ReactFlow>
          </>
        ) : (
          <GraphView />
        )}
      </div>
    </div>
  );
}
