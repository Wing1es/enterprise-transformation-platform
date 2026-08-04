def commit_node(state):

    db = state["db"]

    db.commit()

    return {}