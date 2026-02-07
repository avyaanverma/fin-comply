export interface RagSource {
  document_title: string;
  category: string;
  source_url: string;
  published_date: string;
  chunk_text: string;
  similarity_score: number;
}

export interface RagAnswer {
  user_answer: string;
  sources: RagSource[];
}

interface RagRequestPayload {
  sebi_title: string;
  sebi_summary: string;
  user_question: string;
}

export async function getRagAnswer(
  payload: RagRequestPayload,
): Promise<RagAnswer> {
  const baseUrl = process.env.RAG_API_URL;
  if (!baseUrl) {
    throw new Error("RAG_API_URL is not configured");
  }

  const endpoint = `${baseUrl.replace(/\/$/, "")}/rag/answer`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `RAG API request failed (${response.status}): ${errorText}`,
    );
  }

  return response.json();
}
