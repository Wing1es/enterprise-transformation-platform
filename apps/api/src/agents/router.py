"""Router Agent: Thin classifier to dispatch user inputs to the appropriate specialist agent chain."""
from typing import Literal
from pydantic import BaseModel
from llm.provider import llm


class RouteDecision(BaseModel):
    intent: Literal["strategy", "process", "role", "ai_use_case", "initiative", "query"]
    target_chain: list[int]
    rationale: str


class RouterAgent:
    def classify(self, user_input: str) -> RouteDecision:
        prompt = f"""
You are a thin classification router for an Enterprise Transformation Digital Twin.
Classify the following input into exactly one of these intents:
- "strategy": User provides an overall enterprise strategy statement.
- "process": User enters a single business process or stage name.
- "role": User enters a business role or job title.
- "ai_use_case": User enters a specific AI technology / opportunity / use case.
- "initiative": User enters a strategic initiative or project.
- "query": User asks a question, compare request, why question, or simulation query.

Input: "{user_input}"

Return ONLY valid JSON matching this schema:
{{
    "intent": "<intent>",
    "target_chain": [1, 2, 3, 4],
    "rationale": "<short reason>"
}}
"""
        response_text = llm.invoke(prompt)
        try:
            return RouteDecision.model_validate_json(response_text)
        except Exception:
            # Fallback based on simple keywords
            text = user_input.lower()
            if "strategy" in text or "become an ai-first" in text:
                return RouteDecision(intent="strategy", target_chain=[1, 2, 3, 4], rationale="Strategy statement keyword match")
            elif "process" in text or "procurement" in text or "inventory" in text:
                return RouteDecision(intent="process", target_chain=[2, 3, 4], rationale="Process keyword match")
            elif "role" in text or "manager" in text or "cashier" in text:
                return RouteDecision(intent="role", target_chain=[3, 4], rationale="Role keyword match")
            elif "ai" in text or "use case" in text or "model" in text:
                return RouteDecision(intent="ai_use_case", target_chain=[4], rationale="AI use case keyword match")
            else:
                return RouteDecision(intent="query", target_chain=[5], rationale="Default query fallback")
