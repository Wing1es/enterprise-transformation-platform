import json
import re
import queue
import threading
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.session import get_db
from db.repositories.organisation_repository import OrganisationRepository
from db.repositories.value_chain_repository import ValueChainRepository
from db.repositories.process_repository import ProcessRepository
from db.repositories.activity_repository import ActivityRepository
from db.repositories.role_repository import RoleRepository
from db.repositories.skill_repository import SkillRepository
from db.repositories.initiative_repository import InitiativeRepository
from db.repositories.ai_opportunity_repository import AIOpportunityRepository
from db.repositories.governance_repository import GovernanceRepository
from services.vector_service import vector_service
from schemas.process_agent import StageProcesses
from schemas.role_agent import RoleSkillOutput
from schemas.governance_agent import GovernanceAndPriorityOutput
from graph.builder import graph

router = APIRouter(prefix="/ingest", tags=["Ingest"])


class StrategyIngestRequest(BaseModel):
    org_id: int | None = None
    org_name: str = "Meridian Retail Group"
    industry: str = "Retail"
    statement: str


class ProcessIngestRequest(BaseModel):
    org_id: int
    stage_id: int | None = None
    name_or_description: str


class RoleIngestRequest(BaseModel):
    org_id: int
    name_or_description: str


class InitiativeIngestRequest(BaseModel):
    org_id: int
    name: str
    description: str


class AIUseCaseIngestRequest(BaseModel):
    org_id: int = 1
    process_id: int = 1
    title: str
    description: str
    technologies: list[str] = ["LLM", "Computer Vision"]
    business_benefit: str = "High efficiency"
    risks: list[str] = ["Data Privacy"]


class RawJsonIngestRequest(BaseModel):
    org_id: int | None = None
    raw_text: str  # Paste raw JSON or markdown from ChatGPT Web / Gemini Web UI


NODE_STEP_MAP = {
    "strategy": {"step": 1, "progress": 16, "label": "Agent 1: Value Chain Stages & Initiatives Drafting"},
    "persist_strategy": {"step": 2, "progress": 33, "label": "DB Engine: Persisted Value Chain Stages into PostgreSQL"},
    "process": {"step": 3, "progress": 50, "label": "Agent 2: Mapping Processes, Activities & AI Opportunities"},
    "role": {"step": 4, "progress": 66, "label": "Agent 3: Mapping Roles & 6-Class Skill Transitions"},
    "governance": {"step": 5, "progress": 83, "label": "Agent 4: 10-Area Governance Audit & Priority Scoring"},
    "commit": {"step": 6, "progress": 100, "label": "DB Engine: Transaction Committed & Digital Twin Ready"},
}


