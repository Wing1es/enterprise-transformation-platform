from sqlalchemy import Enum, ForeignKey, Float, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin


class AIOpportunity(TimestampMixin, Base):
    __tablename__ = "ai_opportunities"

    id: Mapped[int] = mapped_column(primary_key=True)

    process_id: Mapped[int] = mapped_column(
        ForeignKey("processes.id", ondelete="CASCADE")
    )

    activity_id: Mapped[int | None] = mapped_column(
        ForeignKey("activities.id", ondelete="CASCADE"),
        nullable=True,
    )

    title: Mapped[str] = mapped_column(String(255))

    description: Mapped[str] = mapped_column(Text)

    technologies: Mapped[str] = mapped_column(Text)

    business_benefit: Mapped[str] = mapped_column(Text)

    risks: Mapped[str] = mapped_column(Text)

    priority_score: Mapped[float | None] = mapped_column(Float)

    priority_rationale: Mapped[str | None] = mapped_column(Text)

    process = relationship(
        "Process",
        back_populates="ai_opportunities",
    )

    activity = relationship(
        "Activity",
        back_populates="ai_opportunities",
    )

    governance_assessments = relationship(
        "GovernanceAssessment",
        back_populates="ai_opportunity",
        cascade="all, delete-orphan",
    )