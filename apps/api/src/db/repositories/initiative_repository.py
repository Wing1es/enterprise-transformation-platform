from sqlalchemy.orm import Session
from db.models.initiative import Initiative


class InitiativeRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        organisation_id: int,
        name: str,
        description: str,
        status: str = "Draft",
        priority_score: float | None = None,
    ) -> Initiative:
        initiative = Initiative(
            organisation_id=organisation_id,
            name=name,
            description=description,
            status=status,
            priority_score=priority_score,
        )
        self.db.add(initiative)
        self.db.flush()
        return initiative

    def get(self, initiative_id: int) -> Initiative | None:
        return self.db.get(Initiative, initiative_id)

    def list_by_organisation(self, org_id: int) -> list[Initiative]:
        return self.db.query(Initiative).filter(Initiative.organisation_id == org_id).all()