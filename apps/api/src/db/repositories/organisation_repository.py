from sqlalchemy.orm import Session
from db.models.organisation import Organisation


class OrganisationRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        name: str,
        industry: str,
        description: str | None = None,
    ) -> Organisation:
        return self.create_or_update(name=name, industry=industry, description=description)

    def create_or_update(
        self,
        name: str,
        industry: str,
        description: str | None = None,
    ) -> Organisation:
        org = self.db.query(Organisation).first()
        if org:
            if name:
                org.name = name
            if industry:
                org.industry = industry
            if description:
                org.description = description
            self.db.commit()
            self.db.refresh(org)
            return org

        organisation = Organisation(
            name=name,
            industry=industry,
            description=description,
        )
        self.db.add(organisation)
        self.db.commit()
        self.db.refresh(organisation)
        return organisation

    def get(self, organisation_id: int):
        return self.db.get(Organisation, organisation_id)

    def list(self):
        return self.db.query(Organisation).all()