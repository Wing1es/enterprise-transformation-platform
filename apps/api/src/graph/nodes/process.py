from agents.process_opportunity_agent import ProcessOpportunityAgent
from db.repositories.value_chain_repository import ValueChainRepository
from db.repositories.process_repository import ProcessRepository
from db.repositories.activity_repository import ActivityRepository
from db.repositories.ai_opportunity_repository import AIOpportunityRepository

agent = ProcessOpportunityAgent()


def process_node(state):
    db = state["db"]
    org_id = state["organisation_id"]

    val_repo = ValueChainRepository(db)
    proc_repo = ProcessRepository(db)
    act_repo = ActivityRepository(db)
    opp_repo = AIOpportunityRepository(db)

    stages = val_repo.list_by_organisation(org_id)
    outputs = []

    # Limit to top 3 stages for snappy execution
    for stage in stages[:3]:
        try:
            res = agent.run(stage.name, state["strategy"])
            outputs.append(res)

            for item in res.items:
                p_data = item.process
                proc = proc_repo.create(
                    organisation_id=org_id,
                    value_chain_stage_id=stage.id,
                    name=p_data.name,
                    business_purpose=p_data.business_purpose,
                    current_challenges=", ".join(p_data.current_challenges),
                    automation_potential=p_data.automation_potential,
                )

                # Persist activities
                act_ids = []
                for idx, act_name in enumerate(p_data.key_activities, start=1):
                    act = act_repo.create(
                        process_id=proc.id,
                        name=act_name,
                        sequence_order=idx,
                    )
                    act_ids.append(act.id)

                # Persist opportunities
                for opp_data in item.opportunities:
                    opp_repo.create(
                        process_id=proc.id,
                        title=opp_data.title,
                        description=opp_data.description,
                        technologies=opp_data.relevant_technologies,
                        business_benefit=opp_data.business_benefit,
                        risks=opp_data.risks,
                        activity_id=act_ids[0] if act_ids else None,
                    )
        except Exception as e:
            print(f"Warning: process node failed for stage {stage.name}: {e}")

    return {"process_results": outputs}