def _create_sse_generator(statement: str, org_id: int | None, db: Session):
    org_repo = OrganisationRepository(db)
    orgs = org_repo.list()
    org = org_repo.get(org_id) if org_id else (orgs[0] if orgs else org_repo.create("Meridian Retail Group", "Retail", "Stream Ingest"))

    initial_state = {
        "db": db,
        "organisation_id": org.id,
        "strategy": statement,
    }

    def sse_event_generator():
        yield f"data: {json.dumps({'event': 'start', 'message': '5-Agent Pipeline Execution Started', 'progress': 5})}\n\n"
        
        q = queue.Queue()
        
        def run_graph():
            final_st = {}
            try:
                for output in graph.stream(initial_state):
                    q.put(("output", output))
                    for k, v in output.items():
                        final_st[k] = v
                q.put(("done", final_st))
            except Exception as e:
                import traceback
                traceback.print_exc()
                db.rollback()
                q.put(("error", str(e)))

        t = threading.Thread(target=run_graph)
        t.start()
        
        final_state = {}
        while True:
            try:
                msg_type, data = q.get(timeout=10)
                if msg_type == "output":
                    output = data
                    for node_name, node_state in output.items():
                        final_state[node_name] = node_state
                        info = NODE_STEP_MAP.get(node_name, {"step": 0, "progress": 50, "label": f"Completed step: {node_name}"})

                        details = []
                        if node_name == "strategy":
                            sr = node_state.get("strategy_result")
                            if sr:
                                stages = sr.value_chain_stages if hasattr(sr, "value_chain_stages") else []
                                inits = sr.initiatives if hasattr(sr, "initiatives") else []
                                for s in stages[:5]:
                                    details.append(f"- **Value Chain Stage**: {s.name} — {s.description[:80]}...")
                                for init in inits[:3]:
                                    details.append(f"- **Initiative**: {init.name} — {init.description[:80]}...")

                        elif node_name == "persist_strategy":
                            sr = final_state.get("strategy", {}).get("strategy_result")
                            if sr and hasattr(sr, "value_chain_stages"):
                                cnt = len(sr.value_chain_stages)
                                icnt = len(sr.initiatives) if hasattr(sr, "initiatives") else 0
                                details.append(f"- **Relational Store**: Persisted {cnt} value chain stages and {icnt} initiatives")

                        elif node_name == "process":
                            proc_results = node_state.get("process_results", [])
                            for pr in proc_results:
                                if hasattr(pr, "items"):
                                    for item in pr.items[:2]:
                                        p = item.process
                                        details.append(f"- **Process**: {p.name} — {p.business_purpose[:80] if p.business_purpose else ''}...")
                                        for opp in item.opportunities[:1]:
                                            details.append(f"- **AI Opportunity**: {opp.title} — {opp.description[:60]}...")

                        elif node_name == "role":
                            role_results = node_state.get("role_results", [])
                            for rr in role_results:
                                if hasattr(rr, "roles"):
                                    for r in rr.roles[:2]:
                                        details.append(f"- **Role**: {r.name} ({r.department})")
                                if hasattr(rr, "skill_transitions"):
                                    for st in rr.skill_transitions[:2]:
                                        details.append(f"- **Skill Shift**: {st.current_skill} → {st.future_skill} [{st.classification}]")

                        elif node_name == "governance":
                            gov_results = node_state.get("governance_results", [])
                            for gr in gov_results:
                                if hasattr(gr, "governance_findings"):
                                    for f in gr.governance_findings[:3]:
                                        risk_label = "High Risk" if f.risk_level == "high" else "Medium Risk" if f.risk_level == "medium" else "Low Risk"
                                        details.append(f"- **{risk_label} [{f.area}]**: {f.finding[:80]}... — {f.source_citation[:40] if f.source_citation else ''}")
                                if hasattr(gr, "priority_score"):
                                    details.append(f"- **Priority Score**: {gr.priority_score}/100 — {gr.priority_rationale[:60] if gr.priority_rationale else ''}...")

                        elif node_name == "commit":
                            details.append("- **Transaction**: Digital Twin graph transaction committed successfully")

                        payload = {
                            "event": "node_complete",
                            "node": node_name,
                            "step": info["step"],
                            "total_steps": 6,
                            "progress": info["progress"],
                            "label": info["label"],
                            "details": details,
                        }
                        yield f"data: {json.dumps(payload)}\n\n"
                elif msg_type == "done":
                    final_state = data
                    break
                elif msg_type == "error":
                    err_payload = {"event": "error", "progress": 0, "detail": data}
                    yield f"data: {json.dumps(err_payload)}\n\n"
                    return
            except queue.Empty:
                yield f"data: {json.dumps({'event': 'ping'})}\n\n"

        # Compute summary counts from DB
        val_repo = ValueChainRepository(db)
        proc_repo = ProcessRepository(db)
        init_repo = InitiativeRepository(db)
        stages = val_repo.list_by_organisation(org.id)
        procs = proc_repo.list_by_organisation(org.id)
        inits = init_repo.list_by_organisation(org.id)

        summary_payload = {
            "event": "complete",
            "status": "success",
            "progress": 100,
            "org_id": org.id,
            "message": "Enterprise Digital Twin Pipeline Completed Successfully!",
            "summary": {
                "value_chain_stages_count": len(stages),
                "processes_count": len(procs),
                "initiatives_count": len(inits),
            }
        }
        yield f"data: {json.dumps(summary_payload)}\n\n"

    return sse_event_generator()


