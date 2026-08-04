from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from schemas.simulation import SimulateRequest
from graph_reasoning.simulation import run_simulation

router = APIRouter(tags=["Simulation"])


@router.post("/simulate")
def simulate_scenario(req: SimulateRequest, db: Session = Depends(get_db)):
    result = run_simulation(db, req.action, req.target_id, req.params)
    return result
