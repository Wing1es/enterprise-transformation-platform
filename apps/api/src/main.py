import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.init_db import init_db
from api.organisation_router import router as organisation_router
from api.ingest_router import router as ingest_router
from api.query_router import router as query_router
from api.simulate_router import router as simulate_router
from api.graph_router import router as graph_router
from api.hitl_router import router as hitl_router
from api.prompts_router import router as prompts_router
from api.auth_router import router as auth_router
from api.chat_router import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on startup
    init_db()
    yield


app = FastAPI(
    title="Enterprise Transformation Digital Twin API",
    description="5-Agent LangGraph System with FastMCP, PostgreSQL, Qdrant, NetworkX Simulation & Traversal",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Root API Routers
app.include_router(auth_router)
app.include_router(ingest_router)
app.include_router(prompts_router)
app.include_router(query_router)
app.include_router(simulate_router)
app.include_router(graph_router)
app.include_router(hitl_router)
app.include_router(organisation_router)
app.include_router(chat_router)

# Register /api/v1 Aliases for Frontend Compatibility
app.include_router(auth_router, prefix="/api/v1")
app.include_router(ingest_router, prefix="/api/v1")
app.include_router(prompts_router, prefix="/api/v1")
app.include_router(query_router, prefix="/api/v1")
app.include_router(simulate_router, prefix="/api/v1")
app.include_router(graph_router, prefix="/api/v1")
app.include_router(hitl_router, prefix="/api/v1")
app.include_router(organisation_router, prefix="/api/v1")
app.include_router(chat_router, prefix="/api/v1")


@app.get("/")
async def root():
    return {
        "status": "online",
        "app": "Transformation Intelligence",
        "agents": 5,
        "fastmcp": True,
        "vector_db": "Qdrant",
        "graph_db": "NetworkX",
        "relational_db": "PostgreSQL",
    }