@router.get("/strategy/stream", summary="Stream strategy pipeline progress (GET)")
def stream_strategy_ingestion_get(
    statement: str = "Become an AI-first regional retailer within 3 years — improve margin, reduce stockouts, and personalize customer experience while managing labor costs.",
    org_id: int | None = None,
    db: Session = Depends(get_db)
):
    """Server-Sent Events (SSE) streaming endpoint via GET."""
    gen = _create_sse_generator(statement, org_id, db)
    return StreamingResponse(gen, media_type="text/event-stream")


@router.post("/strategy/stream", summary="Stream strategy pipeline progress (POST)")
def stream_strategy_ingestion_post(
    req: StrategyIngestRequest,
    db: Session = Depends(get_db)
):
    """Server-Sent Events (SSE) streaming endpoint via POST."""
    gen = _create_sse_generator(req.statement, req.org_id, db)
    return StreamingResponse(gen, media_type="text/event-stream")


@router.post("/raw_json")
def ingest_raw_json_web(req: RawJsonIngestRequest, db: Session = Depends(get_db)):
    """Ingests raw JSON or Markdown output copied directly from ChatGPT Web (chatgpt.com) or Gemini Web UI."""
    cleaned = req.raw_text.strip()
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        cleaned = match.group(0)

    try:
        data = json.loads(cleaned)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid JSON content. Error: {str(e)}")

    org_repo = OrganisationRepository(db)
    orgs = org_repo.list()
    org = org_repo.get(req.org_id) if req.org_id else (orgs[0] if orgs else org_repo.create("Meridian Retail Group", "Retail", "Web Ingest"))

    entities_created = []

    # 1. Check if Strategy & Value Chain JSON
    if "value_chain_stages" in data or "stages" in data:
        val_repo = ValueChainRepository(db)
        init_repo = InitiativeRepository(db)
        stages = data.get("value_chain_stages") or data.get("stages") or []
        for idx, s in enumerate(stages, start=1):
            name = s.get("name") if isinstance(s, dict) else str(s)
            desc = s.get("description", "") if isinstance(s, dict) else ""
            v = val_repo.create(org.id, name, desc, idx)
            entities_created.append(f"ValueChainStage: {v.name}")

        initiatives = data.get("initiatives") or []
        for init in initiatives:
            name = init.get("name") if isinstance(init, dict) else str(init)
            desc = init.get("description", "") if isinstance(init, dict) else ""
            i = init_repo.create(org.id, name, desc)
            entities_created.append(f"Initiative: {i.name}")

    # 2. Check if Process & AI Opportunity JSON
    if "items" in data or "processes" in data:
        try:
            parsed = StageProcesses.model_validate(data)
            val_repo = ValueChainRepository(db)
            proc_repo = ProcessRepository(db)
            act_repo = ActivityRepository(db)
            opp_repo = AIOpportunityRepository(db)

            # Find or create stage
            stage_name = parsed.stage_name if hasattr(parsed, "stage_name") else "Web Ingested Stage"
            existing_stages = val_repo.list_by_organisation(org.id)
            stage = existing_stages[0] if existing_stages else val_repo.create(org.id, stage_name, "Web Ingested Stage", 1)

            for item in parsed.items:
                p_data = item.process
                proc = proc_repo.create(org.id, stage.id, p_data.name, p_data.business_purpose, ", ".join(p_data.current_challenges), p_data.automation_potential)
                entities_created.append(f"Process: {proc.name}")

                act_ids = []
                for idx, act_name in enumerate(p_data.key_activities, start=1):
                    act = act_repo.create(proc.id, act_name, sequence_order=idx)
                    act_ids.append(act.id)
                    entities_created.append(f"Activity: {act.name}")

                for opp in item.opportunities:
                    ai_opp = opp_repo.create(proc.id, opp.title, opp.description, opp.relevant_technologies, opp.business_benefit, opp.risks, activity_id=act_ids[0] if act_ids else None)
                    entities_created.append(f"AIOpportunity: {ai_opp.title}")
                    # Index evidence in Qdrant
                    vector_service.add_evidence(
                        url="https://chatgpt.com/web_ingest",
                        title=opp.title,
                        entity_type="ai_opportunity",
                        entity_id=ai_opp.id,
                        content=f"{opp.description}. Benefits: {opp.business_benefit}"
                    )
        except Exception as e:
            print(f"Process parse note: {e}")

    db.commit()

    return {
        "status": "success",
        "message": "Raw JSON copied from ChatGPT/Gemini Web UI parsed and ingested successfully!",
        "entities_count": len(entities_created),
        "entities_created": entities_created,
    }


