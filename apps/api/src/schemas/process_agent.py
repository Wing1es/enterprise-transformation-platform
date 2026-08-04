from pydantic import BaseModel, Field, field_validator


class ProcessExtraction(BaseModel):
    name: str
    business_purpose: str
    key_activities: list[str] = Field(default_factory=list)
    current_challenges: list[str] = Field(default_factory=list)
    automation_potential: str = "medium"
    rationale: str = ""

    @field_validator("automation_potential", mode="before")
    @classmethod
    def normalize_automation_potential(cls, v: str) -> str:
        if not isinstance(v, str):
            return "medium"
        s = v.lower().strip()
        if s in ("low", "medium", "high"):
            return s
        if "high" in s:
            return "high"
        if "low" in s:
            return "low"
        return "medium"


class AIOpportunityExtraction(BaseModel):
    title: str
    description: str
    relevant_technologies: list[str] = Field(default_factory=list)
    business_benefit: str
    risks: list[str] = Field(default_factory=list)
    rationale: str = ""


class ProcessWithOpportunities(BaseModel):
    process: ProcessExtraction
    opportunities: list[AIOpportunityExtraction] = Field(default_factory=list)


class StageProcesses(BaseModel):
    stage_name: str
    items: list[ProcessWithOpportunities] = Field(default_factory=list)