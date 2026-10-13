import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/", request.url));
  for (const name of ["personaId", "organisatieId"]) {
    res.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
  return res;
}
