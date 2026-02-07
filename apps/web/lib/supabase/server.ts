// lib/db/server.ts
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongodb";
import { User, Profile } from "@/lib/db/models";

/**
 * Get authenticated session on server
 */
export async function getServerSession() {
  return getSession();
}

/**
 * Get current user profile from database
 */
export async function getUserProfile() {
  try {
    await connectDB();
    const session = await getSession();

    if (!session) {
      return null;
    }

    const profile = await Profile.findOne({ userId: session.userId }).populate(
      "userId",
    );
    return profile;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  try {
    await connectDB();
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    console.error("Error getting user:", error);
    return null;
  }
}
