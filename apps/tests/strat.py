from pathlib import Path
import sys

# Add apps/api/src to sys.path so agents and other API modules can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "api" / "src"))

from agents.strategy_agent import StrategyAgent

agent = StrategyAgent()

result = agent.run(
    "Become an AI-first retailer in three years."
)

print(result)