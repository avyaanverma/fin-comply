"use client";

// Client-side session utilities
// For server-side, use lib/auth/session.ts instead

/**
 * Get the authenticated user session from API endpoint
 * (Client-safe version)
 */
export async function getAuthSession() {
  try {
    const response = await fetch("/api/auth/session", {
      credentials: "include",
    });
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Check if user is authenticated (Client-safe version)
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const response = await fetch("/api/auth/session", {
      credentials: "include",
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Get current user from session (Client-safe version)
 */
export async function getCurrentUser() {
  try {
    const response = await fetch("/api/auth/session", {
      credentials: "include",
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return {
      id: data.userId,
      email: data.email,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}
