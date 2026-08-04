from sqlalchemy.orm import Session
from db.models.value_chain_stage import ValueChainStage


class ValueChainRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        organisation_id: int,
        name: str,
        description: str,
        sequence_order: int,
    ) -> ValueChainStage:
        stage = ValueChainStage(
            organisation_id=organisation_id,
            name=name,
            description=description,
            sequence_order=sequence_order,
        )
        self.db.add(stage)
        self.db.flush()
        return stage

    def list_by_organisation(self, organisation_id: int) -> list[ValueChainStage]:
        return (
            self.db.query(ValueChainStage)
            .filter(ValueChainStage.organisation_id == organisation_id)
            .order_by(ValueChainStage.sequence_order)
            .all()
        )

    def list_all(self) -> list[ValueChainStage]:
        return self.db.query(ValueChainStage).all()