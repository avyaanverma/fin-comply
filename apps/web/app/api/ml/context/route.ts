import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  createCommunityThreadFromContext,
  HttpError,
} from "@/lib/orchestrator/ml";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { body } = await req.json();
    const result = await createCommunityThreadFromContext({
      body,
      userId: session.userId,
    });

    return NextResponse.json(
      {
        "sebi-title": result.sebiTitle,
        "sebi-summary": result.sebiSummary,
        date: result.date,
        threadId: result.threadId,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Error creating SEBI context:", error);
    return NextResponse.json(
      { error: "Failed to create SEBI context" },
      { status: 500 },
    );
  }
}
