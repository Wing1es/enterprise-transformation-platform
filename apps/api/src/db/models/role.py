from sqlalchemy import String, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin


class Role(TimestampMixin, Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True)

    organisation_id: Mapped[int] = mapped_column(
        ForeignKey("organisations.id", ondelete="CASCADE")
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )

    department: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(Text)

    organisation = relationship(
        "Organisation",
        back_populates="roles",
    )

    role_activities = relationship(
        "RoleActivity",
        back_populates="role",
        cascade="all, delete-orphan",
    )

    skill_transitions = relationship(
        "SkillTransition",
        back_populates="role",
        cascade="all, delete-orphan",
    )