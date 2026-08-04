from sqlalchemy.orm import Session

from db.models.strategy import Strategy


class StrategyRepository:

    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        organisation_id: int,
        statement: str,
        horizon_years: int,
    ):
        strategy = Strategy(
            organisation_id=organisation_id,
            statement=statement,
            horizon_years=horizon_years,
        )

        self.db.add(strategy)
        self.db.flush()

        return strategy