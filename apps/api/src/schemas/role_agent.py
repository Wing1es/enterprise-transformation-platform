from pydantic import BaseModel, Field, field_validator

ALLOWED_CLASSIFICATIONS = {
    "emerging",
    "increasing",
    "ai_augmented",
    "changing",
    "declining",
    "enduring_human",
}


class RoleExtraction(BaseModel):
    name: str
    department: str = "Operations"
    description: str = ""


class SkillTransitionExtraction(BaseModel):
    activity_name: str = ""
    current_skill: str
    future_skill: str
    ai_impact: str
    classification: str = "ai_augmented"
    rationale: str = ""

    @field_validator("classification", mode="before")
    @classmethod
    def normalize_classification(cls, v: str) -> str:
        if not isinstance(v, str):
            return "ai_augmented"
        s = v.lower().strip().replace(" ", "_")
        if s in ALLOWED_CLASSIFICATIONS:
            return s
        if "emerg" in s:
            return "emerging"
        if "increas" in s:
            return "increasing"
        if "declin" in s or "automat" in s:
            return "declining"
        if "human" in s or "endur" in s:
            return "enduring_human"
        if "change" in s or "pivot" in s:
            return "changing"
        return "ai_augmented"


class RoleSkillOutput(BaseModel):
    roles: list[RoleExtraction] = Field(default_factory=list)
    skill_transitions: list[SkillTransitionExtraction] = Field(default_factory=list)
