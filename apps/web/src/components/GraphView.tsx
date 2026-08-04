import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  Handle,
  Position,
  type Node,
  type Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Sparkles, ShieldCheck, Activity, Users, Brain,
  Lightbulb, Layers, Target, Database
} from 'lucide-react';
import dagre from 'dagre';
import { API_URL } from '../config';


/* ─── Node Metadata & Gradient Palette ─── */
const getNodeMeta = (type: string) => {
  switch (type) {
    case 'branch-initiative': return { bg: '#4f46e5', gradient: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)', icon: Target, name: 'Strategic Initiatives' };
    case 'branch-stage': return { bg: '#059669', gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', icon: Layers, name: 'Value Chain' };
    case 'branch-role': return { bg: '#d97706', gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)', icon: Users, name: 'Workforce' };
    case 'strategy': return { bg: '#312e81', gradient: 'linear-gradient(135deg, #312e81 0%, #4f46e5 100%)', icon: Sparkles, name: 'Strategy' };
    case 'initiative': return { bg: '#3b82f6', gradient: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)', icon: Target, name: 'Initiative' };
    case 'stage': return { bg: '#059669', gradient: 'linear-gradient(135deg, #047857 0%, #34d399 100%)', icon: Layers, name: 'Value Chain Stage' };
    case 'process': return { bg: '#0891b2', gradient: 'linear-gradient(135deg, #0e7490 0%, #22d3ee 100%)', icon: Activity, name: 'Process' };
    case 'opportunity': return { bg: '#7c3aed', gradient: 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)', icon: Lightbulb, name: 'AI Opportunity' };
    case 'role': return { bg: '#ea580c', gradient: 'linear-gradient(135deg, #c2410c 0%, #fb923c 100%)', icon: Users, name: 'Role' };
    case 'skill': return { bg: '#059669', gradient: 'linear-gradient(135deg, #047857 0%, #6ee7b7 100%)', icon: Brain, name: 'Skill Transition' };
    case 'governance': return { bg: '#dc2626', gradient: 'linear-gradient(135deg, #b91c1c 0%, #f87171 100%)', icon: ShieldCheck, name: 'Governance' };
    default: return { bg: '#475569', gradient: 'linear-gradient(135deg, #334155 0%, #94a3b8 100%)', icon: Database, name: 'Entity' };
  }
};

/* ─── Premium Card Node ─── */
const TopologyNode = ({ data, selected, id }: any) => {
  const meta = getNodeMeta(data.type);
  const Icon = meta.icon;
  const isRoot = data.type === 'strategy';
  const isBranch = data.type.startsWith('branch-');

  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.onToggleExpand) data.onToggleExpand(id);
  };

  return (
    <div style={{
      width: isRoot ? 200 : 170,
      background: isRoot ? meta.gradient : '#ffffff',
      borderRadius: 16,
      boxShadow: selected
        ? `0 0 0 3px ${meta.bg}50, 0 20px 40px rgba(0,0,0,0.15)`
        : isRoot ? '0 8px 32px rgba(49, 46, 129, 0.25)' : '0 2px 12px rgba(15,23,42,0.08), 0 1px 3px rgba(0,0,0,0.04)',
      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      transform: selected ? 'scale(1.04)' : 'scale(1)',
      position: 'relative', cursor: 'pointer',
      border: isRoot ? 'none' : `1px solid ${selected ? meta.bg + '60' : '#e2e8f0'}`,
    }}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />

      {/* Colored accent bar on left */}
      {!isRoot && (
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 4,
          background: meta.gradient, borderRadius: '16px 0 0 16px',
        }} />
      )}

      <div style={{ padding: isRoot ? '10px 12px' : '8px 10px 8px 14px' }}>
        {/* Category Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: isRoot ? 6 : 4 }}>
          <div style={{
            width: isRoot ? 22 : 18, height: isRoot ? 22 : 18, borderRadius: isRoot ? 6 : 4,
            background: isRoot ? 'rgba(255,255,255,0.2)' : `${meta.bg}12`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon size={isRoot ? 12 : 10} color={isRoot ? '#ffffff' : meta.bg} />
          </div>
          <span style={{
            fontSize: isRoot ? 8.5 : 7.5, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: isRoot ? 'rgba(255,255,255,0.75)' : meta.bg,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {meta.name}
          </span>
        </div>

        {/* Label */}
        <div style={{
          fontSize: isRoot ? 11.5 : (isBranch ? 10.5 : 10), fontWeight: isRoot ? 800 : 700,
          color: isRoot ? '#ffffff' : '#0f172a', lineHeight: 1.3, wordBreak: 'break-word',
          maxHeight: 40, overflow: 'hidden',
        }}>
          {data.label.length > 60 ? data.label.substring(0, 57) + '…' : data.label}
        </div>

        {/* Badge */}
        {data.badge && !isRoot && (
          <div style={{
            marginTop: 5, display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 7.5, fontWeight: 800, color: meta.bg,
            background: `${meta.bg}10`, border: `1px solid ${meta.bg}25`,
            borderRadius: 6, padding: '2px 8px',
          }}>
            {data.badge}
          </div>
        )}
      </div>

      {/* Expand/Collapse */}
      {data.hasChildren && (
        <div onClick={handleExpandClick} style={{
          position: 'absolute', bottom: -10, left: '50%', transform: 'translateX(-50%)',
          width: 20, height: 20, borderRadius: '50%',
          background: isRoot ? '#ffffff' : meta.bg,
          color: isRoot ? meta.bg : '#ffffff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 900, lineHeight: 1,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          border: isRoot ? `2px solid ${meta.bg}` : '2px solid #ffffff',
          cursor: 'pointer', zIndex: 20,
        }} title={data.isExpanded ? 'Collapse' : 'Expand'}>
          {data.isExpanded ? '−' : '+'}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
};

const nodeTypes = { topology: TopologyNode };

/* ─── Dagre Hierarchical Layout ─── */
const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 40 });

  nodes.forEach(n => {
    const isRoot = n.data?.type === 'strategy';
    g.setNode(n.id, { width: isRoot ? 200 : 170, height: 90 });
  });
  edges.forEach(e => g.setEdge(e.source, e.target));
  dagre.layout(g);

  nodes.forEach(n => {
    const pos = g.node(n.id);
    const isRoot = n.data?.type === 'strategy';
    n.targetPosition = Position.Top;
    n.sourcePosition = Position.Bottom;
    n.position = { x: pos.x - (isRoot ? 100 : 85), y: pos.y - 45 };
  });
  return { nodes, edges };
};

