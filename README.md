# Enterprise Transformation Digital Twin — Backend API

An enterprise transformation digital twin built for **Meridian Retail Group** (fictional ~$800M regional retailer, ~150 stores).

It features a **5-Agent LangGraph Intelligence System**, FastAPI backend, PostgreSQL database, Qdrant vector database, FastMCP research/governance servers, and a NetworkX graph traversal & scenario simulation engine.

---

## 🚀 Key Features & Architecture

### 1. 5 Specialist Agents (LangGraph) + Intent Router
- **Router Classifier**: Thin router dispatching input to agent chains.
- **Agent 1 (Strategy & Value Chain)**: Maps strategy to 6 value chain stages and transformation initiatives.
- **Agent 2 (Process & Opportunity)**: Discovers processes, activities, and AI opportunities in one pass.
- **Agent 3 (Role & Skill)**: Maps roles, activities, and skill transitions across 6 categories (`emerging`, `increasing`, `ai_augmented`, `changing`, `declining`, `enduring_human`).
- **Agent 4 (Governance & Prioritization)**: Performs 10-area governance assessments citing EU AI Act, NIST AI RMF, ISO 42001, and DPDP Act 2023. Triggers Human-in-the-Loop (HITL) sign-off on high risk.
- **Agent 5 (Query & Simulation)**: Answers executive queries via hybrid search and computes simulation diffs.

### 2. NetworkX Simulation Engine
- **"Automate Activity"**: Propagates activity automation through connected roles, skills, and governance, returning graph diffs.
- **"Delay Initiative"**: Propagates delays through `depends_on` edges and generates executive impact summaries.

---

## 🛠️ API Endpoints Summary

### Ingestion Pipeline
- `POST /ingest/strategy` — `{ "org_name": "Meridian Retail Group", "statement": "Become an AI-first regional retailer..." }`
- `POST /ingest/process` — `{ "org_id": 1, "name_or_description": "Demand Forecasting & Replenishment" }`
- `POST /ingest/role` — `{ "org_id": 1, "name_or_description": "Procurement Manager" }`
- `POST /ingest/initiative` — `{ "org_id": 1, "name": "AI Inventory Optimization", "description": "..." }`
- `POST /ingest/ai_use_case` — Ingest single AI opportunity with governance check.

### Executive Query & Graph Traversal
- `POST /query` — `{ "question": "What should Meridian transform first and why?" }`
- `GET  /graph/traverse?entity_type=process&entity_id=1&depth=2` — Multi-hop graph traversal.
- `GET  /graph/{entity_type}/{id}` — Direct entity neighborhood graph.

### Simulation Mode
- `POST /simulate` — `{ "action": "automate_activity", "target_id": 1, "params": {} }`
- `POST /simulate` — `{ "action": "delay_initiative", "target_id": 1, "params": { "delay_months": 6 } }`

### Governance & HITL Sign-off
- `POST /agent/hitl_response` — `{ "interrupt_id": 1, "decision": "approve" }`

---

## ⚙️ How to Run & Try Out

1. **Start Services** (Postgres & Qdrant):
   ```bash
   docker compose up -d
   ```

2. **Start FastAPI Backend**:
   ```bash
   cd apps/api/src
   uvicorn main:app --reload --port 8000
   ```

3. **Run Seed Pipeline** (Ingests Meridian Retail Group case study):
   ```bash
   python3 scripts/seed_pipeline.py
   ```

4. **Access Swagger Interactive API Docs**:
   Open [http://localhost:8000/docs](http://localhost:8000/docs) in your browser.
