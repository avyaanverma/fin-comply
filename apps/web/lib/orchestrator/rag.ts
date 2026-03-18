const baseUrl = process.env.RAG_API_URL?.trim().replace(/\/$/, "");
if (!baseUrl) {
  throw new Error("RAG_API_URL is not configured");
}

async function sendRagRequest<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const endpoint = `${baseUrl}${path}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`RAG API request failed (${response.status}): ${errorText}`);
  }

  return response.json();
}

export interface RagSource {
  document_title: string;
  category?: string;
  source_url?: string;
  published_date?: string;
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

interface RagSummaryPayload {
  body: string;
}

export interface RagSummaryResponse {
  "sebi-title"?: string;
  "sebi-summary"?: string;
  date?: string;
  sebi_title?: string;
  sebi_summary?: string;
  sebiTitle?: string;
  sebiSummary?: string;
}

export async function getRagSummary(
  payload: RagSummaryPayload,
): Promise<RagSummaryResponse> {
  return sendRagRequest("/rag/summary", payload);
}

export async function getRagAnswer(
  payload: RagRequestPayload,
): Promise<RagAnswer> {
  return sendRagRequest("/rag/answer", payload);
}
