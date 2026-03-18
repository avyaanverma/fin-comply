from pathlib import Path
from threading import Lock
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import Body, FastAPI, HTTPException
from pydantic import BaseModel, Field

from rag_engine import SEBIRAGEngine

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATASET_PATH = BASE_DIR / "sebi_dummy_dataset_2000.csv"
INDEX_DIR = BASE_DIR / "rag_index"
INDEX_FILE = INDEX_DIR / "sebi_tfidf_index.joblib"

engine_lock = Lock()
engine = SEBIRAGEngine(csv_path=str(DATASET_PATH), index_dir=str(INDEX_DIR))


class SummaryRequest(BaseModel):
    body: str = Field(..., min_length=1, description="Context or question to seed the summary.")
    force_rebuild: Optional[bool] = Field(False, description="Rebuild the TF-IDF index before answering.")


class SummaryResponse(BaseModel):
    sebi_title: str = Field(..., alias="sebi-title")
    sebi_summary: str = Field(..., alias="sebi-summary")
    date: Optional[str] = Field(None, description="Optional date extracted from the matched document.")

    class Config:
        populate_by_name = True


class RagSource(BaseModel):
    document_title: str
    category: Optional[str] = None
    source_url: Optional[str] = None
    published_date: Optional[str] = None
    chunk_text: str
    similarity_score: float


class AnswerResponse(BaseModel):
    user_answer: str
    sources: List[RagSource]


class HealthResponse(BaseModel):
    dataset: str
    index_exists: bool
    gemini_key: bool


app = FastAPI(
    title="FinComply SEBI RAG API",
    description="Retrieval-augmented generation over the SEBI dataset with optional Gemini LLM calls.",
    version="0.2.0",
)


def ensure_engine(force_rebuild: bool = False) -> None:
    with engine_lock:
        engine.build_or_load(force_rebuild=force_rebuild)


def map_source(item: dict) -> RagSource:
    metadata = item.get("metadata", {})
    return RagSource(
        document_title=metadata.get("title", metadata.get("source", "SEBI Document")),
        category=metadata.get("category"),
        source_url=metadata.get("source"),
        published_date=metadata.get("date"),
        chunk_text=item.get("text", ""),
        similarity_score=float(item.get("score", 0.0)),
    )


@app.on_event("startup")
def on_startup() -> None:
    if not DATASET_PATH.exists():
        raise RuntimeError(f"Dataset missing at {DATASET_PATH}")
    ensure_engine()


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    has_gemini_key = bool(
        engine.csv_path.parent.joinpath(".env").exists()
        and any(k in engine.csv_path.parent.joinpath(".env").read_text() for k in ("GEMINI_API_KEY", "GOOGLE_API_KEY"))
    )
    return HealthResponse(
        dataset=str(DATASET_PATH),
        index_exists=INDEX_FILE.exists(),
        gemini_key=has_gemini_key,
    )


@app.post("/rag/summary", response_model=SummaryResponse)
def rag_summary(request: SummaryRequest) -> SummaryResponse:
    ensure_engine(force_rebuild=request.force_rebuild)
    result = engine.answer(question=request.body, top_k=5)
    sources = result.get("sources") or []
    metadata = sources[0]["metadata"] if sources else {}
    title = metadata.get("title") or "SEBI Summary"
    date = metadata.get("date")
    return SummaryResponse(
        **{
            "sebi-title": title,
            "sebi-summary": result["answer"],
            "date": date,
        }
    )


@app.post("/rag/answer", response_model=AnswerResponse)
def rag_answer(payload: dict = Body(...)) -> AnswerResponse:
    user_question = (payload.get("user_question") or payload.get("user-question") or "").strip()
    if not user_question:
        raise HTTPException(status_code=422, detail="Missing required field: user_question (or user-question)")

    force_rebuild = bool(payload.get("force_rebuild") or payload.get("force-rebuild"))
    ensure_engine(force_rebuild=force_rebuild)
    result = engine.answer(question=user_question, top_k=5)
    sources = result.get("sources") or []
    return AnswerResponse(
        user_answer=result["answer"],
        sources=[map_source(item) for item in sources],
    )
