
# FinComply SEBI RAG Chatbot (Capstone Demo)

This project builds a Retrieval-Augmented Generation (RAG) chatbot over your SEBI CSV dataset and serves it in a Streamlit web app.

## Files
- `rag_engine.py`: CSV ingestion, chunking, TF-IDF retrieval, and Gemini 2.5 answer generation.
- `streamlit_app.py`: Streamlit chatbot UI with source citations.
- `sebi_dummy_dataset_2000.csv`: your dataset.
- `requirements.txt`: dependencies.

## Setup
1. Create and activate a virtual environment (recommended).
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Optional for full RAG+LLM:
   - Create `.env` file and add `GEMINI_API_KEY=...`
   - If no key is set, app still works in retrieval-only mode.

## Run Streamlit App

```bash
streamlit run streamlit_app.py
```

Open the local URL shown in terminal (usually `http://localhost:8501`).

## Notes
- Index is persisted in `rag_index/sebi_tfidf_index.joblib`.
- Use the sidebar "Rebuild Index" button when dataset changes.

## Run HTTP API

The same RAG pipeline is exposed behind FastAPI so you can query it from other services.

```bash
uvicorn api:app --host 0.0.0.0 --port 8000 --reload
```

### Endpoints

- `GET /health`: verifies the dataset and index file are present and reports whether a Gemini key is configured.
- `POST /rag/summary`: accepts `{ "body": "<context or question>", "force_rebuild": false }` and returns `sebi-title`, `sebi-summary`, and an optional `date`. Use this endpoint to seed community chats or pre-populate summaries.
- `POST /rag/answer`: accepts `{ "sebi-title": "<chat title>", "sebi-summary": "<summary>", "user-question": "<question>", "force_rebuild": false }` and returns `{ "user_answer": "<answer>", "sources": [...] }`. Each source includes `document_title`, `category`, `source_url`, `published_date`, `chunk_text`, and `similarity_score`.

`force_rebuild: true` triggers a fresh TF-IDF index build before responding.
