import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // OAuth callback not needed with custom JWT auth
  // Redirect to dashboard if user is authenticated, login otherwise
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
