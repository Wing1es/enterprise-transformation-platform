import json
from sqlalchemy.orm import Session
from db.models.ai_opportunity import AIOpportunity


class AIOpportunityRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        process_id: int,
        title: str,
        description: str,
        technologies: list[str] | str,
        business_benefit: str,
        risks: list[str] | str,
        activity_id: int | None = None,
        priority_score: float | None = None,
        priority_rationale: str | None = None,
    ) -> AIOpportunity:
        tech_str = json.dumps(technologies) if isinstance(technologies, list) else technologies
        risks_str = json.dumps(risks) if isinstance(risks, list) else risks

        opportunity = AIOpportunity(
            process_id=process_id,
            activity_id=activity_id,
            title=title,
            description=description,
            technologies=tech_str,
            business_benefit=business_benefit,
            risks=risks_str,
            priority_score=priority_score,
            priority_rationale=priority_rationale,
        )
        self.db.add(opportunity)
        self.db.flush()
        return opportunity

    def update_priority(self, opportunity_id: int, score: float, rationale: str):
        opp = self.db.get(AIOpportunity, opportunity_id)
        if opp:
            opp.priority_score = score
            opp.priority_rationale = rationale
            self.db.flush()
        return opp

    def get(self, opportunity_id: int) -> AIOpportunity | None:
        return self.db.get(AIOpportunity, opportunity_id)

    def list_all(self) -> list[AIOpportunity]:
        return self.db.query(AIOpportunity).all()

