from sqlalchemy.orm import Session
from db.models.skill import Skill
from db.models.skill_transition import SkillTransition
from db.enums import SkillClassification


class SkillRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_skill(self, name: str, category: str = "General") -> Skill:
        skill = self.db.query(Skill).filter(Skill.name == name).first()
        if not skill:
            skill = Skill(name=name, category=category)
            self.db.add(skill)
            self.db.flush()
        return skill

    def create_transition(
        self,
        role_id: int,
        activity_id: int,
        current_skill_name: str,
        future_skill_name: str,
        classification: SkillClassification | str,
        ai_impact: str,
        rationale: str,
    ) -> SkillTransition:
        curr_skill = self.get_or_create_skill(current_skill_name)
        fut_skill = self.get_or_create_skill(future_skill_name)

        if isinstance(classification, str):
            classification = SkillClassification(classification.lower())

        transition = SkillTransition(
            role_id=role_id,
            activity_id=activity_id,
            current_skill_id=curr_skill.id,
            future_skill_id=fut_skill.id,
            classification=classification,
            ai_impact=ai_impact,
            rationale=rationale,
        )
        self.db.add(transition)
        self.db.flush()
        return transition

    def list_by_role(self, role_id: int) -> list[SkillTransition]:
        return self.db.query(SkillTransition).filter(SkillTransition.role_id == role_id).all()
