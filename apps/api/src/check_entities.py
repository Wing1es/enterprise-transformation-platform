from db.session import SessionLocal
from db.models.value_chain_stage import ValueChainStage
from db.models.process import Process
from db.models.activity import Activity
from db.models.role import Role
db = SessionLocal()
print("Stages:", db.query(ValueChainStage).count())
print("Processes:", db.query(Process).count())
print("Activities:", db.query(Activity).count())
print("Roles:", db.query(Role).count())
