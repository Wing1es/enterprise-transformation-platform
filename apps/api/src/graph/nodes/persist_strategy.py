from db.repositories.strategy_repository import StrategyRepository
from db.repositories.value_chain_repository import ValueChainRepository
from db.repositories.initiative_repository import InitiativeRepository


def persist_strategy_node(state):

    db = state["db"]

    strategy_repo = StrategyRepository(db)

    value_chain_repo = ValueChainRepository(db)

    initiative_repo = InitiativeRepository(db)

    result = state["strategy_result"]

    strategy = strategy_repo.create(
        organisation_id=state["organisation_id"],
        statement=state["strategy"],
        horizon_years=3,
    )

    for i, stage in enumerate(
        result.value_chain_stages,
        start=1,
    ):

        value_chain_repo.create(
            organisation_id=state["organisation_id"],
            name=stage.name,
            description=stage.description,
            sequence_order=i,
        )

    for initiative in result.initiatives:

        initiative_repo.create(
            organisation_id=state["organisation_id"],
            name=initiative.name,
            description=initiative.description,
        )

    return {
        "strategy_id": strategy.id
    }