/* ─── Edge Color By Source Type ─── */
const getEdgeStyle = (sourceType: string) => {
  switch (sourceType) {
    case 'strategy': return { stroke: '#4f46e5', strokeWidth: 2.5 };
    case 'branch-initiative': return { stroke: '#4f46e5', strokeWidth: 2 };
    case 'branch-stage': return { stroke: '#059669', strokeWidth: 2 };
    case 'branch-role': return { stroke: '#d97706', strokeWidth: 2 };
    case 'stage': return { stroke: '#10b981', strokeWidth: 1.8 };
    case 'process': return { stroke: '#0891b2', strokeWidth: 1.5 };
    case 'opportunity': return { stroke: '#7c3aed', strokeWidth: 1.5 };
    case 'role': return { stroke: '#ea580c', strokeWidth: 1.5 };
    default: return { stroke: '#94a3b8', strokeWidth: 1.5 };
  }
};

/* ─── Legend ─── */
const legendItems = [
  { color: '#312e81', label: 'Strategy' },
  { color: '#3b82f6', label: 'Initiative' },
  { color: '#059669', label: 'Value Chain' },
  { color: '#0891b2', label: 'Process' },
  { color: '#7c3aed', label: 'AI Opportunity' },
  { color: '#ea580c', label: 'Role' },
  { color: '#059669', label: 'Skill Shift' },
  { color: '#dc2626', label: 'Governance' },
];

