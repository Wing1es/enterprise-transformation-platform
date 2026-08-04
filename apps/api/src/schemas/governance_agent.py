from pydantic import BaseModel, Field, field_validator
from typing import Literal

ALLOWED_AREAS = {
    "data",
    "privacy",
    "bias_fairness",
    "human_oversight",
    "explainability",
    "security",
    "decision_impact",
    "regulatory_exposure",
    "model_risk",
    "monitoring",
}


class GovernanceFinding(BaseModel):
    area: str = "human_oversight"
    finding: str = "Governance oversight required"
    source_type: str = "industry_standard"
    source_citation: str = "NIST AI RMF 1.0 / EU AI Act Article 14"
    risk_level: str = "medium"
    requires_signoff: bool = False

    @field_validator("source_type", mode="before")
    @classmethod
    def normalize_source_type(cls, v: str) -> str:
        if not isinstance(v, str):
            return "industry_standard"
        s = v.lower().strip()
        if s in ("law_regulation", "regulatory_guidance", "industry_standard"):
            return s
        if "law" in s or "regulat" in s or "act" in s:
            return "law_regulation"
        if "guid" in s or "framework" in s or "nist" in s or "oecd" in s:
            return "regulatory_guidance"
        return "industry_standard"

    @field_validator("risk_level", mode="before")
    @classmethod
    def normalize_risk_level(cls, v: str) -> str:
        if not isinstance(v, str):
            return "medium"
        s = v.lower().strip()
        if s in ("high", "critical", "severe"):
            return "high"
        if s in ("low", "minimal", "none"):
            return "low"
        return "medium"

    @field_validator("area", mode="before")
    @classmethod
    def normalize_area(cls, v: str) -> str:
        if not isinstance(v, str):
            return "human_oversight"
        s = v.lower().strip().replace(" ", "_")
        if s in ALLOWED_AREAS:
            return s
        if "privac" in s:
            return "privacy"
        if "data" in s:
            return "data"
        if "bias" in s or "fair" in s:
            return "bias_fairness"
        if "oversight" in s or "human" in s:
            return "human_oversight"
        if "explain" in s:
            return "explainability"
        if "secur" in s:
            return "security"
        if "decision" in s or "impact" in s:
            return "decision_impact"
        if "regulat" in s or "expos" in s:
            return "regulatory_exposure"
        if "model" in s or "risk" in s:
            return "model_risk"
        return "monitoring"


class GovernanceAndPriorityOutput(BaseModel):
    governance_findings: list[GovernanceFinding] = Field(default_factory=list)
    priority_score: float = 0.5
    priority_rationale: str = ""
