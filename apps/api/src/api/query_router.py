from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.session import get_db
from db.models.organisation import Organisation
from graph_reasoning.traversal import load_full_graph, traverse_graph
from agents.query_simulation_agent import QuerySimulationAgent

router = APIRouter(tags=["Query"])
agent = QuerySimulationAgent()


class QueryRequest(BaseModel):
    question: str
    entity_type: str | None = None
    entity_id: int | None = None


@router.post("/query")
def query_digital_twin(req: QueryRequest, db: Session = Depends(get_db)):
    G = load_full_graph(db)

    # Fetch organisation name dynamically
    org = db.query(Organisation).first()
    org_name = org.name if org else "Meridian Retail Group"

    if req.entity_type and req.entity_id:
        graph_ctx = traverse_graph(G, req.entity_type, req.entity_id, depth=2)
    else:
        # Full graph summary context
        graph_ctx = {
            "node_count": len(G.nodes),
            "edge_count": len(G.edges),
            "sample_nodes": [{"id": n, **G.nodes[n]} for n in list(G.nodes)[:10]],
        }

    answer = agent.answer_query(req.question, graph_ctx, org_name=org_name)

    return {
        "question": req.question,
        "answer": answer,
        "graph_context": graph_ctx,
    }
