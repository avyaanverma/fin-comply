from fastapi import FastAPI
from pydantic import BaseModel

from rag import (
    DEFAULT_INDEX_PATH,
    DEFAULT_CHUNKS_PATH,
    DEFAULT_MODEL_NAME,
    DEFAULT_TOP_K,
    DEFAULT_MIN_SIMILARITY,
    VectorStore,
    RAGSystem,
)


class QueryRequest(BaseModel):
    query: str
    top_k: int = DEFAULT_TOP_K


class ContextRequest(BaseModel):
    body: str
    top_k: int = DEFAULT_TOP_K


class QuestionRequest(BaseModel):
    sebi_title: str
    sebi_summary: str
    user_question: str
    top_k: int = DEFAULT_TOP_K

app = FastAPI(
    title="FinComply RAG API",
    description="SEBI Compliance RAG API",
    version="1.0"
)

# Load model & FAISS ONCE at startup
vector_store = VectorStore(
    index_path=DEFAULT_INDEX_PATH,
    chunks_path=DEFAULT_CHUNKS_PATH,
    model_name=DEFAULT_MODEL_NAME,
)

rag_system = RAGSystem(vector_store, min_similarity=DEFAULT_MIN_SIMILARITY)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/query")
def query_rag(request: QueryRequest):
    return rag_system.query(
        user_query=request.query,
        top_k=request.top_k
    )


@app.post("/api/ml/context")
def get_context(request: ContextRequest):
    result = rag_system.query(user_query=request.body, top_k=request.top_k)
    if not result["contexts"]:
        return {
            "sebi_title": None,
            "sebi_summary": "No relevant SEBI update found for the provided context.",
            "date": None,
        }

    top = result["contexts"][0]
    return {
        "sebi_title": top["document_title"],
        "sebi_summary": result["answer"],
        "date": top["published_date"],
    }


@app.post("/api/ml/question")
def ask_question(request: QuestionRequest):
    combined_query = f"{request.sebi_title}\n{request.sebi_summary}\n{request.user_question}"
    result = rag_system.query(user_query=combined_query, top_k=request.top_k)
    return {
        "sebi_title": request.sebi_title,
        "sebi_summary": request.sebi_summary,
        "user_question": request.user_question,
        "user_answer": result["answer"],
        "sources": result["contexts"],
    }
