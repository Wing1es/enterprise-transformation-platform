import json

from llm.provider import llm

from prompts.process_prompt import PROCESS_PROMPT

from schemas.process_agent import StageProcesses


class ProcessAgent:

    def run(
        self,
        stage_name: str,
        strategy: str,
    ) -> StageProcesses:

        prompt = f"""
{PROCESS_PROMPT}

Strategy:
{strategy}

Value Chain Stage:
{stage_name}
"""

        response = llm.invoke(prompt)

        return StageProcesses.model_validate_json(response)