import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { HttpError, processMessage } from "@/lib/orchestrator/messages";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId, content } = await req.json();
    const { userMessage, aiMessage } = await processMessage({
      threadId,
      content,
      userId: String(session.userId),
    });

    return NextResponse.json(
      {
        userMessage,
        aiMessage,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Error processing message:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 },
    );
  }
}
