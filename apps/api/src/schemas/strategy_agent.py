from pydantic import BaseModel, Field


class ValueChainStage(BaseModel):
    name: str
    description: str = ""


class Initiative(BaseModel):
    name: str
    description: str = ""


class StrategyExtraction(BaseModel):
    value_chain_stages: list[ValueChainStage] = Field(default_factory=list)
    initiatives: list[Initiative] = Field(default_factory=list)