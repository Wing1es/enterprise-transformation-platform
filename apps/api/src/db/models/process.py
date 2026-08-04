from sqlalchemy import Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.enums import AutomationPotential
from db.mixins import TimestampMixin


class Process(TimestampMixin, Base):
    __tablename__ = "processes"

    id: Mapped[int] = mapped_column(primary_key=True)

    organisation_id: Mapped[int] = mapped_column(
        ForeignKey("organisations.id", ondelete="CASCADE")
    )

    value_chain_stage_id: Mapped[int] = mapped_column(
        ForeignKey("value_chain_stages.id", ondelete="CASCADE")
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    business_purpose: Mapped[str] = mapped_column(
        Text,
    )

    current_challenges: Mapped[str] = mapped_column(
        Text,
    )

    automation_potential: Mapped[AutomationPotential] = mapped_column(
        Enum(AutomationPotential),
        nullable=False,
    )

    organisation = relationship(
        "Organisation",
        back_populates="processes",
    )

    value_chain_stage = relationship(
        "ValueChainStage",
        back_populates="processes",
    )

    activities = relationship(
        "Activity",
        back_populates="process",
        cascade="all, delete-orphan",
    )

    ai_opportunities = relationship(
        "AIOpportunity",
        back_populates="process",
        cascade="all, delete-orphan",
    )