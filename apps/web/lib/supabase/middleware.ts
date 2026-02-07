// lib/auth/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { verifyToken } from "./tokens";

export async function updateSession(request: NextRequest) {
  // Check if user has valid auth token
  const token = request.cookies.get("auth_token")?.value;

  const isAuthPage = request.nextUrl.pathname.startsWith("/auth");
  const isPublicPage = request.nextUrl.pathname === "/";

  if (!token && !isAuthPage && !isPublicPage) {
    // User is not authenticated and trying to access protected page
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (token) {
    // Verify token is still valid
    const payload = verifyToken(token);
    if (!payload && !isAuthPage && !isPublicPage) {
      // Token is invalid, redirect to login
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      return NextResponse.redirect(url);
    }
  }

  // If user is authenticated and on auth page, redirect to dashboard
  if (token && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next({ request });
}
