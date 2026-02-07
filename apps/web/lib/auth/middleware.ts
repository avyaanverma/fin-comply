import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  try {
    // Get auth token from cookies
    const token = request.cookies.get("auth_token")?.value;
    const { pathname } = request.nextUrl;

    // List of protected routes that require authentication
    const protectedRoutes = ["/dashboard", "/profile", "/settings"];
    const isProtectedRoute = protectedRoutes.some((route) =>
      pathname.startsWith(route),
    );

    // If requesting protected route without token, redirect to login
    if (isProtectedRoute && !token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/auth/login";
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.next();
  }
}
