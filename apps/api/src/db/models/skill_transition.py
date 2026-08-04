from sqlalchemy import Enum, ForeignKey, Text

from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.enums import SkillClassification
from db.mixins import TimestampMixin


class SkillTransition(TimestampMixin, Base):
    __tablename__ = "skill_transitions"

    id: Mapped[int] = mapped_column(primary_key=True)

    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE")
    )

    activity_id: Mapped[int] = mapped_column(
        ForeignKey("activities.id", ondelete="CASCADE")
    )

    current_skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id")
    )

    future_skill_id: Mapped[int] = mapped_column(
        ForeignKey("skills.id")
    )

    classification: Mapped[SkillClassification] = mapped_column(
        Enum(SkillClassification),
        nullable=False,
    )

    ai_impact: Mapped[str] = mapped_column(Text)

    rationale: Mapped[str] = mapped_column(Text)

    role = relationship(
        "Role",
        back_populates="skill_transitions",
    )

    current_skill = relationship(
        "Skill",
        foreign_keys=[current_skill_id],
        back_populates="current_transitions",
    )

    future_skill = relationship(
        "Skill",
        foreign_keys=[future_skill_id],
        back_populates="future_transitions",
    )

    activity = relationship(
        "Activity",
        back_populates="skill_transitions",
    )