# System Architecture — Enterprise Transformation Digital Twin

## 1. 5-Agent Specialist Topology

```
                  +--------------------------------+
                  |         Router Agent           |
                  |     (Thin Intent Classifier)   |
                  +---------------+----------------+
                                  |
    +-----------------------------+-----------------------------+
    |                             |                             |
+---v--------------+    +---------v--------+          +---------v--------+
| 1. Strategy &    |    | 2. Process &     |          | 3. Role &        |
|    Value Chain   |    |    Opportunity   |          |    Skill         |
+------------------+    +------------------+          +------------------+
    |                             |                             |
    +-----------------------------+-----------------------------+
                                  |
                        +---------v--------+
                        | 4. Governance &  |  <--- (HITL Interrupt on Risk)
                        |    Prioritization|
                        +---------+--------+
                                  |
                        +---------v--------+
                        | 5. Query &       |
                        |    Simulation    |
                        +------------------+
```

## 2. Component Layer Responsibilities

| Layer | Technologies | Responsibilities |
|---|---|---|
| API & Orchestration | FastAPI, LangGraph, Uvicorn | Request routing, state graph orchestration, transaction management |
| Agentic Intelligence | LiteLLM, Pydantic, Instructor | Structured extraction, governance auditing, simulation narration |
| Data & Persistence | PostgreSQL, SQLAlchemy | Entity storage, relational constraints, dynamic edge graph storage |
| Vector & Knowledge | Qdrant, FastMCP | External process evidence retrieval, regulatory standard vector matching |
| Graph & Simulation Engine | NetworkX | In-memory graph loading, multi-hop BFS traversal, scenario diffing |
