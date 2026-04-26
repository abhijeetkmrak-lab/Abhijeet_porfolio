"""
main.py — FastAPI RAG Chatbot for Abhijeet Kumar's Portfolio

Architecture:
  - Vector store: Chroma Cloud (hybrid search — dense Qwen + sparse BM25 via RRF)
  - LLM: Google Gemini 1.5 Flash (via langchain-google-genai)
  - Credentials read from .env: CHROMA_API_KEY, CHROMA_TENANT, CHROMA_DATABASE, GEMINI_API_KEY
"""

import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import chromadb
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough

# ── 1. Load environment ────────────────────────────────────────────────────────
load_dotenv()

required_vars = ["CHROMA_API_KEY", "CHROMA_TENANT", "CHROMA_DATABASE", "GEMINI_API_KEY"]
missing = [v for v in required_vars if not os.environ.get(v)]
if missing:
    raise EnvironmentError(
        f"Missing required environment variables: {', '.join(missing)}\n"
        "Please populate backend/.env."
    )

# ── 2. Connect to Chroma Cloud ─────────────────────────────────────────────────
# Explicitly passing credentials to avoid auto-resolution issues
chroma_client = chromadb.CloudClient(
    api_key=os.environ["CHROMA_API_KEY"],
    tenant=os.environ["CHROMA_TENANT"],
    database=os.environ["CHROMA_DATABASE"]
)
COLLECTION_NAME = "portfolio_faq"

# Get the existing collection (must have been created by load_data.py first)
collection = chroma_client.get_or_create_collection(
    name=COLLECTION_NAME,
    metadata={"hnsw:space": "cosine"},
)
print(f"✅ Connected to Chroma Cloud collection '{COLLECTION_NAME}'")

# ── 3. LLM ─────────────────────────────────────────────────────────────────────
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0.2,
    google_api_key=os.environ["GEMINI_API_KEY"],
)

# ── 4. Prompt with System Message ─────────────────────────────────────────────
SYSTEM_MESSAGE = (
    "You are the AI Assistant for Abhijeet Kumar, a Product Manager with 7+ years of experience. "
    "Answer professionally and only use the provided context. "
    "If the context does not contain enough information, say so honestly rather than guessing."
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_MESSAGE),
    ("human", "Context:\n{context}\n\nQuestion: {question}"),
])

# ── 5. Retrieval helper ────────────────────────────────────────────────────────
def retrieve(query: str, n_results: int = 3) -> str:
    """
    Query Chroma Cloud using the Search API.
    When the collection has both a dense (VectorIndexConfig) and sparse
    (SparseVectorIndexConfig) index, Chroma Cloud automatically performs
    Reciprocal Rank Fusion (RRF) hybrid search when we call .query().
    """
    results = collection.query(
        query_texts=[query],
        n_results=n_results,
        include=["documents", "metadatas", "distances"],
    )

    docs = results.get("documents", [[]])[0]
    metas = results.get("metadatas", [[]])[0]

    if not docs:
        return "No relevant information found."

    formatted = []
    for i, (doc, meta) in enumerate(zip(docs, metas), start=1):
        source = meta.get("source", "faq") if meta else "faq"
        formatted.append(f"[{i}] ({source})\n{doc}")

    return "\n\n".join(formatted)

# ── 6. Build the LangChain chain ───────────────────────────────────────────────
chain = (
    {
        "context": lambda x: retrieve(x["question"]),
        "question": RunnablePassthrough() | (lambda x: x["question"]),
    }
    | prompt
    | llm
    | StrOutputParser()
)

# ── 7. FastAPI app ─────────────────────────────────────────────────────────────
app = FastAPI(
    title="Abhijeet Kumar — Portfolio AI Chatbot",
    description="RAG chatbot powered by Chroma Cloud (hybrid search) + Gemini.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query string must not be empty.")

    try:
        # Retrieve matching context for the response metadata
        raw_results = collection.query(
            query_texts=[request.query],
            n_results=3,
            include=["documents", "metadatas"],
        )
        source_metas = raw_results.get("metadatas", [[]])[0] or []
        sources = [
            m.get("question", "")
            for m in source_metas
            if m and m.get("question")
        ]

        # Run the full RAG chain
        answer = chain.invoke({"question": request.query})

        return ChatResponse(answer=answer, sources=sources)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
