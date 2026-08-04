from datetime import datetime
from sqlalchemy.orm import Session
from db.models.evidence_source import EvidenceSource


class EvidenceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        url: str,
        title: str,
        entity_type: str,
        entity_id: int,
    ) -> EvidenceSource:
        source = EvidenceSource(
            url=url,
            title=title,
            entity_type=entity_type,
            entity_id=entity_id,
            retrieved_at=datetime.utcnow(),
        )
        self.db.add(source)
        self.db.flush()
        return source

    def get(self, evidence_id: int) -> EvidenceSource | None:
        return self.db.get(EvidenceSource, evidence_id)
