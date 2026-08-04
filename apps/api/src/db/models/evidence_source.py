from sqlalchemy import String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from datetime import datetime

from db.base import Base


class EvidenceSource(Base):
    __tablename__ = "evidence_sources"

    id: Mapped[int] = mapped_column(primary_key=True)

    url: Mapped[str] = mapped_column(Text)

    title: Mapped[str] = mapped_column(String(500))

    retrieved_at: Mapped[datetime] = mapped_column(DateTime)

    entity_type: Mapped[str] = mapped_column(String(100))

    entity_id: Mapped[int]