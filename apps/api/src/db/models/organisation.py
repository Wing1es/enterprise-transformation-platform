from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin


class Organisation(TimestampMixin, Base):
    __tablename__ = "organisations"

    id: Mapped[int] = mapped_column(primary_key=True)

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    industry: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    strategies = relationship(
        "Strategy",
        back_populates="organisation",
        cascade="all, delete-orphan",
    )

    value_chain_stages = relationship(
        "ValueChainStage",
        back_populates="organisation",
        cascade="all, delete-orphan",
    )

    processes = relationship(
        "Process",
        back_populates="organisation",
        cascade="all, delete-orphan",
    )

    roles = relationship(
        "Role",
        back_populates="organisation",
        cascade="all, delete-orphan",
    )

    initiatives = relationship(
        "Initiative",
        back_populates="organisation",
        cascade="all, delete-orphan",
    )