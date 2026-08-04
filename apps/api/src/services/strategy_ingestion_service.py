from sqlalchemy.orm import Session

from agents.strategy_agent import StrategyAgent

from db.repositories.strategy_repository import StrategyRepository
from db.repositories.value_chain_repository import ValueChainRepository
from db.repositories.initiative_repository import InitiativeRepository

from graph.builder import graph


class StrategyIngestionService:

    def __init__(self, db: Session):

        self.db = db

        self.agent = StrategyAgent()

        self.strategy_repo = StrategyRepository(db)

        self.value_chain_repo = ValueChainRepository(db)

        self.initiative_repo = InitiativeRepository(db)

    def ingest(
        self,
        organisation_id: int,
        strategy: str,
    ):
        try:

            strategy_row = self.strategy_repo.create(
                organisation_id=organisation_id,
                statement=strategy,
                horizon_years=3,
            )

            state = graph.invoke(
                {
                    "strategy": strategy
                }
            )

            result = state["result"]

            for index, stage in enumerate(
                result.value_chain_stages,
                start=1,
            ):
                self.value_chain_repo.create(
                    organisation_id=organisation_id,
                    name=stage.name,
                    description=stage.description,
                    sequence_order=index,
                )

            for initiative in result.initiatives:
                self.initiative_repo.create(
                    organisation_id=organisation_id,
                    name=initiative.name,
                    description=initiative.description,
                )

            self.db.commit()

            return {
                "strategy_id": strategy_row.id,
                "value_chain_stage_count": len(result.value_chain_stages),
                "initiative_count": len(result.initiatives),
            }

        except Exception:
            self.db.rollback()
            raise