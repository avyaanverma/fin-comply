import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { Thread } from "@/lib/db/models";
import { getSession } from "@/lib/auth/session";

// Get all personal threads for the current user
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Always filter for personal mode and current user
    const query = { userId: session.userId, mode: "personal" };

    const threads = await Thread.find(query).sort({ updatedAt: -1 }).limit(50);

    return NextResponse.json({ threads }, { status: 200 });
  } catch (error) {
    console.error("Error fetching personal threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch personal threads" },
      { status: 500 },
    );
  }
}

// Create a new personal thread
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json(); // Mode is fixed to 'personal'

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 },
      );
    }

    const thread = new Thread({
      userId: session.userId,
      title,
      mode: "personal", // Fixed to personal
    });

    await thread.save();

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error("Error creating personal thread:", error);
    return NextResponse.json(
      { error: "Failed to create personal thread" },
      { status: 500 },
    );
  }
}
