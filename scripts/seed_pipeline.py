import os
import sys
import json

# Add apps/api/src to Python path for direct DB seeding
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "../apps/api/src")))

from db.session import SessionLocal
from db.repositories.organisation_repository import OrganisationRepository
from db.repositories.strategy_repository import StrategyRepository
from db.repositories.value_chain_repository import ValueChainRepository
from db.repositories.process_repository import ProcessRepository
from db.repositories.activity_repository import ActivityRepository
from db.repositories.role_repository import RoleRepository
from db.repositories.skill_repository import SkillRepository
from db.repositories.ai_opportunity_repository import AIOpportunityRepository
from db.repositories.governance_repository import GovernanceRepository
from db.repositories.initiative_repository import InitiativeRepository
from db.repositories.edge_repository import EdgeRepository
from services.vector_service import vector_service

SEED_STRATEGY = (
    "Become an AI-first regional retailer within 3 years — improve margin, "
    "reduce stockouts, and personalize customer experience while managing labor costs."
)


def run_offline_seed():
    print("--- Seeding Meridian Retail Group Digital Twin (Offline / Instant Demo Mode) ---")
    db = SessionLocal()

    try:
        # 1. Organisation & Strategy
        org_repo = OrganisationRepository(db)
        strat_repo = StrategyRepository(db)
        orgs = org_repo.list()
        org = orgs[0] if orgs else org_repo.create("Meridian Retail Group", "Retail", "Fictional regional retailer (~150 stores, ~$800M rev)")
        strategy = strat_repo.create(org.id, SEED_STRATEGY, 3)
        print(f"Created Organisation [ID: {org.id}] and Strategy [ID: {strategy.id}]")

        # 2. Value Chain Stages
        val_repo = ValueChainRepository(db)
        stages_data = [
            ("Merchandising & Buying", "Product selection, pricing, vendor negotiation, and assortment planning."),
            ("Supply Chain & Logistics", "Procurement, warehousing, cross-docking, and store replenishment."),
            ("Store Operations", "Store management, shelf stocking, visual merchandising, and customer service."),
            ("Marketing & CX", "Targeted marketing campaigns, loyalty programs, and personalized customer experiences."),
            ("E-Commerce / Omnichannel", "Online store, click-and-collect fulfillment, and mobile app ordering."),
            ("Finance & Workforce", "Financial planning, store staff scheduling, and workforce management."),
        ]
        stage_objs = []
        for idx, (name, desc) in enumerate(stages_data, start=1):
            stage = val_repo.create(org.id, name, desc, idx)
            stage_objs.append(stage)
        print(f"Seeded {len(stage_objs)} Value Chain Stages.")

        # 3. Processes & Activities
        proc_repo = ProcessRepository(db)
        act_repo = ActivityRepository(db)
        processes_data = [
            (stage_objs[0].id, "Vendor Procurement & Contract Negotiation", "High vendor costs and manual negotiation", "high", [
                "Evaluate supplier price lists and historical performance",
                "Negotiate terms and volume discounts with key vendors",
                "Issue purchase orders and track supplier compliance"
            ]),
            (stage_objs[1].id, "Demand Forecasting & Replenishment Planning", "Stockouts during peak seasons and overstock waste", "high", [
                "Analyze historical POS sales and regional demand trends",
                "Generate weekly store inventory replenishment orders",
                "Coordinate warehouse cross-docking schedules"
            ]),
            (stage_objs[2].id, "Store Shelf Stocking & Planogram Compliance", "Labor-intensive inventory checks and misplaced items", "medium", [
                "Audit store shelf inventory against planogram layout",
                "Restock depleted retail displays from backroom inventory",
                "Update digital shelf price tags and promotional signs"
            ]),
            (stage_objs[3].id, "Dynamic Pricing & Promotional Markdown Optimization", "Margin erosion due to static pricing rules", "high", [
                "Monitor competitor pricing and market elasticity",
                "Calculate optimal promotional markdown schedules",
                "Execute price updates across store POS and online channels"
            ]),
            (stage_objs[4].id, "Omnichannel Click-and-Collect Order Fulfillment", "Delayed order pick times and inventory inaccuracies", "medium", [
                "Receive online customer orders for in-store pickup",
                "Pick items from store shelves and pack for customer collection",
                "Hand over orders to customers at designated pickup desk"
            ])
        ]

        proc_objs = []
        act_objs = []
        for stage_id, p_name, p_challenges, p_pot, act_names in processes_data:
            proc = proc_repo.create(org.id, stage_id, p_name, f"Execute {p_name}", p_challenges, p_pot)
            proc_objs.append(proc)
            for idx, a_name in enumerate(act_names, start=1):
                act = act_repo.create(proc.id, a_name, f"Activity: {a_name}", idx)
                act_objs.append(act)
        print(f"Seeded {len(proc_objs)} Processes and {len(act_objs)} Key Activities.")

        # 4. Roles & Skill Transitions
        role_repo = RoleRepository(db)
        skill_repo = SkillRepository(db)
        roles_data = [
            ("Procurement Manager", "Merchandising", "Manages vendor relationships and buying contracts"),
            ("Inventory Controller", "Supply Chain", "Oversees warehouse stock and store replenishment"),
            ("Store Operations Manager", "Store Operations", "Manages daily retail store staff and inventory"),
            ("Category Pricing Analyst", "Marketing", "Optimizes pricing strategies and promotional markdowns"),
            ("Omnichannel Fulfillment Specialist", "E-Commerce", "Coordinates click-and-collect fulfillment")
        ]
        role_objs = []
        for r_name, dept, desc in roles_data:
            role = role_repo.create(org.id, r_name, dept, desc)
            role_objs.append(role)
            for act in act_objs[:3]:
                role_repo.link_activity(role.id, act.id)

        # Skill Transitions
        transitions_data = [
            (role_objs[0].id, act_objs[0].id, "Manual Spreadsheet Costing", "AI-Driven Cost Modeling", "ai_augmented", "AI analyzes vendor pricing data to suggest negotiation limits"),
            (role_objs[1].id, act_objs[3].id, "Historical Trend Analysis", "Predictive Machine Learning Forecasting", "changing", "Transition from manual spreadsheets to automated predictive models"),
            (role_objs[2].id, act_objs[6].id, "Manual Shelf Auditing", "Computer Vision Planogram Verification", "declining", "Camera-based AI replaces manual visual shelf checks"),
            (role_objs[3].id, act_objs[9].id, "Rule-based Pricing", "Dynamic AI Elasticity Pricing", "emerging", "Real-time automated price optimization based on competitor data")
        ]
        for r_id, a_id, curr_s, fut_s, cls, rationale in transitions_data:
            skill_repo.create_transition(r_id, a_id, curr_s, fut_s, cls, f"AI impact on {curr_s}", rationale)

        print(f"Seeded {len(role_objs)} Roles and Skill Transitions.")

        # 5. AI Opportunities & Governance Assessments
        opp_repo = AIOpportunityRepository(db)
        gov_repo = GovernanceRepository(db)
        opps_data = [
            (proc_objs[1].id, act_objs[3].id, "Predictive Machine Learning Demand Forecasting", "Uses historical POS data and regional trends to predict store inventory needs.", ["Machine Learning", "Time Series Models"], "Reduce stockouts by 45% and inventory holding costs by 20%", ["Data Pipeline Failure"], 0.92, "High ROI and low regulatory risk"),
            (proc_objs[2].id, act_objs[6].id, "Computer Vision Shelf Planogram Compliance", "Camera-equipped mobile robots audit retail shelves for misplaced or out-of-stock items.", ["Computer Vision", "Edge AI"], "Improve shelf availability by 30% and reduce staff auditing time", ["Hardware maintenance"], 0.85, "Proven technology with strong operational benefit"),
            (proc_objs[3].id, act_objs[9].id, "Automated Dynamic Markdown Optimization", "Real-time AI pricing engine updates digital price tags based on expiration dates and demand.", ["Dynamic Pricing AI", "Electronic Shelf Labels"], "Increase gross margins by 4.5% across seasonal merchandise", ["Customer Price Perception Risk"], 0.88, "High margin impact"),
            (proc_objs[0].id, act_objs[0].id, "Automated Facial Recognition for Store Loss Prevention", "Real-time biometric surveillance scanning customers for known shoplifting suspects.", ["Biometric Matching", "Computer Vision"], "Reduce shrinkage loss by 35%", ["Biometric Privacy Violation", "EU AI Act High Risk"], 0.45, "High governance risk requires human signoff")
        ]

        for p_id, a_id, title, desc, techs, ben, risks, p_score, p_rat in opps_data:
            opp = opp_repo.create(p_id, title, desc, techs, ben, risks, activity_id=a_id, priority_score=p_score, priority_rationale=p_rat)
            # Add Governance
            requires_signoff = p_score < 0.6
            gov_repo.create(
                ai_opportunity_id=opp.id,
                area="privacy" if requires_signoff else "human_oversight",
                finding="High-risk biometric data collection requires explicit consent under DPDP Act 2023 & EU AI Act" if requires_signoff else "Requires human manager oversight for automated decisions",
                source_type="law_regulation" if requires_signoff else "regulatory_guidance",
                source_citation="EU AI Act Article 14 & India DPDP Act Section 6" if requires_signoff else "NIST AI RMF Core GOVERN 1.2",
                risk_level="high" if requires_signoff else "medium",
                requires_signoff=requires_signoff
            )

            # Add Evidence to Qdrant
            vector_service.add_evidence(
                url="https://meridian-retail.com/evidence/transformation-report",
                title=f"Benchmark Evidence for {title}",
                entity_type="ai_opportunity",
                entity_id=opp.id,
                content=f"Enterprise retail benchmarks confirm that {title} yields {ben} while requiring governance under regulatory frameworks."
            )

        # 6. Initiatives & Dependency Edges
        init_repo = InitiativeRepository(db)
        edge_repo = EdgeRepository(db)
        init1 = init_repo.create(org.id, "AI Demand Forecasting & Replenishment", "Core supply chain transformation initiative", priority_score=0.92)
        init2 = init_repo.create(org.id, "Omnichannel Inventory Sync", "Synchronize store and e-commerce inventory", priority_score=0.88)
        init3 = init_repo.create(org.id, "Store Computer Vision Audit", "Deploy shelf scanning robots across top 50 stores", priority_score=0.85)

        edge_repo.create("initiative", init2.id, "initiative", init1.id, "depends_on", "Omnichannel inventory sync depends on core AI demand forecasting engine")
        edge_repo.create("initiative", init3.id, "initiative", init2.id, "sequenced_before", "Deploy shelf scanning after inventory sync is active")

        db.commit()
        print("--- Offline Seed Pipeline Completed Successfully! ---")
        print(f"PostgreSQL & Qdrant populated with full Meridian Retail Group Digital Twin Data.")

    except Exception as e:
        db.rollback()
        print(f"Error during offline seed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_offline_seed()
