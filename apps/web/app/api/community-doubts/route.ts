import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { CommunityDoubt } from "@/lib/db/models";
import { getSession } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: Fetch by threadId if provided
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId");

    let query: any = {};
    if (threadId) {
      query = { threadId };
    }

    const communityDoubts = await CommunityDoubt.find(query)
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 doubts for now

    return NextResponse.json({ communityDoubts }, { status: 200 });
  } catch (error) {
    console.error("Error fetching community doubts:", error);
    return NextResponse.json(
      { error: "Failed to fetch community doubts" },
      { status: 500 },
    );
  }
}
