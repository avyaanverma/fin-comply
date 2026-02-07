import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { Message, Thread } from "@/lib/db/models";
import { getSession } from "@/lib/auth/session";

// Get all community threads
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Always filter for community mode
    const query = { mode: "community" };

    let threads = await Thread.find(query).sort({ updatedAt: -1 }).limit(50);

    if (threads.length === 0) {
      const seedThreads = [
        {
          title: "Clarification on recent SEBI circulars",
          prompt:
            "Can someone summarize the most impactful SEBI circulars from the last quarter?",
          response:
            "Here’s a concise overview of key circular themes: tighter disclosures, enhanced governance checks, and stronger investor grievance redressal timelines.",
        },
        {
          title: "LODR compliance for board meetings",
          prompt:
            "What are the must-do disclosures before and after board meetings under LODR?",
          response:
            "Pre-intimation for results/meetings and post-outcome disclosures are critical. Timelines depend on the event type, but same-day or next-day is common.",
        },
        {
          title: "KYC updates for existing clients",
          prompt:
            "How often should KYC updates be performed for retail investors?",
          response:
            "Periodic updates vary by risk category. Low-risk clients can be less frequent, while high-risk accounts require more regular refreshes.",
        },
      ];

      const createdThreads = await Thread.insertMany(
        seedThreads.map((t) => ({
          userId: session.userId,
          title: t.title,
          mode: "community",
          updatedAt: new Date(),
        })),
      );

      const messageDocs = createdThreads.flatMap((thread, idx) => [
        {
          threadId: thread._id,
          userId: session.userId,
          senderType: "user",
          content: seedThreads[idx].prompt,
        },
        {
          threadId: thread._id,
          userId: session.userId,
          senderType: "ai",
          content: seedThreads[idx].response,
          citations: [
            { title: "SEBI Official Website", source: "SEBI" },
            { title: "Compliance Handbook 2025", source: "SEBI" },
          ],
        },
      ]);

      await Message.insertMany(messageDocs);

      threads = await Thread.find(query).sort({ updatedAt: -1 }).limit(50);
    }

    return NextResponse.json({ threads }, { status: 200 });
  } catch (error) {
    console.error("Error fetching community threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch community threads" },
      { status: 500 },
    );
  }
}

// Create a new community thread
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json(); // Mode is fixed to 'community'

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 },
      );
    }

    const thread = new Thread({
      userId: session.userId,
      title,
      mode: "community", // Fixed to community
    });

    await thread.save();

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error("Error creating community thread:", error);
    return NextResponse.json(
      { error: "Failed to create community thread" },
      { status: 500 },
    );
  }
}
