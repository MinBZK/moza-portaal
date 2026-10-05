import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/", request.url));
  // expire the personaId cookie (match attributes used when setting it - see proxy.ts)
  res.cookies.set("personaId", "", {
    path: "/",
    maxAge: 0,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return res;
}
