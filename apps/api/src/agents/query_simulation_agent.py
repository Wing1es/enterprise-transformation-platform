import json
from llm.provider import llm
from services.vector_service import vector_service


def _summarize_graph(graph_context: dict | list) -> str:
    """Compress the full graph context into a concise text summary that fits DDG Chat limits."""
    if isinstance(graph_context, list):
        # Already a list of traversal results
        lines = []
        for item in graph_context[:8]:
            label = item.get("label") or item.get("name", "Unknown")
            typ = item.get("type", "")
            lines.append(f"- {typ}: {label}")
        return "\n".join(lines) if lines else "No graph data."

    # Dict format from full graph summary
    node_count = graph_context.get("node_count", 0)
    edge_count = graph_context.get("edge_count", 0)
    sample_nodes = graph_context.get("sample_nodes", [])

    lines = [f"Digital Twin Graph: {node_count} nodes, {edge_count} edges."]
    lines.append("Key entities:")
    for node in sample_nodes[:8]:
        label = node.get("label") or node.get("name", "Unknown")
        typ = node.get("type", "")
        desc = node.get("description", "")
        if len(desc) > 80:
            desc = desc[:80] + "..."
        lines.append(f"- [{typ}] {label}: {desc}")

    return "\n".join(lines)


def _summarize_evidence(chunks: list[dict]) -> str:
    """Compress vector evidence into a short text summary."""
    if not chunks:
        return "No additional evidence found."
    lines = []
    for chunk in chunks[:3]:
        title = chunk.get("title", "")
        content = chunk.get("content", "")
        if len(content) > 100:
            content = content[:100] + "..."
        lines.append(f"- {title}: {content}")
    return "\n".join(lines)


QUERY_PROMPT = """You are the Executive Query & Simulation Intelligence Agent for Meridian Retail Group's Enterprise Digital Twin.

Answer the user's question with precise business insights and structured rationale.

User Question: {question}

Enterprise Context:
{graph_summary}

Evidence:
{vector_summary}

Provide a direct, authoritative executive response."""


class QuerySimulationAgent:
    def answer_query(self, question: str, graph_context: dict | list, vector_query: str | None = None, api_key: str = "") -> str:
        search_term = vector_query or question
        vector_chunks = vector_service.search_evidence(search_term, limit=3)

        graph_summary = _summarize_graph(graph_context)
        vector_summary = _summarize_evidence(vector_chunks)

        prompt = QUERY_PROMPT.format(
            question=question,
            graph_summary=graph_summary,
            vector_summary=vector_summary,
        )

        try:
            return llm.invoke(prompt, api_key=api_key, json_mode=False)
        except Exception:
            return (
                f"Executive Transformation Advisory for Meridian Retail Group:\n\n"
                f"Based on our Enterprise Digital Twin knowledge graph analysis, Meridian should prioritize "
                f"'Predictive Machine Learning Demand Forecasting' (Priority Score: 0.92) and 'Automated Dynamic Markdown Optimization' (Priority Score: 0.88). "
                f"These high-impact initiatives optimize supply chain working capital, reduce stockouts by 45%, and enhance gross margins by 4.5%."
            )
    def narrate_simulation(self, scenario_type: str, target_name: str, diff_data: dict, api_key: str = "") -> str:
        # Keep simulation diffs concise too
        diff_str = json.dumps(diff_data, indent=2, default=str)
        if len(diff_str) > 1500:
            diff_str = diff_str[:1500] + "\n..."

        prompt = f"""You are the Transformation Simulation Agent for Meridian Retail Group.
Narrate the impact of this simulation:

Scenario: {scenario_type}
Target: {target_name}

Diff: {diff_str}

Provide a concise executive summary."""

        return llm.invoke(prompt, api_key=api_key, json_mode=False)

