import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db/mongodb";
import { Message, Thread } from "@/lib/db/models";
import { getSession } from "@/lib/auth/session";

// Get messages for a specific thread
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { threadId } = await params;
    let threadObjectId: mongoose.Types.ObjectId;
    try {
      threadObjectId = new mongoose.Types.ObjectId(threadId);
    } catch {
      return NextResponse.json({ error: "Invalid threadId" }, { status: 400 });
    }

    const thread = await Thread.collection.findOne({ _id: threadObjectId });
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const isCommunity = thread.mode === "community";
    if (!isCommunity && String(thread.userId) !== String(session.userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await Message.collection
      .find({ threadId: threadObjectId })
      .sort({ createdAt: 1 })
      .limit(200)
      .toArray();

    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 },
    );
  }
}
