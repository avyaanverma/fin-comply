import { NextRequest, NextResponse } from "next/server";
import { answerSebiQuestion, HttpError } from "@/lib/orchestrator/ml";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const result = await answerSebiQuestion({
      sebiTitle: payload["sebi-title"],
      sebiSummary: payload["sebi-summary"],
      userQuestion: payload["user-question"],
    });

    return NextResponse.json(
      {
        "sebi-title": result.sebiTitle,
        "sebi-summary": result.sebiSummary,
        "user-question": result.userQuestion,
        "user-answer": result.userAnswer,
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof HttpError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Error answering SEBI question:", error);
    return NextResponse.json(
      { error: "Failed to answer SEBI question" },
      { status: 500 },
    );
  }
}
