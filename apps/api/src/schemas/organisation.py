from pydantic import BaseModel, ConfigDict


class OrganisationCreate(BaseModel):
    name: str
    industry: str
    description: str | None = None


class OrganisationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    industry: str
    description: str | None