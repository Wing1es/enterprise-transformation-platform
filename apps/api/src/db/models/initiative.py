from sqlalchemy import Float, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base
from db.mixins import TimestampMixin


class Initiative(TimestampMixin, Base):
    __tablename__ = "initiatives"

    id: Mapped[int] = mapped_column(primary_key=True)

    organisation_id: Mapped[int] = mapped_column(
        ForeignKey("organisations.id", ondelete="CASCADE")
    )

    name: Mapped[str] = mapped_column(String(255))

    description: Mapped[str] = mapped_column(Text)

    status: Mapped[str] = mapped_column(String(100))

    priority_score: Mapped[float | None] = mapped_column(Float)

    organisation = relationship(
        "Organisation",
        back_populates="initiatives",
    )