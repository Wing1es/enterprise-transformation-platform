from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from db.session import get_db

from schemas.ingest import StrategyIngestRequest

from services.strategy_ingestion_service import (
    StrategyIngestionService,
)

router = APIRouter(
    prefix="/ingest",
    tags=["Ingestion"],
)


@router.post("/strategy")
def ingest_strategy(
    request: StrategyIngestRequest,
    db: Session = Depends(get_db),
):

    service = StrategyIngestionService(db)

    return service.ingest(
        organisation_id=request.organisation_id,
        strategy=request.strategy,
    )