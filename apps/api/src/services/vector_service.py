import os
import uuid
import logging
from typing import Any
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels

logger = logging.getLogger(__name__)

QDRANT_HOST = os.getenv("QDRANT_HOST", "localhost")
QDRANT_PORT = int(os.getenv("QDRANT_PORT", "6333"))

EVIDENCE_COLLECTION = "evidence_chunks"
GOVERNANCE_COLLECTION = "governance_sources"

# Built-in lightweight mock/hash embedding helper if fastembed is unavailable
def simple_embedding(text: str, dim: int = 1536) -> list[float]:
    import hashlib
    h = hashlib.sha256(text.encode("utf-8")).digest()
    # Produce reproducible float vector
    floats = []
    for i in range(dim):
        byte_val = h[i % len(h)]
        val = (byte_val / 255.0) * 2.0 - 1.0
        floats.append(val)
    return floats


class VectorService:
    def __init__(self):
        self.client = QdrantClient(host=QDRANT_HOST, port=QDRANT_PORT)
        self._init_collections()
        self._seed_governance_sources()

    def _init_collections(self):
        try:
            collections = [c.name for c in self.client.get_collections().collections]

            if EVIDENCE_COLLECTION not in collections:
                self.client.create_collection(
                    collection_name=EVIDENCE_COLLECTION,
                    vectors_config=qmodels.VectorParams(
                        size=1536, distance=qmodels.Distance.COSINE
                    ),
                )

            if GOVERNANCE_COLLECTION not in collections:
                self.client.create_collection(
                    collection_name=GOVERNANCE_COLLECTION,
                    vectors_config=qmodels.VectorParams(
                        size=1536, distance=qmodels.Distance.COSINE
                    ),
                )
        except Exception as e:
            logger.warning(f"Qdrant collection init warning: {e}")

    def _seed_governance_sources(self):
        try:
            count = self.client.count(collection_name=GOVERNANCE_COLLECTION).count
            if count > 0:
                return
        except Exception:
            return

        frameworks = [
            {
                "title": "EU AI Act (Regulation 2024/1689)",
                "source_type": "law_regulation",
                "citation": "EU AI Act Article 9 (Risk Management System) & Article 14 (Human Oversight)",
                "content": "High-risk AI systems must implement continuous risk management systems, ensure data governance, maintain technical documentation, logging, transparency, human oversight, and high accuracy and cybersecurity.",
                "area": "human_oversight"
            },
            {
                "title": "Digital Personal Data Protection Act 2023 (India)",
                "source_type": "law_regulation",
                "citation": "DPDP Act 2023 Section 6 (Consent) & Section 8 (General Obligations of Data Fiduciary)",
                "content": "Data Fiduciaries must process personal data only for lawful purposes with explicit consent, implement reasonable security safeguards, notify breaches, and ensure purpose limitation.",
                "area": "privacy"
            },
            {
                "title": "NIST AI Risk Management Framework (AI RMF 1.0)",
                "source_type": "regulatory_guidance",
                "citation": "NIST AI RMF Core: GOVERN 1.2, MAP 2.3, MEASURE 2.6, MANAGE 1.3",
                "content": "Organizations must systematically map context, measure trustworthy AI characteristics (validity, reliability, safety, privacy, fairness, transparency), and manage risk across lifecycle.",
                "area": "model_risk"
            },
            {
                "title": "OECD Principles on Artificial Intelligence",
                "source_type": "regulatory_guidance",
                "citation": "OECD AI Principle 1.2 (Human-centred values and fairness) & 1.3 (Transparency and explainability)",
                "content": "AI actors should respect human rights, diversity, fairness, and mandate meaningful transparency and explainability so affected stakeholders understand AI outputs.",
                "area": "explainability"
            },
            {
                "title": "ISO/IEC 42001 Information Technology — AI Management System",
                "source_type": "industry_standard",
                "citation": "ISO/IEC 42001:2023 Annex A (Control Objectives and Controls)",
                "content": "Establishes requirements for creating, implementing, maintaining, and continually improving an Artificial Intelligence Management System (AIMS) within organizations.",
                "area": "monitoring"
            }
        ]

        points = []
        for i, fw in enumerate(frameworks):
            vector = simple_embedding(fw["content"])
            points.append(
                qmodels.PointStruct(
                    id=str(uuid.uuid5(uuid.NAMESPACE_DNS, f"gov-fw-{i}")),
                    vector=vector,
                    payload=fw,
                )
            )

        self.client.upsert(collection_name=GOVERNANCE_COLLECTION, points=points)
        logger.info("Successfully pre-seeded governance sources in Qdrant.")

    def add_evidence(self, url: str, title: str, entity_type: str, entity_id: int, content: str) -> str:
        point_id = str(uuid.uuid4())
        vector = simple_embedding(content)
        payload = {
            "source_url": url,
            "title": title,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "content": content,
        }
        self.client.upsert(
            collection_name=EVIDENCE_COLLECTION,
            points=[qmodels.PointStruct(id=point_id, vector=vector, payload=payload)]
        )
        return point_id

    def search_evidence(self, query: str, limit: int = 5) -> list[dict[str, Any]]:
        vector = simple_embedding(query)
        try:
            results = self.client.search(
                collection_name=EVIDENCE_COLLECTION,
                query_vector=vector,
                limit=limit
            )
            return [hit.payload for hit in results if hit.payload]
        except Exception:
            return []

    def search_governance_sources(self, query: str, limit: int = 3) -> list[dict[str, Any]]:
        vector = simple_embedding(query)
        try:
            results = self.client.search(
                collection_name=GOVERNANCE_COLLECTION,
                query_vector=vector,
                limit=limit
            )
            return [hit.payload for hit in results if hit.payload]
        except Exception:
            return []


vector_service = VectorService()
