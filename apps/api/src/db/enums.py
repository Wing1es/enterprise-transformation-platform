from enum import Enum


class AutomationPotential(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class SkillClassification(str, Enum):
    EMERGING = "emerging"
    INCREASING = "increasing"
    AI_AUGMENTED = "ai_augmented"
    CHANGING = "changing"
    DECLINING = "declining"
    ENDURING_HUMAN = "enduring_human"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class GovernanceArea(str, Enum):
    DATA = "data"
    PRIVACY = "privacy"
    BIAS_FAIRNESS = "bias_fairness"
    HUMAN_OVERSIGHT = "human_oversight"
    EXPLAINABILITY = "explainability"
    SECURITY = "security"
    DECISION_IMPACT = "decision_impact"
    REGULATORY_EXPOSURE = "regulatory_exposure"
    MODEL_RISK = "model_risk"
    MONITORING = "monitoring"


class SourceType(str, Enum):
    LAW_REGULATION = "law_regulation"
    REGULATORY_GUIDANCE = "regulatory_guidance"
    INDUSTRY_STANDARD = "industry_standard"


class SignoffStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"