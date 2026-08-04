from sqlalchemy.orm import Session
from db.models.process import Process
from db.enums import AutomationPotential


class ProcessRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        organisation_id: int,
        value_chain_stage_id: int,
        name: str,
        business_purpose: str,
        current_challenges: str,
        automation_potential: AutomationPotential | str = AutomationPotential.MEDIUM,
    ) -> Process:
        if isinstance(automation_potential, str):
            automation_potential = AutomationPotential(automation_potential.lower())

        process = Process(
            organisation_id=organisation_id,
            value_chain_stage_id=value_chain_stage_id,
            name=name,
            business_purpose=business_purpose,
            current_challenges=current_challenges,
            automation_potential=automation_potential,
        )
        self.db.add(process)
        self.db.flush()
        return process

    def get(self, process_id: int) -> Process | None:
        return self.db.get(Process, process_id)

    def list_by_stage(self, stage_id: int) -> list[Process]:
        return self.db.query(Process).filter(Process.value_chain_stage_id == stage_id).all()

    def list_by_organisation(self, org_id: int) -> list[Process]:
        return self.db.query(Process).filter(Process.organisation_id == org_id).all()
