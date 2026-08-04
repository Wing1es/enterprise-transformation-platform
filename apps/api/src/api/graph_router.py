from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from db.session import get_db
from db.models.organisation import Organisation
from db.models.strategy import Strategy
from db.models.value_chain_stage import ValueChainStage
from db.models.process import Process
from db.models.activity import Activity
from db.models.role import Role
from db.models.skill_transition import SkillTransition
from db.models.ai_opportunity import AIOpportunity
from db.models.governance_assessment import GovernanceAssessment
from db.models.initiative import Initiative
from db.models.edge import Edge
from db.models.evidence_source import EvidenceSource
from graph_reasoning.traversal import load_full_graph, traverse_graph
from services.vector_service import vector_service

router = APIRouter(prefix="/graph", tags=["Graph & State"])


@router.get("/state", summary="Get complete holistic state of Digital Twin")
@router.get("/full_state", summary="Get complete holistic state of Digital Twin (alias)")
def get_full_digital_twin_state(
    org_id: int | None = Query(None, description="Optional Organisation ID. Leave blank to automatically load the default active organisation."),
    strategy_id: int | None = Query(None, description="Optional Strategy ID to inspect a specific strategy version."),
    strategy_statement: str | None = Query(None, description="Optional strategy statement text filter."),
    db: Session = Depends(get_db),
):
    """Returns the entire holistic state of the Digital Twin graph:

    - Organisation & Strategy statement
    - 6 Value Chain Stages & Processes
    - Key Sequential Activities
    - Roles & 6-Class Skill Transitions
    - AI Opportunities with Priority Scores & Rationales
    - 10-Area Governance Assessments with Regulatory Citations (EU AI Act, NIST, DPDP)
    - Strategic Initiatives & Dependency Edges
    - Vector Evidence Chunks & Research Links (Qdrant & PostgreSQL)
    """
    # 1. Fetch Organisation
    org = db.query(Organisation).first() if not org_id else db.get(Organisation, org_id)
    if not org:
        return {"message": "No organisation found in Digital Twin database."}

    # 2. Fetch Strategy (by strategy_id, strategy_statement filter, or latest)
    query = db.query(Strategy).filter(Strategy.organisation_id == org.id)
    if strategy_id:
        query = query.filter(Strategy.id == strategy_id)
    elif strategy_statement:
        query = query.filter(Strategy.statement.ilike(f"%{strategy_statement}%"))
    
    strategy = query.order_by(Strategy.id.desc()).first()

    # 3. Fetch Value Chain Stages, Processes, Activities, Opportunities, Governance
    stages = db.query(ValueChainStage).filter(ValueChainStage.organisation_id == org.id).order_by(ValueChainStage.sequence_order).all()
    stages_data = []

    for stage in stages:
        processes = db.query(Process).filter(Process.value_chain_stage_id == stage.id).all()
        processes_data = []

        for proc in processes:
            activities = db.query(Activity).filter(Activity.process_id == proc.id).order_by(Activity.sequence_order).all()
            opportunities = db.query(AIOpportunity).filter(AIOpportunity.process_id == proc.id).all()

            opps_data = []
            for opp in opportunities:
                # Fetch governance assessments for this opportunity
                gov_assessments = db.query(GovernanceAssessment).filter(GovernanceAssessment.ai_opportunity_id == opp.id).all()
                gov_data = [
                    {
                        "id": g.id,
                        "area": g.area,
                        "finding": g.finding,
                        "source_type": g.source_type,
                        "source_citation": g.source_citation,
                        "risk_level": g.risk_level,
                        "requires_signoff": g.requires_signoff,
                        "signoff_status": g.signoff_status,
                    }
                    for g in gov_assessments
                ]

                # Fetch evidence chunks from Qdrant vector store
                evidence_chunks = vector_service.search_evidence(opp.title, limit=3)

                opps_data.append({
                    "id": opp.id,
                    "title": opp.title,
                    "description": opp.description,
                    "technologies": opp.technologies,
                    "business_benefit": opp.business_benefit,
                    "risks": opp.risks,
                    "priority_score": opp.priority_score,
                    "priority_rationale": opp.priority_rationale,
                    "governance_assessments": gov_data,
                    "evidence_chunks": evidence_chunks,
                })

            processes_data.append({
                "id": proc.id,
                "name": proc.name,
                "business_purpose": proc.business_purpose,
                "current_challenges": proc.current_challenges,
                "automation_potential": proc.automation_potential,
                "activities": [
                    {
                        "id": a.id,
                        "name": a.name,
                        "description": a.description,
                        "sequence_order": a.sequence_order,
                    }
                    for a in activities
                ],
                "ai_opportunities": opps_data,
            })

        stages_data.append({
            "id": stage.id,
            "name": stage.name,
            "description": stage.description,
            "sequence_order": stage.sequence_order,
            "processes": processes_data,
        })

    # 4. Fetch Roles & Skill Transitions
    roles = db.query(Role).filter(Role.organisation_id == org.id).all()
    roles_data = []

    for role in roles:
        transitions = db.query(SkillTransition).filter(SkillTransition.role_id == role.id).all()
        transitions_data = [
            {
                "id": t.id,
                "current_skill": t.current_skill.name if t.current_skill else "Current Skill",
                "future_skill": t.future_skill.name if t.future_skill else "Future AI Skill",
                "classification": t.classification,
                "ai_impact": t.ai_impact,
                "rationale": t.rationale,
            }
            for t in transitions
        ]

        roles_data.append({
            "id": role.id,
            "name": role.name,
            "department": role.department,
            "description": role.description,
            "skill_transitions": transitions_data,
        })

    # 5. Fetch Strategic Initiatives & Graph Edges
    initiatives = db.query(Initiative).filter(Initiative.organisation_id == org.id).all()
    edges = db.query(Edge).all()

    edges_data = [
        {
            "id": e.id,
            "from_type": e.from_type,
            "from_id": e.from_id,
            "to_type": e.to_type,
            "to_id": e.to_id,
            "relationship": e.relationship,
            "rationale": e.rationale,
        }
        for e in edges
    ]

    initiatives_data = [
        {
            "id": i.id,
            "name": i.name,
            "description": i.description,
            "status": i.status,
            "priority_score": i.priority_score,
        }
        for i in initiatives
    ]

    # 6. Fetch Evidence & Regulatory Sources
    evidence_sources = db.query(EvidenceSource).all()
    evidence_sources_data = [
        {
            "id": es.id,
            "title": es.title,
            "url": es.url,
            "entity_type": es.entity_type,
            "entity_id": es.entity_id,
            "snippet": es.snippet,
        }
        for es in evidence_sources
    ]

    return {
        "status": "success",
        "organisation": {
            "id": org.id,
            "name": org.name,
            "industry": org.industry,
            "description": org.description,
        },
        "strategy": {
            "id": strategy.id if strategy else None,
            "statement": strategy.statement if strategy else None,
            "horizon_years": strategy.horizon_years if strategy else 3,
        },
        "value_chain_stages": stages_data,
        "roles_and_workforce": roles_data,
        "initiatives_and_roadmap": initiatives_data,
        "dependency_edges": edges_data,
        "evidence_sources_index": evidence_sources_data,
    }


@router.get("/traverse")
def get_graph_traversal(
    entity_type: str = Query(..., description="e.g. process, role, value_chain_stage, initiative"),
    entity_id: int = Query(...),
    depth: int = Query(2, ge=1, le=5),
    db: Session = Depends(get_db),
):
    G = load_full_graph(db)
    return traverse_graph(G, entity_type, entity_id, depth)


@router.get("/{entity_type}/{id}")
def get_entity_graph(
    entity_type: str,
    id: int,
    db: Session = Depends(get_db),
):
    G = load_full_graph(db)
    return traverse_graph(G, entity_type, id, depth=1)
