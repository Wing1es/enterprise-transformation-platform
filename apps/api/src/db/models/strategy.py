from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin


class Strategy(TimestampMixin, Base):
    __tablename__ = "strategies"

    id: Mapped[int] = mapped_column(primary_key=True)

    organisation_id: Mapped[int] = mapped_column(
        ForeignKey("organisations.id", ondelete="CASCADE")
    )

    statement: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    horizon_years: Mapped[int] = mapped_column(
        Integer,
        default=3,
    )

    organisation = relationship(
        "Organisation",
        back_populates="strategies",
    )