import json
import re
from llm.provider import llm
from schemas.process_agent import StageProcesses, ProcessWithOpportunities, ProcessExtraction, AIOpportunityExtraction
from mcp_servers.research_mcp import research_process_evidence
from utils.json_parser import clean_and_parse_json


PROCESS_OPPORTUNITY_PROMPT = """
You are a senior enterprise process and AI transformation specialist.

Given a Value Chain Stage and Enterprise Strategy, analyze the stage and return 3-5 core business processes.
For each process, provide:
- process name & business purpose
- 3-5 key sequential activities
- current operational challenges
- automation potential (low, medium, high)
- 1-2 specific AI opportunities (with title, description, relevant technologies, business benefits, risks, rationale)

Return ONLY valid JSON matching this structure:
{
    "stage_name": "Supply Chain & Logistics",
    "items": [
        {
            "process": {
                "name": "Inventory Replenishment Planning",
                "business_purpose": "Maintain optimal store stock levels without manual intervention.",
                "key_activities": ["Stock Level Analysis", "Reorder Threshold Calculation", "PO Generation"],
                "current_challenges": ["High stockouts during peak demand", "Manual spreadsheet reordering"],
                "automation_potential": "high",
                "rationale": "High volume repetitive calculations suitable for ML forecasting models."
            },
            "opportunities": [
                {
                    "title": "Autonomous PO Generation",
                    "description": "Deploy ML predictive demand models to automatically generate supplier purchase orders.",
                    "relevant_technologies": ["Predictive ML", "LLM Document Extraction"],
                    "business_benefit": "35% reduction in stockouts and 20% lower labor overhead.",
                    "risks": ["Supplier lead time variance", "Over-ordering during anomalous trends"],
                    "rationale": "Direct alignment with enterprise stock reduction objective."
                }
            ]
        }
    ]
}
"""


class ProcessOpportunityAgent:
    def run(self, stage_name: str, strategy: str) -> StageProcesses:
        # Call Research MCP tool for evidence
        research = research_process_evidence(stage_name)

        prompt = f"""
{PROCESS_OPPORTUNITY_PROMPT}

Strategy: {strategy}
Value Chain Stage: {stage_name}
External Research Evidence: {research['summary']}
"""

        response = llm.invoke(prompt, api_key=api_key)
        data = clean_and_parse_json(response)
        return StageProcesses.model_validate(data)
