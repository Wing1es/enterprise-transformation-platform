from db.repositories.strategy_repository import StrategyRepository


class StrategyService:

    def __init__(self, repository: StrategyRepository):
        self.repository = repository

    def create(self, request):
        return self.repository.create(
            organisation_id=request.organisation_id,
            statement=request.statement,
            horizon_years=request.horizon_years,
        )