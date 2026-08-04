from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session
from db.session import get_db
from schemas.simulation import SimulateRequest
from graph_reasoning.simulation import run_simulation

router = APIRouter(tags=["Simulation"])


@router.post("/simulate")
def simulate_scenario(req: SimulateRequest, db: Session = Depends(get_db), x_llm_api_key: str | None = Header(None)):
    result = run_simulation(db, req.action, req.target_id, req.params, api_key=x_llm_api_key or "")
    return result
