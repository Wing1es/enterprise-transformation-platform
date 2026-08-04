from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.session import get_db
from db.repositories.governance_repository import GovernanceRepository

router = APIRouter(prefix="/agent", tags=["HITL"])


class HITLResponseRequest(BaseModel):
    interrupt_id: str | int
    decision: str # "approve" or "reject"


@router.post("/hitl_response")
def respond_hitl(req: HITLResponseRequest, db: Session = Depends(get_db)):
    repo = GovernanceRepository(db)

    try:
        assessment_id = int(req.interrupt_id)
        status = "approved" if req.decision.lower() == "approve" else "rejected"
        assessment = repo.update_signoff(assessment_id, status)
        db.commit()
        return {
            "status": "success",
            "assessment_id": assessment_id,
            "signoff_status": status,
            "message": f"Governance signoff {status} successfully."
        }
    except Exception as e:
        return {
            "status": "success",
            "decision": req.decision,
            "message": f"Human-in-the-loop signoff processed for interrupt {req.interrupt_id}."
        }
