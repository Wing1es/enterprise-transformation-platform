import copy
import networkx as nx
from sqlalchemy.orm import Session
from graph_reasoning.traversal import load_full_graph, traverse_graph
from agents.query_simulation_agent import QuerySimulationAgent

query_sim_agent = QuerySimulationAgent()


def run_simulation(db: Session, action: str, target_id: int, params: dict, api_key: str = "") -> dict:
    G_live = load_full_graph(db)
    G_sim = copy.deepcopy(G_live)

    if action == "automate_activity":
        return _simulate_automate_activity(G_live, G_sim, target_id, params, api_key)
    elif action == "delay_initiative":
        return _simulate_delay_initiative(G_live, G_sim, target_id, params, api_key)
    else:
        return {"error": f"Unsupported simulation action: {action}"}


def _simulate_automate_activity(G_live: nx.DiGraph, G_sim: nx.DiGraph, activity_id: int, params: dict, api_key: str = "") -> dict:
    target_node = f"activity:{activity_id}"
    if not G_sim.has_node(target_node):
        return {"error": f"Activity {activity_id} not found in graph."}

    # Extract 2-hop traversal surrounding the target activity
    traversal_data = traverse_graph(G_live, "activity", activity_id, depth=2)
    traversal_nodes = {n["id"] for n in traversal_data["nodes"] if isinstance(n, dict) and "id" in n}

    changed_nodes = []
    dimmed_nodes = []

    # Mark target activity as automated
    G_sim.nodes[target_node]["automation_status"] = "fully_automated"
    changed_nodes.append({"id": target_node, "change": "activity_automated", **G_sim.nodes[target_node]})

    # Propagate to connected skills and governance
    for node_id in traversal_nodes:
        if node_id == target_node or node_id not in G_sim.nodes:
            continue
        node_data = G_sim.nodes[node_id]
        node_type = node_data.get("type")
        if node_type == "skill":
            node_data["classification"] = "ai_augmented"
            changed_nodes.append({"id": node_id, "change": "skill_reclassified_to_ai_augmented", **node_data})
        elif node_type == "governance":
            node_data["requires_signoff"] = True
            node_data["risk_level"] = "high"
            changed_nodes.append({"id": node_id, "change": "governance_risk_elevated", **node_data})
        elif node_type in ("value_chain_stage", "initiative"):
            dimmed_nodes.append({"id": node_id, "reason": "unaffected_by_activity_automation", **node_data})

    diff_payload = {
        "scenario": "automate_activity",
        "target_activity_id": activity_id,
        "changed_nodes": changed_nodes,
        "dimmed_nodes": dimmed_nodes[:15],
    }

    target_label = G_sim.nodes[target_node].get("label", f"Activity {activity_id}")
    try:
        summary = query_sim_agent.narrate_simulation("automate_activity", target_label, diff_payload, api_key)
    except Exception:
        summary = f"Automating '{target_label}' optimizes operational throughput, reclassifies associated skills to AI-augmented, and elevates risk governance sign-off requirements."
    diff_payload["summary"] = summary

    return diff_payload


def _simulate_delay_initiative(G_live: nx.DiGraph, G_sim: nx.DiGraph, initiative_id: int, params: dict, api_key: str = "") -> dict:
    target_node = f"initiative:{initiative_id}"
    delay_months = params.get("delay_months", 6)

    if not G_sim.has_node(target_node):
        return {"error": f"Initiative {initiative_id} not found in graph."}

    changed_nodes = []
    dimmed_nodes = []

    G_sim.nodes[target_node]["status"] = f"delayed_{delay_months}_months"
    changed_nodes.append({"id": target_node, "change": f"delayed_by_{delay_months}_months", **G_sim.nodes[target_node]})

    # Walk downstream depends_on edges
    downstream = nx.dfs_tree(G_sim, target_node)
    for node in downstream:
        if node == target_node or node not in G_sim.nodes:
            continue
        if G_sim.nodes[node].get("type") == "initiative":
            G_sim.nodes[node]["status"] = "cascade_delayed"
            changed_nodes.append({"id": node, "change": "cascade_delayed_due_to_dependency", **G_sim.nodes[node]})

    all_nodes = set(G_sim.nodes)
    for n in all_nodes - set(downstream):
        dimmed_nodes.append({"id": n, "reason": "unaffected_by_initiative_delay", **G_sim.nodes[n]})

    diff_payload = {
        "scenario": "delay_initiative",
        "target_initiative_id": initiative_id,
        "delay_months": delay_months,
        "changed_nodes": changed_nodes,
        "dimmed_nodes": dimmed_nodes[:15],
    }

    target_label = G_sim.nodes[target_node].get("label", f"Initiative {initiative_id}")
    try:
        summary = query_sim_agent.narrate_simulation("delay_initiative", target_label, diff_payload, api_key)
    except Exception:
        summary = f"Delaying '{target_label}' by {delay_months} months causes cascade delays across downstream dependent initiatives."
    diff_payload["summary"] = summary

    return diff_payload
