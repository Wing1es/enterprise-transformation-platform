from fastapi import APIRouter
from prompts.strategy_prompt import STRATEGY_PROMPT
from prompts.process_prompt import PROCESS_PROMPT

router = APIRouter(prefix="/prompts", tags=["Prompts for ChatGPT/Gemini Web UI"])


@router.get("/copy/strategy")
def get_strategy_prompt(strategy_statement: str = "Become an AI-first regional retailer within 3 years."):
    """Returns a copy-pasteable prompt for ChatGPT/Gemini Web UI to generate Strategy & Value Chain JSON."""
    return {
        "instructions": "Copy the 'prompt' text below, paste into ChatGPT Web (chatgpt.com) or Gemini Web (gemini.google.com), then copy the JSON response to POST /ingest/raw_json",
        "prompt": f"""{STRATEGY_PROMPT}\n\nOrganization Strategy:\n"{strategy_statement}"\n\nReturn ONLY valid JSON matching the example above."""
    }


@router.get("/copy/process")
def get_process_prompt(stage_name: str = "Supply Chain & Logistics", strategy_statement: str = "Become an AI-first regional retailer within 3 years."):
    """Returns a copy-pasteable prompt for ChatGPT/Gemini Web UI to generate Processes & AI Opportunities JSON."""
    return {
        "instructions": "Copy the 'prompt' text below, paste into ChatGPT Web (chatgpt.com) or Gemini Web (gemini.google.com), then copy the JSON response to POST /ingest/raw_json",
        "prompt": f"""You are a senior enterprise process and AI transformation specialist.

Given Value Chain Stage: "{stage_name}"
Strategy: "{strategy_statement}"

Generate 3 core business processes. For each process provide:
- process name & business purpose
- 3 key sequential activities
- current operational challenges
- automation potential (low, medium, high)
- 1-2 AI opportunities with title, description, relevant technologies, business benefit, risks, and rationale

Return ONLY valid JSON matching this schema:
{{
    "stage_name": "{stage_name}",
    "items": [
        {{
            "process": {{
                "name": "Demand Forecasting",
                "business_purpose": "Predict inventory demand",
                "key_activities": ["Analyze sales trends", "Generate store replenishment orders"],
                "current_challenges": ["Stockouts during peak season"],
                "automation_potential": "high",
                "rationale": "High data availability"
            }},
            "opportunities": [
                {{
                    "title": "Machine Learning Demand Predictor",
                    "description": "Predict sales using historical POS data",
                    "relevant_technologies": ["Machine Learning", "Time Series"],
                    "business_benefit": "Reduce stockouts by 40%",
                    "risks": ["Data quality issues"],
                    "rationale": "High ROI"
                }}
            ]
        }}
    ]
}}"""
    }
