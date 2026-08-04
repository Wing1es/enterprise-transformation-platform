from pydantic import BaseModel, ConfigDict


class StrategyCreate(BaseModel):
    organisation_id: int
    statement: str
    horizon_years: int = 3


class StrategyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    organisation_id: int
    statement: str
    horizon_years: int