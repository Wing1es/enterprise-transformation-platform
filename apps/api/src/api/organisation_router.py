from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db.session import get_db
from db.repositories.organisation_repository import OrganisationRepository
from services.organisation_service import OrganisationService
from schemas.organisation import (
    OrganisationCreate,
    OrganisationResponse,
)

router = APIRouter(
    prefix="/organisations",
    tags=["Organisation"],
)


@router.get("/current", response_model=OrganisationResponse)
def get_current_organisation(db: Session = Depends(get_db)):
    repository = OrganisationRepository(db)
    orgs = repository.list()
    if orgs and len(orgs) > 0:
        return orgs[0]
    return repository.create_or_update(name="Transformation Retail Group", industry="Retail & Commerce")


@router.post("", response_model=OrganisationResponse)
def create_or_update_organisation(
    request: OrganisationCreate,
    db: Session = Depends(get_db),
):
    repository = OrganisationRepository(db)
    service = OrganisationService(repository)
    return service.create(request)