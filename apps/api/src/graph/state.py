from typing import TypedDict, Any
from schemas.strategy_agent import StrategyExtraction
from schemas.process_agent import StageProcesses


class StrategyState(TypedDict, total=False):
    db: Any
    organisation_id: int
    strategy: str

    strategy_result: StrategyExtraction | None
    process_results: list[StageProcesses]
    role_results: list[Any]
    governance_results: list[Any]
    
    interrupt_required: bool
    interrupt_details: dict[str, Any] | None