from agents.role_skill_agent import RoleSkillAgent
from db.repositories.process_repository import ProcessRepository
from db.repositories.activity_repository import ActivityRepository
from db.repositories.role_repository import RoleRepository
from db.repositories.skill_repository import SkillRepository

agent = RoleSkillAgent()


def role_node(state):
    db = state["db"]
    org_id = state["organisation_id"]

    proc_repo = ProcessRepository(db)
    act_repo = ActivityRepository(db)
    role_repo = RoleRepository(db)
    skill_repo = SkillRepository(db)

    processes = proc_repo.list_by_organisation(org_id)
    # Process latest 2 processes to avoid multi-minute LLM loops
    target_processes = processes[-2:] if processes else []
    outputs = []

    for proc in target_processes:
        activities = act_repo.list_by_process(proc.id)
        if not activities:
            continue
        act_names = [a.name for a in activities]
        res = agent.run(proc.name, act_names, api_key=state.get("api_key", ""))
        outputs.append(res)

        # Persist Roles
        role_map = {}
        for r_data in res.roles:
            role = role_repo.create(
                organisation_id=org_id,
                name=r_data.name,
                department=r_data.department,
                description=r_data.description,
            )
            role_map[role.name] = role
            # Link role to activities
            for a in activities:
                role_repo.link_activity(role.id, a.id)

        # Persist Skill Transitions
        default_role = list(role_map.values())[0] if role_map else None
        if default_role:
            for st in res.skill_transitions:
                act = activities[0]
                skill_repo.create_transition(
                    role_id=default_role.id,
                    activity_id=act.id,
                    current_skill_name=st.current_skill,
                    future_skill_name=st.future_skill,
                    classification=st.classification,
                    ai_impact=st.ai_impact,
                    rationale=st.rationale,
                )

    return {"role_results": outputs}
