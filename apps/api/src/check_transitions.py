from db.session import SessionLocal
from db.models.skill_transition import SkillTransition
db = SessionLocal()
print("SkillTransitions:", db.query(SkillTransition).count())
