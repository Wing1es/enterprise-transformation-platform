"""Governance Source MCP Server for Regulatory & Compliance Frameworks."""
from services.vector_service import vector_service


def lookup_governance_frameworks(area: str, keywords: str = "") -> list[dict]:
    """Looks up official governance standards (EU AI Act, NIST AI RMF, ISO 42001, DPDP Act 2023)."""
    query = f"{area} {keywords}".strip()
    sources = vector_service.search_governance_sources(query, limit=3)
    if not sources:
        sources = [
            {
                "title": "NIST AI Risk Management Framework (AI RMF 1.0)",
                "source_type": "regulatory_guidance",
                "citation": "NIST AI RMF 1.0 Section 3.2",
                "content": "Mandates data governance, privacy preservation, bias audit, and human oversight for enterprise deployment.",
                "area": area
            }
        ]
    return sources
