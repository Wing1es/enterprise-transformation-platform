from pydantic import BaseModel, Field
from typing import Any, Literal


class SimulateRequest(BaseModel):
    action: Literal["automate_activity", "delay_initiative"]
    target_id: int
    params: dict[str, Any] = Field(default_factory=dict)


class SimulationDiff(BaseModel):
    scenario: str
    target_entity: str
    changed_nodes: list[dict[str, Any]] = Field(default_factory=list)
    dimmed_nodes: list[dict[str, Any]] = Field(default_factory=list)
    changed_edges: list[dict[str, Any]] = Field(default_factory=list)
    summary: str
