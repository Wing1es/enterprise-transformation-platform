from agents.governance_priority_agent import GovernancePriorityAgent
from db.repositories.ai_opportunity_repository import AIOpportunityRepository
from db.repositories.governance_repository import GovernanceRepository

agent = GovernancePriorityAgent()


def governance_node(state):
    db = state["db"]
    opp_repo = AIOpportunityRepository(db)
    gov_repo = GovernanceRepository(db)

    # Filter opportunities that don't already have governance assessments
    all_opps = opp_repo.list_all()
    unassessed_opps = [opp for opp in all_opps if not opp.governance_assessments]
    target_opps = unassessed_opps if unassessed_opps else all_opps[-3:]  # Cap at 3 max to run fast

    outputs = []
    interrupt_flag = False
    interrupt_details = None

    for opp in target_opps:
        res = agent.run(
            opportunity_title=opp.title,
            description=opp.description,
            benefits=opp.business_benefit,
            risks=[opp.risks] if isinstance(opp.risks, str) else opp.risks,
            api_key=state.get("api_key", ""),
        )
        outputs.append(res)

        # Update priority score in DB
        opp_repo.update_priority(opp.id, res.priority_score, res.priority_rationale)

        # Persist Governance Findings
        for finding in res.governance_findings:
            gov_repo.create(
                ai_opportunity_id=opp.id,
                area=finding.area,
                finding=finding.finding,
                source_type=finding.source_type,
                source_citation=finding.source_citation,
                risk_level=finding.risk_level,
                requires_signoff=finding.requires_signoff,
            )
            if finding.requires_signoff or finding.risk_level == "high":
                interrupt_flag = True
                interrupt_details = {
                    "opportunity_id": opp.id,
                    "opportunity_title": opp.title,
                    "finding": finding.finding,
                    "area": finding.area,
                    "risk_level": finding.risk_level,
                }

    return {
        "governance_results": outputs,
        "interrupt_required": interrupt_flag,
        "interrupt_details": interrupt_details,
    }
