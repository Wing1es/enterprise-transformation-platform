from pydantic import BaseModel


class StrategyIngestRequest(BaseModel):
    organisation_id: int
    strategy: str