import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongodb";
import { Message, Thread } from "@/lib/db/models";
import {
  getRagAnswer,
  getRagSummary,
  RagSummaryResponse,
} from "@/lib/orchestrator/rag";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface CreateContextParams {
  body: string;
  userId: string;
}

interface CreateContextResult {
  sebiTitle: string;
  sebiSummary: string;
  date?: string;
  threadId: string;
}

interface QuestionParams {
  sebiTitle: string;
  sebiSummary: string;
  userQuestion: string;
}

interface QuestionResult {
  sebiTitle: string;
  sebiSummary: string;
  userQuestion: string;
  userAnswer: string;
}

function normalizeSummary(response: RagSummaryResponse) {
  const sebiTitle =
    response["sebi-title"] ??
    response.sebi_title ??
    response.sebiTitle ??
    "";

  const sebiSummary =
    response["sebi-summary"] ??
    response.sebi_summary ??
    response.sebiSummary ??
    "";

  return {
    sebiTitle,
    sebiSummary,
    date: response.date,
  };
}

export async function createCommunityThreadFromContext({
  body,
  userId,
}: CreateContextParams): Promise<CreateContextResult> {
  if (!body?.trim()) {
    throw new HttpError(400, "body is required");
  }

  await connectDB();

  let userObjectId: mongoose.Types.ObjectId;
  try {
    userObjectId = new mongoose.Types.ObjectId(userId);
  } catch {
    throw new HttpError(400, "Invalid userId");
  }

  const ragSummary = await getRagSummary({ body });
  const { sebiTitle, sebiSummary, date } = normalizeSummary(ragSummary);

  if (!sebiTitle || !sebiSummary) {
    throw new HttpError(502, "RAG summary response missing required fields");
  }

  const now = new Date();
  const thread = await Thread.collection.insertOne({
    userId: userObjectId,
    title: sebiTitle,
    mode: "community",
    createdAt: now,
    updatedAt: now,
  });

  await Message.collection.insertOne({
    threadId: thread.insertedId,
    userId: userObjectId,
    senderType: "ai",
    content: sebiSummary,
    createdAt: now,
  });

  return {
    sebiTitle,
    sebiSummary,
    date,
    threadId: thread.insertedId.toString(),
  };
}

export async function answerSebiQuestion({
  sebiTitle,
  sebiSummary,
  userQuestion,
}: QuestionParams): Promise<QuestionResult> {
  if (!sebiTitle?.trim() || !sebiSummary?.trim() || !userQuestion?.trim()) {
    throw new HttpError(
      400,
      "sebi-title, sebi-summary, and user-question are required",
    );
  }

  const ragAnswer = await getRagAnswer({
    sebi_title: sebiTitle,
    sebi_summary: sebiSummary,
    user_question: userQuestion,
  });

  return {
    sebiTitle,
    sebiSummary,
    userQuestion,
    userAnswer: ragAnswer.user_answer ?? "",
  };
}
