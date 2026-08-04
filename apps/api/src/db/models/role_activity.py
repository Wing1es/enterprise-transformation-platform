from sqlalchemy import ForeignKey

from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.base import Base


class RoleActivity(Base):
    __tablename__ = "role_activities"

    role_id: Mapped[int] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"),
        primary_key=True,
    )

    activity_id: Mapped[int] = mapped_column(
        ForeignKey("activities.id", ondelete="CASCADE"),
        primary_key=True,
    )

    role = relationship(
        "Role",
        back_populates="role_activities",
    )

    activity = relationship(
        "Activity",
        back_populates="role_activities",
    )