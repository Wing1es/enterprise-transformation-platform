import networkx as nx
from sqlalchemy.orm import Session

from db.models.value_chain_stage import ValueChainStage
from db.models.process import Process
from db.models.activity import Activity
from db.models.role import Role
from db.models.skill import Skill
from db.models.skill_transition import SkillTransition
from db.models.ai_opportunity import AIOpportunity
from db.models.governance_assessment import GovernanceAssessment
from db.models.initiative import Initiative
from db.models.edge import Edge


def load_full_graph(db: Session) -> nx.DiGraph:
    G = nx.DiGraph()

    # Add ValueChainStages
    stages = db.query(ValueChainStage).all()
    for s in stages:
        G.add_node(f"stage:{s.id}", id=s.id, type="value_chain_stage", label=s.name, description=s.description)

    # Add Processes
    processes = db.query(Process).all()
    for p in processes:
        node_id = f"process:{p.id}"
        G.add_node(node_id, id=p.id, type="process", label=p.name, business_purpose=p.business_purpose, automation_potential=p.automation_potential.value)
        G.add_edge(f"stage:{p.value_chain_stage_id}", node_id, relationship="has_process")

    # Add Activities
    activities = db.query(Activity).all()
    for a in activities:
        node_id = f"activity:{a.id}"
        G.add_node(node_id, id=a.id, type="activity", label=a.name, description=a.description)
        G.add_edge(f"process:{a.process_id}", node_id, relationship="has_activity")

    # Add Roles
    roles = db.query(Role).all()
    for r in roles:
        node_id = f"role:{r.id}"
        G.add_node(node_id, id=r.id, type="role", label=r.name, department=r.department)

    # Add Skills & Skill Transitions
    transitions = db.query(SkillTransition).all()
    for t in transitions:
        curr_skill = db.get(Skill, t.current_skill_id)
        fut_skill = db.get(Skill, t.future_skill_id)
        if curr_skill:
            c_node = f"skill:{curr_skill.id}"
            G.add_node(c_node, id=curr_skill.id, type="skill", label=curr_skill.name)
            G.add_edge(f"role:{t.role_id}", c_node, relationship="requires_skill")
            if t.activity_id:
                G.add_edge(f"activity:{t.activity_id}", f"role:{t.role_id}", relationship="performed_by")
        if fut_skill:
            f_node = f"skill:{fut_skill.id}"
            G.add_node(f_node, id=fut_skill.id, type="skill", label=fut_skill.name)
            G.add_edge(c_node, f_node, relationship="transitions_to", classification=t.classification.value, ai_impact=t.ai_impact)

    # Add AI Opportunities
    opportunities = db.query(AIOpportunity).all()
    for o in opportunities:
        node_id = f"ai_opportunity:{o.id}"
        G.add_node(node_id, id=o.id, type="ai_opportunity", label=o.title, benefit=o.business_benefit, priority_score=o.priority_score)
        G.add_edge(f"process:{o.process_id}", node_id, relationship="has_opportunity")
        if o.activity_id:
            G.add_edge(f"activity:{o.activity_id}", node_id, relationship="targets_activity")

    # Add Governance Assessments
    gov_assessments = db.query(GovernanceAssessment).all()
    for g in gov_assessments:
        node_id = f"governance:{g.id}"
        G.add_node(node_id, id=g.id, type="governance", label=g.area.value, finding=g.finding, risk_level=g.risk_level.value, requires_signoff=g.requires_signoff)
        G.add_edge(f"ai_opportunity:{g.ai_opportunity_id}", node_id, relationship="governed_by")

    # Add Initiatives
    initiatives = db.query(Initiative).all()
    for init in initiatives:
        node_id = f"initiative:{init.id}"
        G.add_node(node_id, id=init.id, type="initiative", label=init.name, status=init.status)

    # Add generic Edges table links
    edges = db.query(Edge).all()
    for e in edges:
        from_node = f"{e.from_type}:{e.from_id}"
        to_node = f"{e.to_type}:{e.to_id}"
        if G.has_node(from_node) and G.has_node(to_node):
            G.add_edge(from_node, to_node, relationship=e.relationship, rationale=e.rationale)

    return G


def traverse_graph(G: nx.DiGraph, entity_type: str, entity_id: int, depth: int = 2) -> dict:
    start_node = f"{entity_type}:{entity_id}"
    if not G.has_node(start_node):
        return {"nodes": [], "edges": [], "error": f"Node {start_node} not found"}

    visited_nodes = {start_node}
    current_frontier = {start_node}

    for _ in range(depth):
        next_frontier = set()
        for node in current_frontier:
            successors = set(G.successors(node))
            predecessors = set(G.predecessors(node))
            neighbors = successors | predecessors
            next_frontier.update(neighbors - visited_nodes)
        visited_nodes.update(next_frontier)
        current_frontier = next_frontier

    subgraph = G.subgraph(visited_nodes)
    
    nodes_data = [{"id": n, **G.nodes[n]} for n in subgraph.nodes]
    edges_data = [{"source": u, "target": v, **data} for u, v, data in subgraph.edges(data=True)]

    return {"nodes": nodes_data, "edges": edges_data}
