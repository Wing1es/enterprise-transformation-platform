import json
import re
from llm.provider import llm
from schemas.role_agent import RoleSkillOutput, RoleExtraction, SkillTransitionExtraction


ROLE_SKILL_PROMPT = """
You are an enterprise workforce and skills transformation architect.

Given a list of business activities and process context:
1. Identify 1-3 enterprise job roles responsible for executing these activities.
2. For each role/activity pair, analyze the skill transition from Current Skill -> Future Skill caused by AI augmentation.
3. Classify each skill transition into EXACTLY ONE of these categories:
   - "emerging": Brand new AI-era skills.
   - "increasing": Existing human skills requiring higher proficiency.
   - "ai_augmented": Daily tasks powered by AI tools.
   - "changing": Skills pivoting towards oversight or data analysis.
   - "declining": Manual tasks automated by AI.
   - "enduring_human": High-empathy, strategic, or physical human-only skills.

Return ONLY valid JSON matching this structure:
{
    "roles": [
        {
            "name": "Replenishment Analyst",
            "department": "Supply Chain Operations",
            "description": "Monitors inventory thresholds and oversees AI automated purchase order recommendations."
        }
    ],
    "skill_transitions": [
        {
            "activity_name": "Inventory Replenishment Planning",
            "current_skill": "Manual Excel Sheet Stock Checking",
            "future_skill": "AI Model Threshold & Exception Tuning",
            "ai_impact": "Automates routine ordering, shifting role focus to edge case exception handling.",
            "classification": "ai_augmented",
            "rationale": "Direct AI augmentation of inventory calculation workflows."
        }
    ]
}
"""


from utils.json_parser import clean_and_parse_json


class RoleSkillAgent:
    def run(self, process_name: str, activities: list[str]) -> RoleSkillOutput:
        prompt = f"""
{ROLE_SKILL_PROMPT}

Process Name: {process_name}
Activities: {json.dumps(activities)}
"""
        response = llm.invoke(prompt)
        data = clean_and_parse_json(response)
        return RoleSkillOutput.model_validate(data)
