import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  BERICHTENBOX_VARIANT_COOKIE,
  isBerichtenboxVariant,
} from "@/app/(private)/instellingen/_featureFlags";

export function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;
  const lastSegment = pathname.split("/").at(-1) ?? "";

  // Assets must keep their original paths, even when a persona cookie exists.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    // Inloggen staat buiten het portaal van de persona.
    pathname.startsWith("/inloggen") ||
    /\.[^/]+$/.test(lastSegment) ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt"
  ) {
    return NextResponse.next();
  }

  // If a personaId is present in the query parameters, set it as a cookie
  const qpPersona = url.searchParams.get("persona");
  if (qpPersona && qpPersona.trim() !== "") {
    console.log(`Setting personaId cookie from query param: ${qpPersona}`);
    // remove the query param so we don't keep redirecting with it
    url.searchParams.delete("persona");

    const res = NextResponse.redirect(url);
    // set cookie readable from client-side JS (not httpOnly)
    res.cookies.set("personaId", qpPersona, {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return res;
  }

  // ?variant=b kiest een variant van de Berichtenbox A/B/C-test, voor
  // links in een UX-onderzoek. Daarna geldt de keuze in het Flags-paneel.
  const qpVariant = url.searchParams.get("variant")?.toLowerCase();
  if (qpVariant && isBerichtenboxVariant(qpVariant)) {
    url.searchParams.delete("variant");
    const res = NextResponse.redirect(url);
    res.cookies.set(BERICHTENBOX_VARIANT_COOKIE, qpVariant, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
    });
    return res;
  }

  const personaId = req.cookies.get("personaId")?.value;

  if (personaId) {
    const prefix = `/${encodeURIComponent(personaId)}`;

    //removing persona from visible URL
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      url.pathname = pathname.slice(prefix.length) || "/";
      return NextResponse.redirect(url);
    }

    // rewriting home page for persona
    if (pathname === "/") {
      url.pathname = `${prefix}/`;
      return NextResponse.rewrite(url);
    }

    const segments = pathname.split("/").filter(Boolean);

    // rewriting public page for persona
    if (segments.length > 0) {
      url.pathname = `${prefix}${pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  // No persona cookie: leave the request path as-is
  return NextResponse.next();
}

export const config = {
  // apply to all routes — filter inside middleware to avoid matching internals
  matcher: ["/:path*"],
};
