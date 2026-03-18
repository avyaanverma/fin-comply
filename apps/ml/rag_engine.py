import os
import re
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any, Dict, List, Optional

import joblib
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

try:
    import google.generativeai as genai
except Exception:
    genai = None


@dataclass
class DocumentChunk:
    chunk_id: str
    row_id: str
    title: str
    category: str
    date: str
    source: str
    text: str


class SEBIRAGEngine:
    """Simple but strong RAG pipeline for SEBI dataset ingestion and Q&A."""

    def __init__(
        self,
        csv_path: str,
        index_dir: str = "rag_index",
        chunk_size: int = 450,
        chunk_overlap: int = 80,
    ) -> None:
        self.csv_path = Path(csv_path)
        self.index_dir = Path(index_dir)
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

        self.vectorizer: Optional[TfidfVectorizer] = None
        self.doc_matrix = None
        self.chunks: List[DocumentChunk] = []
        self.index_file = self.index_dir / "sebi_tfidf_index.joblib"

    def build_or_load(self, force_rebuild: bool = False) -> None:
        if self.index_file.exists() and not force_rebuild:
            payload = joblib.load(self.index_file)
            self.vectorizer = payload["vectorizer"]
            self.doc_matrix = payload["doc_matrix"]
            self.chunks = [DocumentChunk(**item) for item in payload["chunks"]]
            return

        df = self._load_csv()
        self.chunks = self._build_chunks(df)
        texts = [c.text for c in self.chunks]

        self.vectorizer = TfidfVectorizer(
            lowercase=True,
            stop_words="english",
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95,
            sublinear_tf=True,
        )
        self.doc_matrix = self.vectorizer.fit_transform(texts)

        self.index_dir.mkdir(parents=True, exist_ok=True)
        joblib.dump(
            {
                "vectorizer": self.vectorizer,
                "doc_matrix": self.doc_matrix,
                "chunks": [asdict(c) for c in self.chunks],
            },
            self.index_file,
        )

    def retrieve(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        if not query.strip():
            return []
        if self.vectorizer is None or self.doc_matrix is None:
            raise RuntimeError("Index is not loaded. Call build_or_load() first.")

        q_vec = self.vectorizer.transform([query])
        scores = cosine_similarity(q_vec, self.doc_matrix)[0]
        best_idx = np.argsort(scores)[::-1][:top_k]

        results: List[Dict[str, Any]] = []
        for idx in best_idx:
            score = float(scores[idx])
            if score <= 0:
                continue
            chunk = self.chunks[int(idx)]
            results.append(
                {
                    "score": round(score, 4),
                    "text": chunk.text,
                    "metadata": {
                        "chunk_id": chunk.chunk_id,
                        "row_id": chunk.row_id,
                        "title": chunk.title,
                        "category": chunk.category,
                        "date": chunk.date,
                        "source": chunk.source,
                    },
                }
            )
        return results

    def answer(
        self,
        question: str,
        top_k: int = 5,
        model: str = "gemini-2.5-flash",
        temperature: float = 0.2,
    ) -> Dict[str, Any]:
        retrieved = self.retrieve(question, top_k=top_k)
        if not retrieved:
            return {
                "answer": "I could not find relevant SEBI passages in the indexed dataset for this question.",
                "sources": [],
                "mode": "retrieval_only",
            }

        gemini_key = os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("GOOGLE_API_KEY", "").strip()
        if gemini_key and genai is not None:
            try:
                return self._generate_with_gemini(
                    question=question,
                    retrieved=retrieved,
                    api_key=gemini_key,
                    model=model,
                    temperature=temperature,
                )
            except Exception as exc:
                gemini_error = f"Gemini generation failed: {exc}"
        else:
            gemini_error = "Gemini API key not found. Set GEMINI_API_KEY in .env."

        fallback_answer = self._fallback_answer(question, retrieved)
        error_notes = [msg for msg in [gemini_error] if msg]
        if error_notes:
            fallback_answer = (
                fallback_answer
                + "\n\nNote: LLM call issue(s): "
                + " | ".join(error_notes)
            )
        return {
            "answer": fallback_answer,
            "sources": retrieved,
            "mode": "retrieval_only",
        }

    def _generate_with_gemini(
        self,
        question: str,
        retrieved: List[Dict[str, Any]],
        api_key: str,
        model: str,
        temperature: float,
    ) -> Dict[str, Any]:
        genai.configure(api_key=api_key)
        context_blocks = []
        for i, item in enumerate(retrieved, start=1):
            md = item["metadata"]
            context_blocks.append(
                f"[Source {i}] "
                f"title={md.get('title','')} | category={md.get('category','')} | "
                f"date={md.get('date','')} | row_id={md.get('row_id','')}\n"
                f"{item['text']}"
            )
        context = "\n\n".join(context_blocks)

        system_prompt = (
            "You are a SEBI compliance assistant. Answer in explanation form with these sections: "
            "Rule Summary, Why It Matters, Practical Compliance Steps, and Penalty/Risk (if present). "
            "Use only the supplied context and cite sources as [Source n]. "
            "If details are missing, state that clearly."
        )
        user_prompt = (
            f"Question: {question}\n\n"
            f"Context:\n{context}\n\n"
            "Return a complete explanatory answer using only the context."
        )

        gemini_model = genai.GenerativeModel(
            model_name=model,
            system_instruction=system_prompt,
        )
        response = gemini_model.generate_content(
            user_prompt,
            generation_config=genai.GenerationConfig(
                temperature=temperature,
                max_output_tokens=900,
            ),
        )
        answer_text = (getattr(response, "text", "") or "").strip()
        if not answer_text:
            answer_text = "Gemini returned an empty response."
        return {
            "answer": answer_text,
            "sources": retrieved,
            "mode": f"rag+gemini ({model})",
        }

    def _fallback_answer(self, question: str, retrieved: List[Dict[str, Any]]) -> str:
        lines = [
            "This is retrieval-based output from the dataset.",
            f"Question interpreted: {question}",
            "",
            "Most relevant SEBI passages:",
        ]
        for i, item in enumerate(retrieved[:3], start=1):
            md = item["metadata"]
            lines.append(
                f"{i}. [{md.get('title', 'Untitled')}] "
                f"(Category: {md.get('category', 'N/A')}, Date: {md.get('date', 'N/A')}, "
                f"Score: {item['score']})"
            )
            lines.append(f"   {item['text']}")
        return "\n".join(lines)

    def _load_csv(self) -> pd.DataFrame:
        if not self.csv_path.exists():
            raise FileNotFoundError(f"Dataset not found: {self.csv_path}")

        df = pd.read_csv(self.csv_path)
        required = {"id", "title", "category", "text", "source", "date"}
        missing = sorted(required - set(df.columns))
        if missing:
            raise ValueError(f"CSV missing required columns: {missing}")

        df = df.fillna("")
        return df

    def _build_chunks(self, df: pd.DataFrame) -> List[DocumentChunk]:
        chunks: List[DocumentChunk] = []
        for _, row in df.iterrows():
            row_id = str(row.get("id", ""))
            title = str(row.get("title", ""))
            category = str(row.get("category", ""))
            source = str(row.get("source", "SEBI"))
            date = str(row.get("date", ""))

            full_text = (
                f"Title: {title}\n"
                f"Category: {category}\n"
                f"Date: {date}\n"
                f"Source: {source}\n"
                f"Regulation: {str(row.get('text', '')).strip()}"
            )
            split_parts = self._split_text(full_text)
            for i, part in enumerate(split_parts):
                chunks.append(
                    DocumentChunk(
                        chunk_id=f"{row_id}_{i}",
                        row_id=row_id,
                        title=title,
                        category=category,
                        date=date,
                        source=source,
                        text=part,
                    )
                )
        return chunks

    def _split_text(self, text: str) -> List[str]:
        normalized = re.sub(r"\s+", " ", text).strip()
        if len(normalized) <= self.chunk_size:
            return [normalized]

        pieces: List[str] = []
        start = 0
        while start < len(normalized):
            end = min(start + self.chunk_size, len(normalized))
            pieces.append(normalized[start:end])
            if end == len(normalized):
                break
            start = end - self.chunk_overlap
            if start < 0:
                start = 0
        return pieces


if __name__ == "__main__":
    engine = SEBIRAGEngine(csv_path="sebi_dummy_dataset_2000.csv")
    engine.build_or_load(force_rebuild=True)
    sample = engine.answer("What are the penalties for insider trading violations?", top_k=5)
    print(sample["answer"])
