def build_context_block(contexts):
    lines = []
    for idx, ctx in enumerate(contexts, 1):
        lines.append(
            "\n".join(
                [
                    f"[Source {idx}]",
                    f"Title: {ctx['document_title']}",
                    f"Category: {ctx['category']}",
                    f"Date: {ctx['published_date']}",
                    f"URL: {ctx['source_url']}",
                    f"Relevance: {ctx['similarity_score']:.2%}",
                    "Content:",
                    ctx["chunk_text"],
                    "---",
                ]
            )
        )
    return "\n\n".join(lines)


def build_prompt(query, contexts):
    if not contexts:
        return (
            "You are FinComply AI, a SEBI compliance expert.\n\n"
            f"USER QUERY: {query}\n\n"
            "RESPONSE: I don't have specific SEBI regulations on this topic in my current database."
        )

    context_text = build_context_block(contexts)

    return (
        "You are FinComply AI, a SEBI compliance expert. Use ONLY the provided context to answer.\n\n"
        "CRITICAL RULES:\n"
        "1. Answer ONLY using information from the context below\n"
        "2. If the context doesn't contain the answer, say so clearly\n"
        "3. ALWAYS cite sources using [Source N] notation\n"
        "4. Never make up regulations\n"
        "5. Be precise and factual\n\n"
        f"CONTEXT:\n{context_text}\n\n"
        f"USER QUERY: {query}\n\n"
        "RESPONSE (with citations):"
    )
