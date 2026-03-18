import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongodb";
import { Message, Thread } from "@/lib/db/models";
import {
  getRagAnswer,
  getRagSummary,
  RagAnswer,
  RagSummaryResponse,
} from "./rag";

export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ProcessMessageParams {
  threadId: string;
  userId: string;
  content: string;
}

interface ProcessMessageResult {
  userMessage: Record<string, unknown>;
  aiMessage: Record<string, unknown>;
  ragAnswer: RagAnswer;
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
  };
}

function resolveSebiContext(threadDoc: any) {
  const sebiTitle =
    threadDoc?.sebi_title ??
    threadDoc?.sebiTitle ??
    threadDoc?.sebi?.title ??
    threadDoc?.sebiUpdateTitle ??
    threadDoc?.title ??
    "";

  const sebiSummary =
    threadDoc?.sebi_summary ??
    threadDoc?.sebiSummary ??
    threadDoc?.sebi?.summary ??
    threadDoc?.sebiUpdateSummary ??
    threadDoc?.sebiUpdateText ??
    threadDoc?.sebiText ??
    threadDoc?.sebiContext ??
    threadDoc?.sebi?.text ??
    "";

  return { sebiTitle, sebiSummary };
}

export async function processMessage({
  threadId,
  userId,
  content,
}: ProcessMessageParams): Promise<ProcessMessageResult> {
  if (!threadId || !content) {
    throw new HttpError(400, "threadId and content are required");
  }

  await connectDB();

  let threadObjectId: mongoose.Types.ObjectId;
  let userObjectId: mongoose.Types.ObjectId;
  try {
    threadObjectId = new mongoose.Types.ObjectId(threadId);
    userObjectId = new mongoose.Types.ObjectId(userId);
  } catch {
    throw new HttpError(400, "Invalid threadId or userId");
  }

  const threadDoc = await Thread.collection.findOne({ _id: threadObjectId });
  if (!threadDoc) {
    throw new HttpError(404, "Thread not found");
  }

  const isCommunity = threadDoc?.mode === "community";
  if (!isCommunity && String(threadDoc.userId) !== String(userId)) {
    throw new HttpError(403, "Forbidden");
  }

  const now = new Date();
  const userMessageDoc = {
    threadId: threadObjectId,
    userId: userObjectId,
    senderType: "user",
    content,
    createdAt: now,
  };

  const userInsertResult = await Message.collection.insertOne(userMessageDoc);
  const userMessage = {
    ...userMessageDoc,
    _id: userInsertResult.insertedId,
  };

  let { sebiTitle, sebiSummary } = resolveSebiContext(threadDoc);
  if (!sebiTitle) {
    sebiTitle = threadDoc?.title ?? "";
  }

  if (!sebiSummary) {
    const fallbackText = content || threadDoc?.title || threadDoc?.title || "SEBI question";
    const ragSummary = await getRagSummary({ body: fallbackText });
    const normalized = normalizeSummary(ragSummary);
    const derivedTitle = normalized.sebiTitle || threadDoc?.title || "";
    const derivedSummary = normalized.sebiSummary;

    if (!derivedSummary) {
      throw new HttpError(502, "Unable to generate SEBI summary for this thread");
    }

    sebiTitle = sebiTitle || derivedTitle;
    sebiSummary = derivedSummary;

    await Thread.collection.updateOne(
      { _id: threadObjectId },
      {
        $set: {
          sebi_title: sebiTitle,
          sebi_summary: sebiSummary,
        },
      },
    );
  }

  const ragAnswer = await getRagAnswer({
    sebi_title: sebiTitle,
    sebi_summary: sebiSummary,
    user_question: content,
  });

  const aiMessageDoc = {
    threadId: threadObjectId,
    userId: userObjectId,
    senderType: "ai",
    content: ragAnswer.user_answer ?? "",
    citations: ragAnswer.sources ?? [],
    createdAt: new Date(),
  };

  const aiInsertResult = await Message.collection.insertOne(aiMessageDoc);
  const aiMessage = {
    ...aiMessageDoc,
    _id: aiInsertResult.insertedId,
  };

  await Thread.collection.updateOne(
    { _id: threadObjectId },
    { $set: { updatedAt: new Date() } },
  );

  return { userMessage, aiMessage, ragAnswer };
}
