import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  //const sessionToken = req.cookies.get("google-session-token")?.value;
  const sessionToken = req.cookies.get('auth_token')?.value;

  if (pathname === "/login" && sessionToken) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (pathname === "/" || pathname === "") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  const protectedRoutes = ["/admin", "/dashboard"];

  if (protectedRoutes.some(route => pathname.startsWith(route))) {
    if (pathname === "/dashboard/profile") {
      return NextResponse.next();
    }

    if (!sessionToken) {
      return NextResponse.redirect(new URL("/signin", req.url));
    }
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/", "/admin/:path*", "/dashboard/:path*", "/login"],
};