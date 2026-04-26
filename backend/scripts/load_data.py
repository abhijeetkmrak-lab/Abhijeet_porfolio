"""
load_data.py — Chroma Cloud ingestion script for Abhijeet's Portfolio FAQ

Architecture:
  - Dense embeddings: Chroma Cloud Qwen (server-side, via Schema)
  - Sparse embeddings: Chroma Cloud BM25/Splade (server-side, via Schema)
  - Hybrid search via RRF is enabled automatically when both indexes are present.
  - Credentials are auto-resolved from environment variables:
      CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DATABASE

Run:
    python backend/scripts/load_data.py
"""

import os
import json
import hashlib
from dotenv import load_dotenv
import chromadb
from chromadb import Schema, Collection, VectorIndexConfig, SparseVectorIndexConfig

# ── 1. Load environment ────────────────────────────────────────────────────────
load_dotenv()

required_vars = ["CHROMA_API_KEY", "CHROMA_TENANT", "CHROMA_DATABASE"]
missing = [v for v in required_vars if not os.environ.get(v)]
if missing:
    raise EnvironmentError(
        f"Missing required environment variables: {', '.join(missing)}\n"
        "Please populate backend/.env with CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DATABASE."
    )

# ── 2. Connect to Chroma Cloud ─────────────────────────────────────────────────
# Explicitly passing credentials to avoid auto-resolution issues
client = chromadb.CloudClient(
    api_key=os.environ["CHROMA_API_KEY"],
    tenant=os.environ["CHROMA_TENANT"],
    database=os.environ["CHROMA_DATABASE"]
)
print(f"✅ Connected to Chroma Cloud (tenant={os.environ['CHROMA_TENANT']}, db={os.environ['CHROMA_DATABASE']})")

# ── 3. Collection Schema — dense (Qwen) + sparse (BM25) ───────────────────────
# Both embedding functions run server-side on Chroma Cloud; no local model loading.
# Schema.defaults applies the index config to the 'document' field automatically.
try:
    schema = Schema(
        defaults=Schema.Defaults(
            vector_index=VectorIndexConfig(
                space="cosine",
                # Chroma Cloud Qwen is the managed dense embedding model
                embedding_function={"name": "chroma-cloud-qwen"},
                source_key="document",
            ),
            sparse_vector_index=SparseVectorIndexConfig(
                # BM25 for keyword-based sparse retrieval (Splade variant)
                bm25=True,
                source_key="document",
            ),
        )
    )
    USE_SCHEMA = True
except Exception:
    # If running against a local/older Chroma that doesn't support Schema,
    # fall back gracefully and let the collection use default settings.
    print("⚠️  Schema API not available — falling back to default collection config.")
    schema = None
    USE_SCHEMA = False

# ── 4. Get or create the collection ───────────────────────────────────────────
COLLECTION_NAME = "portfolio_faq"

if USE_SCHEMA and schema is not None:
    collection: Collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        schema=schema,
        metadata={"description": "Abhijeet Kumar — Portfolio FAQ for RAG chatbot"},
    )
else:
    collection: Collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine", "description": "Abhijeet Kumar — Portfolio FAQ for RAG chatbot"},
    )

print(f"📦 Collection '{COLLECTION_NAME}' ready.")

# ── 5. Load and ingest FAQ data ────────────────────────────────────────────────
DATA_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "faq.jsonl")

if not os.path.exists(DATA_FILE):
    raise FileNotFoundError(f"Data file not found: {DATA_FILE}")

documents = []
metadatas = []
ids = []

with open(DATA_FILE, "r", encoding="utf-8") as f:
    for line_num, raw_line in enumerate(f, start=1):
        line = raw_line.strip()
        if not line:
            continue

        try:
            data = json.loads(line)
        except json.JSONDecodeError:
            print(f"  ⚠️  Skipping invalid JSON on line {line_num}")
            continue

        question = data.get("question", "").strip()
        long_answer = data.get("long_answer", "").strip()

        if not question and not long_answer:
            continue

        # Combine question + answer; Chroma Cloud limit is 16 KiB per document.
        # FAQ entries are typically short, but we guard against oversized entries.
        combined = f"Question: {question}\nAnswer: {long_answer}"
        if len(combined.encode("utf-8")) > 15_000:
            # Truncate long_answer to keep well under 16 KiB
            budget = 15_000 - len(f"Question: {question}\nAnswer: ".encode("utf-8"))
            long_answer = long_answer.encode("utf-8")[:budget].decode("utf-8", errors="ignore")
            combined = f"Question: {question}\nAnswer: {long_answer}"

        # Stable, deterministic ID derived from content (enables idempotent upsert)
        doc_id = hashlib.sha256(combined.encode("utf-8")).hexdigest()[:32]

        documents.append(combined)
        metadatas.append({
            "question": question,
            "source": "faq.jsonl",
            "line": line_num,
        })
        ids.append(doc_id)

if not documents:
    print("❌ No valid documents found in faq.jsonl. Exiting.")
    exit(0)

print(f"📄 Loaded {len(documents)} FAQ entries. Upserting to Chroma Cloud…")

# ── 6. Upsert in batches (idempotent) ─────────────────────────────────────────
BATCH_SIZE = 100
for i in range(0, len(documents), BATCH_SIZE):
    batch_docs = documents[i : i + BATCH_SIZE]
    batch_meta = metadatas[i : i + BATCH_SIZE]
    batch_ids  = ids[i : i + BATCH_SIZE]

    collection.upsert(
        documents=batch_docs,
        metadatas=batch_meta,
        ids=batch_ids,
    )
    print(f"  ✔  Upserted batch {i // BATCH_SIZE + 1} ({len(batch_docs)} docs)")

print(f"\n🎉 Done! {len(documents)} documents are now indexed in '{COLLECTION_NAME}' on Chroma Cloud.")
