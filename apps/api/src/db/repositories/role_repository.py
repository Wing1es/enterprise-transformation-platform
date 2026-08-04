from sqlalchemy.orm import Session
from db.models.role import Role
from db.models.role_activity import RoleActivity


class RoleRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        organisation_id: int,
        name: str,
        department: str,
        description: str | None = None,
    ) -> Role:
        existing = (
            self.db.query(Role)
            .filter(Role.organisation_id == organisation_id, Role.name == name)
            .first()
        )
        if existing:
            return existing

        role = Role(
            organisation_id=organisation_id,
            name=name,
            department=department,
            description=description,
        )
        self.db.add(role)
        self.db.flush()
        return role

    def link_activity(self, role_id: int, activity_id: int) -> RoleActivity:
        existing = (
            self.db.query(RoleActivity)
            .filter(RoleActivity.role_id == role_id, RoleActivity.activity_id == activity_id)
            .first()
        )
        if existing:
            return existing

        link = RoleActivity(role_id=role_id, activity_id=activity_id)
        self.db.add(link)
        self.db.flush()
        return link

    def get(self, role_id: int) -> Role | None:
        return self.db.get(Role, role_id)

    def list_by_organisation(self, org_id: int) -> list[Role]:
        return self.db.query(Role).filter(Role.organisation_id == org_id).all()
