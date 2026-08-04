from sqlalchemy import ForeignKey, String, Text

from sqlalchemy.orm import Mapped, mapped_column

from db.base import Base
from db.mixins import TimestampMixin


class Edge(TimestampMixin, Base):
    __tablename__ = "edges"

    id: Mapped[int] = mapped_column(primary_key=True)

    from_type: Mapped[str] = mapped_column(String(100))

    from_id: Mapped[int]

    to_type: Mapped[str] = mapped_column(String(100))

    to_id: Mapped[int]

    relationship: Mapped[str] = mapped_column(String(100))

    rationale: Mapped[str | None] = mapped_column(Text)

    source_evidence_id: Mapped[int | None] = mapped_column(
        ForeignKey("evidence_sources.id"),
        nullable=True,
    )