/* ─── Graph Visualizer ─── */
function GraphVisualizer({ rawGraph }: { rawGraph: { nodes: Node[]; edges: Edge[] } }) {
  const { fitView, setCenter, getZoom } = useReactFlow();
  const lastInteractedNodeId = useRef<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(['strategy-root']));
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const toggleNodeExpand = useCallback((nodeId: string) => {
    lastInteractedNodeId.current = nodeId;
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const onNodeClick = useCallback((_: any, node: Node) => {
    toggleNodeExpand(node.id);
  }, [toggleNodeExpand]);

  const onNodeDoubleClick = useCallback((_: any, node: Node) => {
    if (node.data.rawItem) {
      setSelectedItem({ ...node.data.rawItem, _nodeType: node.data.type, _label: node.data.label });
    }
  }, []);

  useEffect(() => {
    if (!rawGraph.nodes.length) return;

    const visibleNodeIds = new Set<string>();
    const stack = ['strategy-root'];
    while (stack.length > 0) {
      const parentId = stack.pop()!;
      visibleNodeIds.add(parentId);
      if (expandedIds.has(parentId)) {
        rawGraph.nodes.filter(n => n.data.logicalParent === parentId).forEach(c => stack.push(c.id));
      }
    }

    const nodeTypeMap = new Map<string, string>();
    rawGraph.nodes.forEach(n => nodeTypeMap.set(n.id, n.data.type));

    const filteredNodes = rawGraph.nodes.filter(n => visibleNodeIds.has(n.id)).map(n => ({
      ...n,
      data: { ...n.data, isExpanded: expandedIds.has(n.id), onToggleExpand: toggleNodeExpand }
    }));

    const filteredEdges = rawGraph.edges.filter(
      e => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target)
    ).map(e => ({
      ...e, animated: false,
      style: getEdgeStyle(nodeTypeMap.get(e.source) || ''),
    }));

    const layouted = getLayoutedElements(filteredNodes, filteredEdges);
    setNodes(layouted.nodes);
    setEdges(layouted.edges);

    setTimeout(() => {
      if (lastInteractedNodeId.current) {
        const targetNode = layouted.nodes.find(n => n.id === lastInteractedNodeId.current);
        if (targetNode) {
          const zoom = getZoom();
          const nodeWidth = targetNode.data?.type === 'strategy' ? 200 : 170;
          setCenter(targetNode.position.x + (nodeWidth / 2), targetNode.position.y + 45, { zoom, duration: 400 });
        }
      } else {
        fitView({ maxZoom: 0.65, padding: 0.4, duration: 400 });
      }
    }, 50);
  }, [rawGraph, expandedIds, setNodes, setEdges, fitView, setCenter, getZoom]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)' }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick} onNodeDoubleClick={onNodeDoubleClick}
        onPaneClick={() => setSelectedItem(null)}
        nodeTypes={nodeTypes} panOnScroll fitView minZoom={0.15} maxZoom={1.5}
        fitViewOptions={{ maxZoom: 0.65, padding: 0.4 }}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#c7d2e0" />
        <Controls position="bottom-left" style={{
          backgroundColor: '#0f172a', borderRadius: 12,
          border: '1px solid #1e293b', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          color: '#ffffff',
        }} className="dark-controls" />
      </ReactFlow>

      {/* Legend – positioned top-right so it never overlaps Controls */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
        border: '1px solid #e2e8f0', borderRadius: 14,
        padding: '10px 14px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        zIndex: 5, fontSize: 11, color: '#475569',
      }}>
        <div style={{ fontSize: 9.5, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em', marginBottom: 6 }}>Legend</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
          {legendItems.map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: item.color, flexShrink: 0 }} />
              <span style={{ fontWeight: 600, fontSize: 10.5 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Sidebar Drawer */}
      {selectedItem && (
        <div style={{
          position: 'absolute', top: 0, right: 0, bottom: 0, width: 380,
          backgroundColor: '#ffffff', borderLeft: '1px solid #e2e8f0',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.08)', zIndex: 100,
          display: 'flex', flexDirection: 'column', overflowY: 'auto',
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, backgroundColor: '#ffffff', zIndex: 1,
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.08em' }}>
              {selectedItem._nodeType || 'Detail'}
            </span>
            <button onClick={() => setSelectedItem(null)} style={{
              all: 'unset', cursor: 'pointer', width: 28, height: 28, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: '#f1f5f9', color: '#64748b', fontSize: 14, fontWeight: 700,
            }}>✕</button>
          </div>
          <div style={{ padding: '16px 20px' }}>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 16px', lineHeight: 1.35 }}>
              {selectedItem._label || selectedItem.name || selectedItem.title}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: 13, color: '#334155', lineHeight: 1.55 }}>
              {selectedItem.description && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 4 }}>Description</div>
                  {selectedItem.description}
                </div>
              )}
              {selectedItem.department && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 4 }}>Department</div>
                  {selectedItem.department}
                </div>
              )}
              {selectedItem.business_purpose && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 4 }}>Business Purpose</div>
                  {selectedItem.business_purpose}
                </div>
              )}
              {selectedItem.automation_potential && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 4 }}>Automation Potential</div>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 8, backgroundColor: '#ede9fe', color: '#5b21b6', fontWeight: 700, fontSize: 12 }}>
                    {selectedItem.automation_potential}
                  </span>
                </div>
              )}
              {selectedItem.current_skill && selectedItem.future_skill && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 4 }}>Skill Transition</div>
                  <span style={{ color: '#64748b' }}>{selectedItem.current_skill}</span>
                  <span style={{ margin: '0 6px', color: '#4f46e5' }}>→</span>
                  <span style={{ color: '#059669', fontWeight: 700 }}>{selectedItem.future_skill}</span>
                </div>
              )}
              {selectedItem.ai_impact && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 4 }}>AI Impact</div>
                  {selectedItem.ai_impact}
                </div>
              )}
              {selectedItem.rationale && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 4 }}>Rationale</div>
                  {selectedItem.rationale}
                </div>
              )}
              {selectedItem.risks && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 4 }}>Risks</div>
                  <div style={{ color: '#dc2626' }}>{selectedItem.risks}</div>
                </div>
              )}
              {selectedItem.source_citation && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.06em', marginBottom: 4 }}>Citation</div>
                  <span style={{ fontSize: 12, color: '#4f46e5', fontStyle: 'italic' }}>{selectedItem.source_citation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Exported GraphView (data fetcher + parser) ─── */
export function GraphView({ state }: { state?: any }) {
  const [rawGraph, setRawGraph] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });
  const graphIdRef = useRef<number>(0);

  useEffect(() => {
    const handleGraphUpdate = (e: any) => {
      const s = e.detail;
      if (!s) return;

      const rNodes: Node[] = [];
      const rEdges: Edge[] = [];
      const seenNodeKeys = new Map<string, string>();
      const seenEdgeKeys = new Set<string>();

      const addNode = (id: string, label: string, type: string, rawItem: any, logicalParent: string | null, badge?: string): string => {
        const cleanLabel = (label || '').trim();
        if (!cleanLabel || cleanLabel.includes('<') || cleanLabel.includes('>') || cleanLabel.toLowerCase().includes('placeholder')) return '';

        const dupKey = `${logicalParent || 'root'}:${type}:${cleanLabel.toLowerCase()}`;
        if (seenNodeKeys.has(dupKey)) return seenNodeKeys.get(dupKey)!;

        seenNodeKeys.set(dupKey, id);
        rNodes.push({ id, type: 'topology', position: { x: 0, y: 0 }, data: { label: cleanLabel, type, rawItem, logicalParent, badge } });
        return id;
      };

      const addEdge = (src: string, tgt: string) => {
        if (!src || !tgt) return;
        const k = `${src}->${tgt}`;
        if (seenEdgeKeys.has(k)) return;
        seenEdgeKeys.add(k);
        rEdges.push({ id: `e-${src}-${tgt}`, source: src, target: tgt, type: 'smoothstep', style: { stroke: '#94a3b8', strokeWidth: 2 } });
      };

      const rootId = 'strategy-root';
      const actualRootId = addNode(rootId, s.strategy?.statement || 'Enterprise Strategy', 'strategy', s.strategy || s.input_data, null);

      // 2 Pillar Branches
      const branchInitId = addNode('branch-initiatives', 'Strategic Initiatives', 'branch-initiative', {}, actualRootId);
      const branchStageId = addNode('branch-valuechain', 'Value Chain Operations', 'branch-stage', {}, actualRootId);
      if (branchInitId) addEdge(actualRootId, branchInitId);
      if (branchStageId) addEdge(actualRootId, branchStageId);

      // Initiatives
      (s.initiatives_and_roadmap || s.initiatives || []).forEach((init: any, idx: number) => {
        const id = `init-${init.id || idx}`;
        const actualId = addNode(id, init.name || init.title, 'initiative', init, branchInitId, init.priority_score ? `P:${init.priority_score}` : undefined);
        if (actualId && branchInitId) addEdge(branchInitId, actualId);
      });

      // Value Chain Stages + role matching map
      const stageNameToNodeId = new Map<string, string>();
      (s.value_chain_stages || []).forEach((stage: any, sIdx: number) => {
        const stageId = `stage-${stage.id || sIdx}`;
        const actualStageId = addNode(stageId, stage.name, 'stage', stage, branchStageId);
        if (actualStageId && branchStageId) {
          addEdge(branchStageId, actualStageId);
          if (stage.name) stageNameToNodeId.set(stage.name.toLowerCase().trim(), actualStageId);

          (stage.processes || []).forEach((proc: any, pIdx: number) => {
            const procId = `proc-${proc.id || `${sIdx}-${pIdx}`}`;
            const actualProcId = addNode(procId, proc.name, 'process', proc, actualStageId, proc.automation_potential?.substring(0,3).toUpperCase());
            if (actualProcId) {
              addEdge(actualStageId, actualProcId);
              (proc.ai_opportunities || proc.opportunities || []).forEach((opp: any, oIdx: number) => {
                const oppId = `opp-${opp.id || `${procId}-${oIdx}`}`;
                const actualOppId = addNode(oppId, opp.title || opp.name, 'opportunity', opp, actualProcId);
                if (actualOppId) {
                  addEdge(actualProcId, actualOppId);
                  (opp.governance_assessments || []).forEach((gov: any, gIdx: number) => {
                    const govId = `gov-${gov.id || `${oppId}-${gIdx}`}`;
                    const actualGovId = addNode(govId, gov.area || 'Audit', 'governance', gov, actualOppId, gov.risk_level?.toUpperCase());
                    if (actualGovId) addEdge(actualOppId, actualGovId);
                  });
                }
              });
            }
          });
        }
      });

      // Fuzzy match role.department → stage.name
      const matchRoleToStage = (department: string): string | null => {
        if (!department) return null;
        const dept = department.toLowerCase().trim();
        if (stageNameToNodeId.has(dept)) return stageNameToNodeId.get(dept)!;
        for (const [stageName, stageNodeId] of stageNameToNodeId.entries()) {
          if (dept.includes(stageName) || stageName.includes(dept)) return stageNodeId;
          const deptWords = dept.split(/\s+/);
          const stageWords = stageName.split(/\s+/);
          const overlap = deptWords.filter(w => stageWords.includes(w) && w.length > 2);
          if (overlap.length >= 2 || (overlap.length === 1 && overlap[0].length > 4)) return stageNodeId;
        }
        return null;
      };

      const unmatchedRoles: { role: any; rIdx: number }[] = [];
      (s.roles_and_workforce || s.roles || []).forEach((role: any, rIdx: number) => {
        const matchedStageNodeId = matchRoleToStage(role.department);
        if (matchedStageNodeId) {
          const roleId = `role-${role.id || rIdx}`;
          const actualRoleId = addNode(roleId, role.name, 'role', role, matchedStageNodeId, role.department);
          if (actualRoleId) {
            addEdge(matchedStageNodeId, actualRoleId);
          }
        } else {
          unmatchedRoles.push({ role, rIdx });
        }
      });

      if (unmatchedRoles.length > 0) {
        const otherRolesId = addNode('branch-other-roles', 'Other Roles', 'branch-role', {}, actualRootId);
        if (otherRolesId) {
          addEdge(actualRootId, otherRolesId);
          unmatchedRoles.forEach(({ role, rIdx }) => {
            const roleId = `role-${role.id || rIdx}`;
            const actualRoleId = addNode(roleId, role.name, 'role', role, otherRolesId, role.department);
            if (actualRoleId) {
              addEdge(otherRolesId, actualRoleId);
            }
          });
        }
      }

      rNodes.forEach(n => { n.data.hasChildren = rNodes.some(child => child.data.logicalParent === n.id); });
      graphIdRef.current += 1;
      setRawGraph({ nodes: rNodes, edges: rEdges });
    };

    if (state) handleGraphUpdate({ detail: state });
    window.addEventListener('ti-graph-data', handleGraphUpdate);
    return () => window.removeEventListener('ti-graph-data', handleGraphUpdate);
  }, [state]);

  useEffect(() => {
    if (!state) {
      fetch(`${API_URL}/api/v1/graph/state`)
        .then(res => res.ok ? res.json() : null)
        .then(data => { if (data) window.dispatchEvent(new CustomEvent('ti-graph-data', { detail: data })); })
        .catch(err => console.warn('Failed to fetch initial graph state:', err));
    }
  }, [state]);

  return (
    <ReactFlowProvider>
      <GraphVisualizer rawGraph={rawGraph} />
    </ReactFlowProvider>
  );
}
