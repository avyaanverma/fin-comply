import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import { Thread } from "@/lib/db/models";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const mode = req.nextUrl.searchParams.get("mode");
    if (mode !== "community" && mode !== "personal") {
      return NextResponse.json(
        { error: "mode must be 'community' or 'personal'" },
        { status: 400 },
      );
    }

    const query =
      mode === "community"
        ? { mode: "community" }
        : { mode: "personal", userId: session.userId };

    const threads = await Thread.find(query)
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    const response = threads.map((thread) => ({
      threadId: thread._id,
      title: thread.title,
      lastMessageAt: thread.updatedAt ?? thread.createdAt,
      mode: thread.mode,
    }));

    return NextResponse.json({ threads: response }, { status: 200 });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, mode } = await req.json();
    if (!title || (mode !== "community" && mode !== "personal")) {
      return NextResponse.json(
        { error: "title and valid mode are required" },
        { status: 400 },
      );
    }

    const thread = new Thread({
      userId: session.userId,
      title,
      mode,
    });

    await thread.save();

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 },
    );
  }
}
