import json
import re
from llm.provider import llm
from schemas.governance_agent import GovernanceAndPriorityOutput, GovernanceFinding
from mcp_servers.governance_mcp import lookup_governance_frameworks
from utils.json_parser import clean_and_parse_json


GOVERNANCE_PRIORITY_PROMPT = """
You are an enterprise AI Governance Officer and Portfolio Prioritization Specialist.

Assess the provided AI Opportunity across enterprise risk & governance frameworks:
1. Conduct governance findings across relevant areas selected from:
   ["data", "privacy", "bias_fairness", "human_oversight", "explainability", "security", "decision_impact", "regulatory_exposure", "model_risk", "monitoring"].
2. For each finding, cite specific laws, regulatory guidance, or standards (e.g. EU AI Act, NIST AI RMF, ISO 42001, India DPDP Act 2023).
3. Assign risk_level ("low", "medium", "high"). Flag requires_signoff = true if risk_level is high or affects critical privacy/decision impact.
4. Calculate a Priority Score (0.0 to 1.0) based on: (Business Benefit x Automation Potential) / Risk Level, and provide a clear rationale.

Return ONLY valid JSON matching this structure:
{
    "governance_findings": [
        {
            "area": "human_oversight",
            "finding": "Automated order issuance requires human approval threshold for orders over $50,000.",
            "source_type": "law_regulation",
            "source_citation": "EU AI Act Article 14",
            "risk_level": "high",
            "requires_signoff": true
        }
    ],
    "priority_score": 0.85,
    "priority_rationale": "High business impact with well-defined risk mitigations in place."
}
"""


class GovernancePriorityAgent:
    def run(self, opportunity_title: str, description: str, benefits: str, risks: list[str]) -> GovernanceAndPriorityOutput:
        # Lookup relevant governance frameworks via MCP server
        frameworks = lookup_governance_frameworks(area="human_oversight", keywords=opportunity_title)

        prompt = f"""
{GOVERNANCE_PRIORITY_PROMPT}

AI Opportunity Title: {opportunity_title}
Description: {description}
Business Benefits: {benefits}
Risks Identified: {json.dumps(risks)}
Reference Governance Sources: {json.dumps(frameworks)}
"""

        response = llm.invoke(prompt)
        data = clean_and_parse_json(response)
        return GovernanceAndPriorityOutput.model_validate(data)
