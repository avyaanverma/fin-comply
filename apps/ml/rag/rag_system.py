import re
from .prompt import build_prompt


def _first_sentences(text, max_sentences=2):
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    return " ".join(sentences[:max_sentences]).strip()


class RAGSystem:
    def __init__(self, vector_store, min_similarity=0.3):
        self.vector_store = vector_store
        self.min_similarity = min_similarity

    def retrieve_context(self, query, top_k=5):
        results = self.vector_store.search(query, top_k=top_k)
        return [r for r in results if r["similarity_score"] >= self.min_similarity]

    def synthesize_answer(self, contexts):
        if not contexts:
            return "No relevant SEBI regulation found in the indexed data."

        snippets = []
        for idx, ctx in enumerate(contexts[:3], 1):
            snippet = _first_sentences(ctx["chunk_text"], max_sentences=2)
            if snippet:
                snippets.append(f"{snippet} [Source {idx}]")

        if not snippets:
            return "No relevant SEBI regulation found in the indexed data."

        return " ".join(snippets)

    def query(self, user_query, top_k=5):
        contexts = self.retrieve_context(user_query, top_k=top_k)
        prompt = build_prompt(user_query, contexts)
        answer = self.synthesize_answer(contexts)

        return {
            "query": user_query,
            "answer": answer,
            "contexts": contexts,
            "prompt": prompt,
            "sources_found": len(contexts),
        }
