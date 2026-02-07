import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongodb";
import { User, Profile } from "@/lib/db/models";
import { getSession } from "@/lib/auth/session";

// Get current user profile
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findById(session.userId);
    const profile = await Profile.findOne({ userId: session.userId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        profile: profile || null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// Update user profile
export async function PUT(req: NextRequest) {
  try {
    await connectDB();

    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, companyStatus, industrySector, companySize } =
      await req.json();

    // Update user
    const user = await User.findByIdAndUpdate(
      session.userId,
      { name },
      { new: true },
    );

    // Update profile
    const profile = await Profile.findOneAndUpdate(
      { userId: session.userId },
      {
        companyStatus,
        industrySector,
        companySize,
        updatedAt: new Date(),
      },
      { new: true, upsert: true },
    );

    return NextResponse.json(
      {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        profile,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
