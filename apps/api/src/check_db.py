from db.session import SessionLocal
from graph_reasoning.traversal import load_full_graph
db = SessionLocal()
G = load_full_graph(db)
print("Node count:", len(G.nodes))
