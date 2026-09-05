import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth?.backendToken && !req.auth?.error;
  const isLoginPage = req.nextUrl.pathname.startsWith("/login");

  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", req.nextUrl);
    if (req.auth?.error) {
      loginUrl.searchParams.set("error", req.auth.error);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
