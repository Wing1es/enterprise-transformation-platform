from sqlalchemy.orm import Session
from db.models.activity import Activity


class ActivityRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(
        self,
        process_id: int,
        name: str,
        description: str | None = None,
        sequence_order: int = 1,
    ) -> Activity:
        activity = Activity(
            process_id=process_id,
            name=name,
            description=description,
            sequence_order=sequence_order,
        )
        self.db.add(activity)
        self.db.flush()
        return activity

    def get(self, activity_id: int) -> Activity | None:
        return self.db.get(Activity, activity_id)

    def list_by_process(self, process_id: int) -> list[Activity]:
        return (
            self.db.query(Activity)
            .filter(Activity.process_id == process_id)
            .order_by(Activity.sequence_order)
            .all()
        )
