import json
import re

from llm.provider import llm
from prompts.strategy_prompt import STRATEGY_PROMPT
from schemas.strategy_agent import StrategyExtraction


def _normalize_object_list(items) -> list[dict]:
    if not isinstance(items, list):
        return []
    result = []
    for item in items:
        if isinstance(item, str):
            result.append({"name": item, "description": f"Details for {item}."})
        elif isinstance(item, dict):
            name = (
                item.get("name")
                or item.get("stage_name")
                or item.get("initiative_name")
                or "Unnamed"
            )
            description = (
                item.get("description")
                or item.get("details")
                or item.get("summary")
                or f"Details for {name}."
            )
            result.append({"name": str(name), "description": str(description)})
    return result


from utils.json_parser import clean_and_parse_json

class StrategyAgent:

    def run(self, strategy: str):

        prompt = f"""
{STRATEGY_PROMPT}

Strategy:

{strategy}
"""

        response = llm.invoke(prompt)
        data = clean_and_parse_json(response)

        if isinstance(data, dict):
            stages_raw = (
                data.get("value_chain_stages")
                or data.get("value_chain")
                or data.get("stages")
                or []
            )
            data["value_chain_stages"] = _normalize_object_list(stages_raw)

            initiatives_raw = (
                data.get("initiatives")
                or data.get("transformation_initiatives")
                or data.get("initial_initiatives")
                or data.get("initial_transformation_initiatives")
                or []
            )
            data["initiatives"] = _normalize_object_list(initiatives_raw)

        return StrategyExtraction.model_validate(data)