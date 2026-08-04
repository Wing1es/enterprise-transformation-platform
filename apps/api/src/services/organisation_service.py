from db.repositories.organisation_repository import OrganisationRepository


class OrganisationService:

    def __init__(
        self,
        repository: OrganisationRepository,
    ):
        self.repository = repository

    def create(self, request):
        return self.repository.create_or_update(
            name=request.name,
            industry=request.industry,
            description=getattr(request, 'description', None),
        )

    def get(self, organisation_id: int):
        return self.repository.get(organisation_id)

    def list(self):
        return self.repository.list()