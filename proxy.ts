import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("dashboard_session");
  const secret  = process.env.SESSION_SECRET;

  // Si le secret n'est pas configuré ou que le cookie ne correspond pas → login
  if (!session || !secret || session.value !== secret) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
