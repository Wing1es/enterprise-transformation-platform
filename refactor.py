import os
import re

AGENT_FILES = [
    "apps/api/src/agents/strategy_agent.py",
    "apps/api/src/agents/process_opportunity_agent.py",
    "apps/api/src/agents/role_skill_agent.py",
    "apps/api/src/agents/governance_priority_agent.py",
    "apps/api/src/agents/process_agent.py",
    "apps/api/src/agents/query_simulation_agent.py",
    "apps/api/src/agents/router.py"
]

NODE_FILES = [
    "apps/api/src/graph/nodes/strategy.py",
    "apps/api/src/graph/nodes/process.py",
    "apps/api/src/graph/nodes/role.py",
    "apps/api/src/graph/nodes/governance.py"
]

def refactor_agent(file_path):
    with open(file_path, "r") as f:
        content = f.read()

    # Add api_key: str = "" to all def run( / def route( / def handle_query( / def simulate_diff(
    content = re.sub(r'(def (run|route|handle_query|simulate_diff)\(self,[^)]+?)(?:\s*,\s*api_key:\s*str\s*=\s*""\s*)?\):', r'\1, api_key: str = ""):', content)
    
    # Update llm.invoke(prompt) to llm.invoke(prompt, api_key=api_key)
    content = re.sub(r'llm\.invoke\(\s*(.*?)\s*\)', r'llm.invoke(\1, api_key=api_key)', content)
    
    with open(file_path, "w") as f:
        f.write(content)

def refactor_node(file_path):
    with open(file_path, "r") as f:
        content = f.read()
    
    # Update agent.run(xxx) to agent.run(xxx, api_key=state.get("api_key", ""))
    content = re.sub(r'(agent\.run\([^)]+)', r'\1, api_key=state.get("api_key", "")', content)
    
    with open(file_path, "w") as f:
        f.write(content)

for f in AGENT_FILES:
    if os.path.exists(f):
        refactor_agent(f)
for f in NODE_FILES:
    if os.path.exists(f):
        refactor_node(f)

print("Refactor complete.")
