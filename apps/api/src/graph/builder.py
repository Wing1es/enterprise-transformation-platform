from langgraph.graph import StateGraph
from graph.state import StrategyState
from graph.nodes.strategy import strategy_node
from graph.nodes.persist_strategy import persist_strategy_node
from graph.nodes.process import process_node
from graph.nodes.role import role_node
from graph.nodes.governance import governance_node
from graph.nodes.commit import commit_node


builder = StateGraph(StrategyState)  # type: ignore[arg-type]

builder.add_node("strategy", strategy_node)
builder.add_node("persist_strategy", persist_strategy_node)
builder.add_node("process", process_node)
builder.add_node("role", role_node)
builder.add_node("governance", governance_node)
builder.add_node("commit", commit_node)

builder.add_edge("strategy", "persist_strategy")
builder.add_edge("persist_strategy", "process")
builder.add_edge("process", "role")
builder.add_edge("role", "governance")
builder.add_edge("governance", "commit")

builder.set_entry_point("strategy")
builder.set_finish_point("commit")

graph = builder.compile()