from sqlalchemy import String

from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base


class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
    )

    category: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    current_transitions = relationship(
        "SkillTransition",
        foreign_keys="SkillTransition.current_skill_id",
        back_populates="current_skill",
    )

    future_transitions = relationship(
        "SkillTransition",
        foreign_keys="SkillTransition.future_skill_id",
        back_populates="future_skill",
    )