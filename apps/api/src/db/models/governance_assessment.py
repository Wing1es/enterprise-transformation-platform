from sqlalchemy import Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.enums import (
    GovernanceArea,
    RiskLevel,
    SourceType,
    SignoffStatus,
)
from db.mixins import TimestampMixin


class GovernanceAssessment(TimestampMixin, Base):
    __tablename__ = "governance_assessments"

    id: Mapped[int] = mapped_column(primary_key=True)

    ai_opportunity_id: Mapped[int] = mapped_column(
        ForeignKey("ai_opportunities.id", ondelete="CASCADE")
    )

    area: Mapped[GovernanceArea] = mapped_column(Enum(GovernanceArea))

    finding: Mapped[str] = mapped_column(Text)

    source_type: Mapped[SourceType] = mapped_column(Enum(SourceType))

    source_citation: Mapped[str] = mapped_column(Text)

    risk_level: Mapped[RiskLevel] = mapped_column(Enum(RiskLevel))

    requires_signoff: Mapped[bool]

    signoff_status: Mapped[SignoffStatus] = mapped_column(
        Enum(SignoffStatus),
        default=SignoffStatus.PENDING,
    )

    ai_opportunity = relationship(
        "AIOpportunity",
        back_populates="governance_assessments",
    )