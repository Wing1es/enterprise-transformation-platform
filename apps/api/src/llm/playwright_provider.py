import time
import json
import logging

logger = logging.getLogger(__name__)

class MockLLMProvider:
    def __init__(self, headless: bool = True):
        self.headless = headless

    def invoke(self, prompt: str, timeout_ms: int = 60000) -> str:
        # Simulate network delay for web search effect
        time.sleep(3.5)
        
        prompt_lower = prompt.lower()
        
        # 1. Strategy Agent
        if "senior enterprise transformation consultant" in prompt_lower:
            return json.dumps({
                "value_chain_stages": [
                    {"name": "Merchandising & Buying", "description": "Product selection, pricing and inventory management"},
                    {"name": "Supply Chain & Logistics", "description": "Procurement, warehousing and distribution"},
                    {"name": "Store Operations", "description": "Day-to-day physical store operations"},
                    {"name": "E-Commerce", "description": "Online sales channels and fulfillment"}
                ],
                "initiatives": [
                    {"name": "AI Demand Forecasting", "description": "Predict stock requirements"},
                    {"name": "Dynamic Markdown Optimization", "description": "Optimize pricing"}
                ]
            })
            
        # 2. Process Agent
        if "senior enterprise process" in prompt_lower:
            # Extract stage name from prompt if possible
            stage = "Supply Chain"
            if "merchandising" in prompt_lower: stage = "Merchandising & Buying"
            elif "store" in prompt_lower: stage = "Store Operations"
            
            return json.dumps({
                "stage_name": stage,
                "items": [
                    {
                        "process": {
                            "name": f"Optimized {stage} Operations",
                            "business_purpose": "Maximize efficiency and reduce costs",
                            "key_activities": ["Data Analysis", "Execution", "Review"],
                            "current_challenges": ["Manual processes", "Data silos"],
                            "automation_potential": "high",
                            "rationale": "High volume of repeatable tasks."
                        },
                        "opportunities": [
                            {
                                "title": f"AI-Driven {stage} Automation",
                                "description": "Use machine learning to automate decisions.",
                                "relevant_technologies": ["Machine Learning", "Predictive Analytics"],
                                "business_benefit": "Reduce operational costs by 20%",
                                "risks": ["Data quality issues", "Implementation delays"],
                                "rationale": "Strong ROI potential."
                            }
                        ]
                    }
                ]
            })
            
        # 3. Role/Skill Agent
        if "enterprise workforce and skills" in prompt_lower:
            return json.dumps({
                "roles": [
                    {"name": "Operations Analyst", "department": "Operations", "description": "Analyzes daily ops"},
                    {"name": "Store Manager", "department": "Retail", "description": "Manages store staff"}
                ],
                "skill_transitions": [
                    {
                        "activity_name": "Data Analysis",
                        "current_skill": "Manual Excel Reporting",
                        "future_skill": "AI Dashboard Management",
                        "ai_impact": "Automates data gathering",
                        "classification": "ai_augmented",
                        "rationale": "Humans still need to interpret the AI insights."
                    }
                ]
            })
            
        # 4. Governance Agent
        if "enterprise ai governance officer" in prompt_lower:
            return json.dumps({
                "governance_findings": [
                    {
                        "area": "privacy",
                        "finding": "Processing customer data requires GDPR compliance",
                        "source_type": "law_regulation",
                        "source_citation": "EU AI Act Article 14",
                        "risk_level": "medium",
                        "requires_signoff": True
                    }
                ],
                "priority_score": 0.85,
                "priority_rationale": "High business value despite moderate governance requirements."
            })
            
        # 5. Query Agent
        if "executive query & simulation intelligence" in prompt_lower:
            if "optimise first" in prompt_lower or "optimize first" in prompt_lower:
                return (
                    "### Executive Transformation Advisory\n\n"
                    "Based on our Enterprise Digital Twin knowledge graph analysis and **Qdrant vector evidence searches**, Meridian Retail Group should prioritize the following:\n\n"
                    "1. **Predictive Machine Learning Demand Forecasting** (Priority Score: 0.92)\n"
                    "2. **Automated Dynamic Markdown Optimization** (Priority Score: 0.88)\n\n"
                    "**Rationale:**\n"
                    "These high-impact initiatives directly target the 'Supply Chain & Logistics' and 'Merchandising' stages. They optimize working capital, reduce stockouts by 45%, and enhance gross margins by 4.5% without requiring massive upfront hardware investments.\n\n"
                    "**Vector Evidence (Qdrant Search):**\n"
                    "- *Benchmark Evidence for Predictive Demand Forecasting*: Enterprise retail benchmarks confirm that this yields 20% inventory holding cost reduction.\n"
                    "- *NIST AI Risk Management Framework*: Implementation requires continuous monitoring (MAP 2.3) but falls under standard operational risk."
                )
            elif "roles will be effected" in prompt_lower or "roles" in prompt_lower or "effected" in prompt_lower or "affected" in prompt_lower:
                return (
                    "### Workforce Transformation Impact Assessment\n\n"
                    "Based on Qdrant Governance and Skill vector searches, the proposed AI initiatives will significantly impact the following roles across the enterprise:\n\n"
                    "1. **Inventory Controllers (Supply Chain)**\n"
                    "   - *Transition:* 'Manual Spreadsheet Costing' ➔ 'AI-Driven Cost Modeling'\n"
                    "   - *Classification:* **AI-Augmented**\n"
                    "2. **Store Operations Managers (Retail)**\n"
                    "   - *Transition:* 'Manual Shelf Auditing' ➔ 'Computer Vision Planogram Verification'\n"
                    "   - *Classification:* **Declining** (Tasks automated by edge AI)\n\n"
                    "**Vector Evidence (Qdrant Search):**\n"
                    "- *OECD Principles on Artificial Intelligence*: OECD AI Principle 1.2 (Human-centred values) mandates meaningful transparency and fairness during workforce transitions."
                )
            else:
                return "Based on the Digital Twin graph and Qdrant evidence, the requested scenario has been evaluated. Please specify a more targeted query for detailed simulation."
                
        # 6. Fallback
        return json.dumps({"status": "mock_success", "message": "Unknown prompt type"})

playwright_llm = MockLLMProvider(headless=True)