@router.post("/strategy")
def ingest_strategy(req: StrategyIngestRequest, db: Session = Depends(get_db)):
    org_repo = OrganisationRepository(db)
    if req.org_id:
        org = org_repo.get(req.org_id)
    else:
        orgs = org_repo.list()
        org = orgs[0] if orgs else org_repo.create(req.org_name, req.industry, "Fictional Retailer")

    initial_state = {
        "db": db,
        "organisation_id": org.id,
        "strategy": req.statement,
    }
    try:
        result = graph.invoke(initial_state)
        strategy_res = result.get("strategy_result")
        stages_count = len(strategy_res.value_chain_stages) if strategy_res and hasattr(strategy_res, "value_chain_stages") else 0
        initiatives_count = len(strategy_res.initiatives) if strategy_res and hasattr(strategy_res, "initiatives") else 0
        return {
            "status": "success",
            "org_id": org.id,
            "message": "Strategy ingested through 5-agent LangGraph pipeline.",
            "stages_count": stages_count,
            "initiatives_count": initiatives_count,
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Pipeline execution failed: {str(e)}")


@router.post("/process")
def ingest_process(req: ProcessIngestRequest, db: Session = Depends(get_db)):
    repo = ProcessRepository(db)
    proc = repo.create(
        organisation_id=req.org_id,
        value_chain_stage_id=req.stage_id or 1,
        name=req.name_or_description,
        business_purpose="Single process ingestion",
        current_challenges="Manual operational bottlenecks",
    )
    db.commit()
    return {"status": "success", "process_id": proc.id, "name": proc.name}


@router.post("/role")
def ingest_role(req: RoleIngestRequest, db: Session = Depends(get_db)):
    repo = RoleRepository(db)
    role = repo.create(
        organisation_id=req.org_id,
        name=req.name_or_description,
        department="Operations",
        description="Ingested role",
    )
    db.commit()
    return {"status": "success", "role_id": role.id, "name": role.name}


@router.post("/initiative")
def ingest_initiative(req: InitiativeIngestRequest, db: Session = Depends(get_db)):
    repo = InitiativeRepository(db)
    init = repo.create(
        organisation_id=req.org_id,
        name=req.name,
        description=req.description,
    )
    db.commit()
    return {"status": "success", "initiative_id": init.id, "name": init.name}


@router.post("/ai_use_case")
def ingest_ai_use_case(req: AIUseCaseIngestRequest, db: Session = Depends(get_db)):
    repo = AIOpportunityRepository(db)
    opp = repo.create(
        process_id=req.process_id,
        title=req.title,
        description=req.description,
        technologies=req.technologies,
        business_benefit=req.business_benefit,
        risks=req.risks,
    )
    db.commit()
    return {"status": "success", "ai_opportunity_id": opp.id, "title": opp.title}


class DocUploadRequest(BaseModel):
    org_id: int | None = 1
    title: str
    content: str
    source_url: str | None = "https://internal.enterprise.docs"
    entity_type: str = "policy_doc"


@router.post("/upload_document")
def upload_document_to_qdrant(req: DocUploadRequest, db: Session = Depends(get_db)):
    """Uploads document content into Qdrant vector store and indexes evidence chunks."""
    point_id = vector_service.add_evidence(
        url=req.source_url or "https://internal.enterprise.docs",
        title=req.title,
        entity_type=req.entity_type,
        entity_id=req.org_id or 1,
        content=req.content
    )
    return {
        "status": "success",
        "message": f"Successfully indexed '{req.title}' into Qdrant vector collection 'evidence_chunks'",
        "point_id": point_id,
        "indexed_in": "Qdrant Vector Store"
    }
