import os
from pathlib import Path

import streamlit as st
from dotenv import load_dotenv

from rag_engine import SEBIRAGEngine

load_dotenv()

st.set_page_config(page_title="FinComply SEBI RAG Chatbot", page_icon="📘", layout="wide")


@st.cache_resource(show_spinner=False)
def get_engine(csv_path: str, index_dir: str, force_rebuild: bool):
    engine = SEBIRAGEngine(csv_path=csv_path, index_dir=index_dir)
    engine.build_or_load(force_rebuild=force_rebuild)
    return engine


st.title("FinComply: SEBI Rules RAG Chatbot")
st.caption("Capstone demo app: retrieval-augmented chatbot over your SEBI dataset.")

with st.sidebar:
    st.header("Settings")
    csv_path = st.text_input("Dataset CSV path", value="sebi_dummy_dataset_2000.csv")
    index_dir = st.text_input("Index directory", value="rag_index")
    top_k = st.slider("Top-k retrieved chunks", min_value=2, max_value=12, value=5)
    model_name = st.text_input("LLM model (Gemini)", value="gemini-2.5-flash")
    temperature = st.slider("Temperature", min_value=0.0, max_value=1.0, value=0.2, step=0.1)
    rebuild = st.button("Rebuild Index")
    st.markdown("---")
    if os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"):
        st.success("Gemini API key detected: Gemini generation enabled.")
    else:
        st.warning("No GEMINI_API_KEY found: retrieval-only mode.")

if "messages" not in st.session_state:
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": (
                "Ask me anything about the ingested SEBI dataset. "
                "I will answer with source-backed retrieval."
            ),
        }
    ]

dataset_exists = Path(csv_path).exists()
if not dataset_exists:
    st.error(f"Dataset file not found: {csv_path}")
    st.stop()

try:
    with st.spinner("Preparing RAG index..."):
        rag_engine = get_engine(csv_path=csv_path, index_dir=index_dir, force_rebuild=rebuild)
except Exception as exc:
    st.error(f"Failed to initialize RAG engine: {exc}")
    st.stop()

for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])
        if msg.get("sources"):
            with st.expander("View sources"):
                for idx, src in enumerate(msg["sources"], start=1):
                    md = src["metadata"]
                    st.markdown(
                        f"**Source {idx}** | score={src['score']} | "
                        f"title={md.get('title')} | category={md.get('category')} | "
                        f"date={md.get('date')} | row_id={md.get('row_id')}"
                    )
                    st.write(src["text"])

user_query = st.chat_input("Type your SEBI compliance question...")

if user_query:
    st.session_state.messages.append({"role": "user", "content": user_query})
    with st.chat_message("user"):
        st.markdown(user_query)

    with st.chat_message("assistant"):
        with st.spinner("Searching regulations and generating response..."):
            result = rag_engine.answer(
                question=user_query,
                top_k=top_k,
                model=model_name,
                temperature=temperature,
            )
        answer = result["answer"]
        st.markdown(answer)
        st.caption(f"Mode: {result['mode']}")

        if result.get("sources"):
            with st.expander("View sources"):
                for idx, src in enumerate(result["sources"], start=1):
                    md = src["metadata"]
                    st.markdown(
                        f"**Source {idx}** | score={src['score']} | "
                        f"title={md.get('title')} | category={md.get('category')} | "
                        f"date={md.get('date')} | row_id={md.get('row_id')}"
                    )
                    st.write(src["text"])

    st.session_state.messages.append(
        {
            "role": "assistant",
            "content": answer,
            "sources": result.get("sources", []),
        }
    )
