from agents.strategy_agent import StrategyAgent


from graph.state import StrategyState

agent = StrategyAgent()

def strategy_node(state: StrategyState):

    result = agent.run(strategy=state["strategy"], api_key=state.get("api_key", ""))

    return {
        "strategy_result": result
    }