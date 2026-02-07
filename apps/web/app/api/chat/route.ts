import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { HttpError, processMessage } from "@/lib/orchestrator/messages";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, threadId } = await req.json();

    const { aiMessage, ragAnswer } = await processMessage({
      threadId,
      content: message,
      userId: String(session.userId),
    });

    return NextResponse.json({
      success: true,
      response: ragAnswer.user_answer,
      citations: ragAnswer.sources,
      timestamp: Date.now(),
      messageId: aiMessage._id,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("Chat API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process message",
        response: "An error occurred while processing your message.",
        citations: [],
      },
      { status: 500 },
    );
  }
}
