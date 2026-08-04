from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin


class Activity(TimestampMixin, Base):
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(primary_key=True)

    process_id: Mapped[int] = mapped_column(
        ForeignKey("processes.id", ondelete="CASCADE")
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text
    )

    sequence_order: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    process = relationship(
        "Process",
        back_populates="activities",
    )

    role_activities = relationship(
        "RoleActivity",
        back_populates="activity",
        cascade="all, delete-orphan",
    )

    ai_opportunities = relationship(
        "AIOpportunity",
        back_populates="activity",
    )

    skill_transitions = relationship(
        "SkillTransition",
        back_populates="activity",
    )