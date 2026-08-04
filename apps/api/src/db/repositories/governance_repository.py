from sqlalchemy.orm import Session
from db.models.governance_assessment import GovernanceAssessment
from db.enums import GovernanceArea, RiskLevel, SourceType, SignoffStatus


class GovernanceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        ai_opportunity_id: int,
        area: GovernanceArea | str,
        finding: str,
        source_type: SourceType | str,
        source_citation: str,
        risk_level: RiskLevel | str,
        requires_signoff: bool = False,
        signoff_status: SignoffStatus | str = SignoffStatus.PENDING,
    ) -> GovernanceAssessment:
        if isinstance(area, str):
            area = GovernanceArea(area.lower())
        if isinstance(source_type, str):
            source_type = SourceType(source_type.lower())
        if isinstance(risk_level, str):
            risk_level = RiskLevel(risk_level.lower())
        if isinstance(signoff_status, str):
            signoff_status = SignoffStatus(signoff_status.lower())

        assessment = GovernanceAssessment(
            ai_opportunity_id=ai_opportunity_id,
            area=area,
            finding=finding,
            source_type=source_type,
            source_citation=source_citation,
            risk_level=risk_level,
            requires_signoff=requires_signoff,
            signoff_status=signoff_status,
        )
        self.db.add(assessment)
        self.db.flush()
        return assessment

    def list_by_opportunity(self, opportunity_id: int) -> list[GovernanceAssessment]:
        return (
            self.db.query(GovernanceAssessment)
            .filter(GovernanceAssessment.ai_opportunity_id == opportunity_id)
            .all()
        )

    def update_signoff(self, assessment_id: int, status: SignoffStatus | str) -> GovernanceAssessment | None:
        assessment = self.db.get(GovernanceAssessment, assessment_id)
        if assessment:
            if isinstance(status, str):
                status = SignoffStatus(status.lower())
            assessment.signoff_status = status
            self.db.flush()
        return assessment
