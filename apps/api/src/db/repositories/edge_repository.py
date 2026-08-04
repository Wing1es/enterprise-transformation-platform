from sqlalchemy.orm import Session
from db.models.edge import Edge


class EdgeRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        from_type: str,
        from_id: int,
        to_type: str,
        to_id: int,
        relationship: str,
        rationale: str | None = None,
        source_evidence_id: int | None = None,
    ) -> Edge:
        existing = (
            self.db.query(Edge)
            .filter(
                Edge.from_type == from_type,
                Edge.from_id == from_id,
                Edge.to_type == to_type,
                Edge.to_id == to_id,
                Edge.relationship == relationship,
            )
            .first()
        )
        if existing:
            return existing

        edge = Edge(
            from_type=from_type,
            from_id=from_id,
            to_type=to_type,
            to_id=to_id,
            relationship=relationship,
            rationale=rationale,
            source_evidence_id=source_evidence_id,
        )
        self.db.add(edge)
        self.db.flush()
        return edge

    def list_all(self) -> list[Edge]:
        return self.db.query(Edge).all()

    def list_by_entity(self, entity_type: str, entity_id: int) -> list[Edge]:
        return (
            self.db.query(Edge)
            .filter(
                ((Edge.from_type == entity_type) & (Edge.from_id == entity_id))
                | ((Edge.to_type == entity_type) & (Edge.to_id == entity_id))
            )
            .all()
        )
